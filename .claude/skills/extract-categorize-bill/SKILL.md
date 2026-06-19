---
name: bill-organizer:extract-categorize-bill
description: Takes raw OCR text and runs the Gemini 2.5 classification step to extract structured bill data. Use standalone for debugging AI output, reprocessing stored rawText, or testing prompt variations.
---

# Extract and Categorize Bill Data

Run the Gemini 2.5 classification step in isolation. Takes raw text (from OCR or manual input) and returns structured JSON with `title`, `amount`, and `category`.

## When to Use

- Debugging: the full pipeline saves a bill but category/amount is wrong — re-extract from stored `rawText`
- Prompt tuning: test different system instructions against the same raw text
- Batch reprocessing: fix misclassified bills already in MongoDB
- Dry-run testing: verify Gemini output WITHOUT consuming Cloudinary/Vision quota

## Prerequisites

- `GEMINI_API_KEY` in `server/.env`
- `@google/genai` installed: `npm install @google/genai`

## Usage

### Option A: Extract from text file or pasted text

Create a script that reads text and classifies it:

```javascript
// server/src/utils/classifyText.js
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function classifyBillData(rawText) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract bill information from the following OCR text:\n\n${rawText}`,
    config: {
      systemInstruction: `You are a bill data extraction specialist.
Extract the title, total amount (as a number), and category from OCR text.
Categories: Electricity, Water, Internet, Phone, Shopping, Other.
Return ONLY valid JSON.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          title:    { type: 'string' },
          amount:   { type: 'number' },
          category: { type: 'string', enum: ['Electricity','Water','Internet','Phone','Shopping','Other'] },
        },
        required: ['title', 'amount', 'category'],
      },
    },
  });

  return JSON.parse(response.text);
}

// CLI usage
const rawText = process.argv[2] || 'Yangon Electricity Supply Corporation\nMarch 2025 Bill\nTotal Amount: 25,000 MMK';
const result = await classifyBillData(rawText);
console.log(JSON.stringify(result, null, 2));
```

```bash
cd server && node src/utils/classifyText.js "Yangon Electricity, Total: 25000"
# { title: "Yangon Electricity Bill", amount: 25000, category: "Electricity" }
```

### Option B: Reprocess bills from MongoDB

```javascript
// server/src/utils/reprocessBills.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

await mongoose.connect(process.env.MONGODB_URI);

// Find bills that need reclassification (e.g., category "Other" that shouldn't be)
const bills = await Bill.find({ category: 'Other' });

for (const bill of bills) {
  if (!bill.rawText) {
    console.log(`Skipping ${bill._id} — no rawText stored`);
    continue;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Reclassify this bill:\n\n${bill.rawText}`,
    config: {
      systemInstruction: 'Recategorize. Return JSON with title, amount, category.',
      responseMimeType: 'application/json',
      responseSchema: { /* ... same schema ... */ },
    },
  });

  const newData = JSON.parse(response.text);
  await Bill.findByIdAndUpdate(bill._id, {
    title: newData.title,
    amount: newData.amount,
    category: newData.category,
  });
  console.log(`Updated ${bill._id}: ${newData.title} → ${newData.category}`);
}

await mongoose.disconnect();
```

### Option C: Interactive prompt testing

To test different system prompts against the same text:

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const rawText = `Your OCR text here...`;

const prompts = [
  { name: 'default', instruction: 'Extract bill data. Return JSON.' },
  { name: 'myanmar-focused', instruction: 'Extract bill data. The text contains Myanmar language. Look for "ကျသင့်ငွေ" for amount. Return JSON.' },
  { name: 'verbose', instruction: 'You are a Myanmar utility bill expert. Identify the biller, extract total, categorize precisely. Return JSON.' },
];

for (const prompt of prompts) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: rawText,
    config: {
      systemInstruction: prompt.instruction,
      responseMimeType: 'application/json',
      responseSchema: { /* ... */ },
    },
  });
  console.log(`[${prompt.name}]`, JSON.parse(response.text));
}
```

## Expected Output

```json
{
  "title": "March Electricity Bill",
  "amount": 25000,
  "category": "Electricity"
}
```

## Validation Checklist

- [ ] `title` is a non-empty string
- [ ] `amount` is a positive number (not NaN, not string, not negative)
- [ ] `category` is exactly one of: Electricity, Water, Internet, Phone, Shopping, Other
- [ ] Amount makes sense for the category (e.g., electricity 10k–100k MMK, phone top-up 1k–20k MMK)

## Common Fixes

| Problem | Fix |
|---------|-----|
| Amount is 0 | OCR text may not have the amount clearly — check rawText quality |
| Category always "Other" | System instruction needs Myanmar company/context hints |
| Title is "Unknown Bill" | OCR text may be garbled — improve image quality or Vision language hints |
| Gemini returns markdown | Check `responseMimeType: 'application/json'` is set in `config` |
| `response.text` throws on `JSON.parse` | Gemini may be wrapping JSON in markdown fences — strip with `.replace(/```json\n?/g, '').replace(/```/g, '').trim()` |

## Add to package.json
```json
"classify": "node src/utils/classifyText.js"
```
