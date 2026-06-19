import { GoogleGenAI } from '@google/genai';

/**
 * Classify raw OCR text into structured bill data using Gemini 2.5 Flash.
 *
 * Extracts title, total amount, and category from OCR output of Myanmar/English
 * utility bills and receipts.
 *
 * @param {string} rawText - Raw text from Vision OCR (extractTextFromImage)
 * @returns {Promise<{title: string, amount: number, category: string}>}
 *
 * Categories:
 *   Electricity, Water, Internet, Phone, Shopping, Other
 *
 * Anti-patterns avoided:
 *  - Using 'gemini-pro' model name (legacy — returns 404)
 *  - systemInstruction at top level (must be inside config: {})
 *  - Forgetting responseMimeType: 'application/json' (Gemini won't output structured JSON)
 *  - Using service account key (Gemini API uses a simple API key)
 */
export async function classifyBillData(rawText) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',

    contents: `Extract bill information from the following OCR text. The text may contain both English and Myanmar (Burmese / မြန်မာ) language.

OCR TEXT:
---
${rawText}
---`,

    config: {
      systemInstruction: `You are a bill data extraction specialist for Myanmar utility bills and receipts.

Your task: read OCR text and return structured data.

CATEGORIES:
- "Electricity" — electric utility (YESB, MESC, Yangon Electricity, လျှပ်စစ်)
- "Water" — water supply (YCDC, City Development, ရေ)
- "Internet" — broadband/fiber (MPT Fiber, Ooredoo, MyTel)
- "Phone" — mobile top-up or postpaid (Telenor, Ooredoo, MPT)
- "Shopping" — retail receipts (CityMart, Junction, Myanmar Plaza, supermarket)
- "Other" — medical, transport, or anything not fitting above

RULES:
1. TITLE: identify from company name, bill type, or header. Use "Unknown Bill" only if truly unclear.
2. AMOUNT: extract the TOTAL as a number. Remove "MMK", "Ks", "Kyat", commas, and spaces. If you see 25,000 → return 25000. If amount is unclear, return 0.
3. CATEGORY: pick exactly one from the list above. Look for company names and bill-type keywords in BOTH English and Myanmar.

Return ONLY valid JSON. No markdown, no explanation.`,

      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          title:    { type: 'string' },
          amount:   { type: 'number' },
          category: { type: 'string', enum: ['Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'] },
        },
        required: ['title', 'amount', 'category'],
      },
    },
  });

  // Gemini with responseSchema should return clean JSON, but strip markdown fences
  // as a safety net in case it wraps the output
  let text = response.text || '{}';
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (parseErr) {
    console.error('Gemini returned unparseable output:', text.substring(0, 200));
    // Return a safe fallback so the pipeline doesn't crash
    return { title: 'Unknown Bill', amount: 0, category: 'Other' };
  }
}
