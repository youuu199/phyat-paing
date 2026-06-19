---
name: bill-organizer:test-pipeline
description: End-to-end test of the upload → Cloudinary → Vision OCR → Gemini AI → MongoDB save pipeline. Activates when user wants to verify the full pipeline works, debug OCR/AI output, or test with a sample bill image.
---

# Test Pipeline — Bill Organizer

Test the full pipeline end-to-end: upload image → Cloudinary → Vision OCR → Gemini classification → MongoDB save.

## Prerequisites
- All environment variables set (use `/setup-env` first if needed)
- All services configured (Cloudinary, Vision, Gemini, MongoDB)
- Backend running or testable via direct module imports

## Step-by-Step Test

### Step 1: Test Cloudinary Upload (isolated)

```javascript
// server/src/test-pipeline.js (partial)
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const result = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'test', public_id: `pipeline-test-${Date.now()}`, resource_type: 'image' },
    (err, res) => err ? reject(err) : resolve(res)
  );
  stream.end(Buffer.from('test'));
});

console.log('✓ Cloudinary upload OK:', result.secure_url);
console.log('  Public ID:', result.public_id);
```

### Step 2: Test Vision OCR (isolated)

```javascript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

// Test with a local image file
const [result] = await client.documentTextDetection({
  image: { source: { imageUri: 'https://placehold.co/600x400?text=Test+Bill' } },
  imageContext: { languageHints: ['en', 'my'] },
});

console.log('✓ Vision OCR OK');
console.log('  Text:', result.fullTextAnnotation?.text?.substring(0, 100) || '(no text found)');
```

### Step 3: Test Gemini Classification (isolated)

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sampleText = `Yangon Electricity Supply Corporation
Bill for March 2025
Amount: 25,000 MMK
Due Date: 15 April 2025`;

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: `Extract bill info from this text:\n\n${sampleText}`,
  config: {
    systemInstruction: 'You extract bill data into JSON. Return ONLY valid JSON.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        amount: { type: 'number' },
        category: { type: 'string', enum: ['Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'] },
      },
      required: ['title', 'amount', 'category'],
    },
  },
});

const data = JSON.parse(response.text);
console.log('✓ Gemini OK:', data);
// Expected: { title: "...", amount: 25000, category: "Electricity" }
```

### Step 4: Test MongoDB Save (isolated)

```javascript
import mongoose from 'mongoose';
import Bill from './models/Bill.js';

await mongoose.connect(process.env.MONGODB_URI);

const bill = await Bill.create({
  title: 'Test Bill',
  amount: 10000,
  category: 'Other',
  imageUrl: 'https://example.com/test-image.jpg',
  rawText: 'Test OCR text...',
});

console.log('✓ MongoDB save OK:', bill._id);
await Bill.findByIdAndDelete(bill._id);  // cleanup
await mongoose.disconnect();
```

### Step 5: Full Pipeline (integrated)

Call the combined endpoint (if running) or import all modules and chain them:

```javascript
// Full pipeline test
async function testFullPipeline(imagePath) {
  // 1. Upload to Cloudinary → get URL
  const { url, publicId } = await uploadToCloudinary(fs.readFileSync(imagePath), 'test-bill.jpg', 'image/jpeg');

  // 2. OCR via Vision
  const rawText = await extractTextFromImage(fs.readFileSync(imagePath));

  // 3. Classify via Gemini
  const billData = await classifyBillData(rawText);

  // 4. Save to MongoDB
  const bill = await Bill.create({
    ...billData,
    imageUrl: url,
    cloudinaryPublicId: publicId,
    rawText,
  });

  console.log('✓ Full pipeline OK:', bill);
  return bill;
}
```

## Verification Checklist
- [ ] Cloudinary: image uploaded, secure URL accessible in browser
- [ ] Vision: raw text extracted (contains recognizable text from the image)
- [ ] Gemini: JSON returned with valid `title`, `amount` (number), `category` (valid enum)
- [ ] MongoDB: document saved with all fields, `_id` assigned, `cloudinaryPublicId` stored, `createdAt` auto-set
- [ ] Category is one of: Electricity, Water, Internet, Phone, Shopping, Other

## Common Failures & Fixes

| Symptom | Likely Cause |
|---------|-------------|
| `MongooseServerSelectionError` | MongoDB not running, or `localhost` instead of `127.0.0.1` |
| `Cloud config is not specified` | `CLOUDINARY_CLOUD_NAME` / API_KEY / API_SECRET not set in .env |
| `upload_stream is not a function` | Using `upload()` with a Buffer — use `upload_stream()` |
| `401 Unauthorized` (Vision) | Using API key instead of service account credentials |
| Gemini `404 model not found` | Wrong model string — use `gemini-2.5-flash` not `gemini-pro` |
| `E11000 duplicate key` | Not a real error in test — just delete the duplicate and retry |
| Vision returns empty text | Image has no text, or wrong language hints — try adding `['my', 'en']` |
