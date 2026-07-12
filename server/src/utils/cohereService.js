import { CohereClientV2 } from 'cohere-ai';
import pRetry from 'p-retry';

/** Cached Cohere client — created once, reused across requests */
let co = null;

/** AI model — configurable via COHERE_MODEL env var */
const COHERE_MODEL = process.env.COHERE_MODEL || 'command-a-plus-05-2026';

function getClient() {
  if (!co) {
    co = new CohereClientV2({ token: process.env.COHERE_API_KEY });
  }
  return co;
}

/**
 * Classify raw OCR text into structured bill data using Cohere Command A (with retry).
 *
 * Extracts title, total amount, currency, and category from OCR output of Myanmar/English
 * utility bills and receipts.
 *
 * @param {string} rawText - Raw text from Vision OCR (extractTextFromImage)
 * @returns {Promise<{title: string, amount: number, category: string, currency: string}>}
 *
 * Categories: Electricity, Water, Internet, Phone, Shopping, Other
 * Currencies: MMK, USD, EUR, GBP, JPY, THB
 */
export async function classifyBillData(rawText) {
  const client = getClient();

  const doClassify = async () => {
    const response = await client.chat({
      model: COHERE_MODEL,
      messages: [
        {
          role: 'user',
          content: `You are a bill data extraction specialist for Myanmar utility bills and receipts.

Your task: read OCR text and return structured data.

MYANMAR NUMERALS (you MUST convert these to digits):
၀→0 ၁→1 ၂→2 ၃→3 ၄→4 ၅→5 ၆→6 ၇→7 ၈→8 ၉→9

MYANMAR TOTAL KEYWORDS (these indicate the bill total):
"စုစုပေါင်း", "စုစုပေါင်းငွေ", "ကျသင့်ငွေ", "ကျသင့်ငွေ", "သွင်းငွေ", "ပေးဆောင်ရန်", "ပေးချေရန်"
"If you see these keywords, the number AFTER them is the TOTAL."

CATEGORIES:
- "Electricity" — electric utility (YESB, MESC, Yangon Electricity, လျှပ်စစ်)
- "Water" — water supply (YCDC, City Development, ရေ)
- "Internet" — broadband/fiber (MPT Fiber, Ooredoo, MyTel)
- "Phone" — mobile top-up or postpaid (Telenor, Ooredoo, MPT)
- "Shopping" — retail receipts (CityMart, Junction, Myanmar Plaza, supermarket)
- "Other" — medical, transport, or anything not fitting above

CURRENCY DETECTION:
Detect the currency of the bill from symbols, text, or context:
- "$" or "USD" or "US Dollar" → "USD"
- "€" or "EUR" or "Euro" → "EUR"
- "£" or "GBP" or "Pound" → "GBP"
- "¥" or "JPY" or "Yen" → "JPY"
- "฿" or "THB" or "Baht" → "THB"
- "K" or "Ks" or "MMK" or "Kyat" → "MMK"
- If the bill is from Myanmar (Myanmar text, Myanmar company names) → "MMK"
- Default to "MMK" if unsure

RULES:
1. TITLE: identify from company name, bill type, or header. Use "Unknown Bill" only if truly unclear.
2. AMOUNT: extract the TOTAL as a number in the bill's original currency. Remove currency symbols, "MMK", "Ks", "Kyat", commas, Myanmar commas "၊", and spaces. Convert Myanmar numerals first.
   Examples: "25,000" → 25000. "၁၅,၀၀၀" → 15000. "15000 MMK" → 15000. "$145.67" → 145.67.
   CRITICAL: Do NOT extract years (2024, 2025, ၂၀၂၄, ၂၀၂၅) as amounts. A 4-digit number is a YEAR, not a bill amount. If the only number you see is a 4-digit year, return 0 for amount.
   If amount is unclear or looks like a year, return 0.
3. CATEGORY: pick exactly one from the list above. Look for company names and bill-type keywords in BOTH English and Myanmar.
4. CURRENCY: detect from the bill. Use the currency detection rules above.

Return ONLY valid JSON. No markdown, no explanation.

Now extract from this OCR text:

---
${rawText}
---`,
        },
      ],
      responseFormat: {
        type: 'json_object',
        jsonSchema: {
          type: 'object',
          properties: {
            title:    { type: 'string' },
            amount:   { type: 'number' },
            category: { type: 'string', enum: ['Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'] },
            currency: { type: 'string', enum: ['MMK', 'USD', 'EUR', 'GBP', 'JPY', 'THB'] },
          },
          required: ['title', 'amount', 'category', 'currency'],
        },
      },
    });

    // Cohere v2 returns content as an array of blocks.
    const contents = response.message?.content || [];
    const textBlock = contents.find((c) => c.type === 'text');
    let text = textBlock?.text || '{}';
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    console.log('[cohere] Raw text:', text.substring(0, 200));

    try {
      const parsed = JSON.parse(text);
      // Default currency to MMK if not detected
      if (!parsed.currency || !['MMK', 'USD', 'EUR', 'GBP', 'JPY', 'THB'].includes(parsed.currency)) {
        parsed.currency = 'MMK';
      }
      console.log(`[cohere] Parsed: title="${parsed.title}" amount=${parsed.amount} currency="${parsed.currency}" category="${parsed.category}"`);
      return parsed;
    } catch (parseErr) {
      console.error('[cohere] Unparseable output:', text.substring(0, 300));
      return { title: 'Unknown Bill', amount: 0, category: 'Other', currency: 'MMK' };
    }
  };

  return pRetry(doClassify, { retries: 2, minTimeout: 1000 });
}
