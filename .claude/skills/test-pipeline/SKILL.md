---
name: bill-organizer:test-pipeline
description: End-to-end test of the upload → Cloudinary → Tesseract OCR → Cohere AI → MongoDB save pipeline. Activates when user wants to verify the full pipeline works, debug OCR/AI output, or test with a sample bill image.
---

# Test Pipeline — Bill Organizer

Test the full pipeline end-to-end: upload image → Cloudinary → Tesseract OCR → Cohere classification → MongoDB save.

## Prerequisites
- All environment variables set (use `/setup-env` first if needed)
- All services configured (Cloudinary, Cohere, MongoDB)
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

### Step 2: Test Tesseract OCR (isolated)

```javascript
import Tesseract from 'tesseract.js';

// Create a scheduler with a worker pool for concurrency
const scheduler = Tesseract.createScheduler();
const workers = await Promise.all(
  Array.from({ length: 3 }, () =>
    Tesseract.createWorker('eng+mya', 1, {
      cachePath: '/home/vim/.tesseract-cache',
    })
  )
);
for (const w of workers) scheduler.addWorker(w);

// Test with any image buffer (from file, multer, etc.)
const { data } = await scheduler.addJob('recognize', imageBuffer);

console.log('✓ Tesseract OCR OK');
console.log('  Text:', data.text?.substring(0, 100) || '(no text found)');
console.log('  Confidence:', Math.round(data.confidence), '%');

// Cleanup
await scheduler.terminate();
```

### Step 3: Test Cohere Classification (isolated)

```javascript
import { CohereClientV2 } from 'cohere-ai';

const co = new CohereClientV2({ token: process.env.COHERE_API_KEY });

const sampleText = `Yangon Electricity Supply Corporation
Bill for March 2025
Amount: 25,000 MMK
Due Date: 15 April 2025`;

const response = await co.chat({
  model: 'command-a-plus-05-2026',
  messages: [{
    role: 'user',
    content: `You extract bill data into JSON. Return ONLY valid JSON.

Extract from this text:

---
${sampleText}
---`,
  }],
  response_format: {
    type: 'json_object',
    schema: {
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

// Find the text block (Cohere may wrap in thinking blocks)
const contents = response.message?.content || [];
const textBlock = contents.find((c) => c.type === 'text');
let text = textBlock?.text || '{}';
text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

const data = JSON.parse(text);
console.log('✓ Cohere OK:', data);
// Expected: { title: "...", amount: 25000, category: "Electricity" }
```

### Step 4: Test MongoDB Save (isolated)

```javascript
import mongoose from 'mongoose';
import Bill from './models/Bill.js';

await mongoose.connect(process.env.MONGODB_URI);

const bill = await Bill.create({
  userId: new mongoose.Types.ObjectId(), // dummy user for test
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

  // 2. OCR via Tesseract
  const rawText = await extractTextFromImage(fs.readFileSync(imagePath));

  // 3. Classify via Cohere
  const billData = await classifyBillData(rawText);

  // 4. Validate (Stage 4.5)
  if (!billData.amount || billData.amount <= 0 || billData.title === 'Unknown Bill') {
    throw new Error('Bill validation failed — no amount detected or unknown title');
  }

  // 5. Save to MongoDB
  const bill = await Bill.create({
    ...billData,
    userId: testUserId,
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
- [ ] Tesseract: raw text extracted (contains recognizable text from the image, confidence > 50%)
- [ ] Cohere: JSON returned with valid `title`, `amount` (number), `category` (valid enum)
- [ ] Validation: bills with amount=0 or title="Unknown Bill" are rejected (422)
- [ ] MongoDB: document saved with all fields, `_id` assigned, `cloudinaryPublicId` stored, `createdAt` auto-set
- [ ] Category is one of: Electricity, Water, Internet, Phone, Shopping, Other

## Common Failures & Fixes

| Symptom | Likely Cause |
|---------|-------------|
| `MongooseServerSelectionError` | MongoDB not reachable — check URI or ensure in-memory fallback works |
| `Cloud config is not specified` | `CLOUDINARY_CLOUD_NAME` / API_KEY / API_SECRET not set in .env |
| `upload_stream is not a function` | Using `upload()` with a Buffer — use `upload_stream()` |
| `tesseract.js` worker hangs | Single worker serializing jobs — use `createScheduler()` with worker pool |
| `ENOENT: scandir /home/vim/.mongodb-memory` | Stale mongodb-memory directory — `rm -rf /home/vim/.mongodb-memory` |
| Cohere `404 model not found` | Wrong model string — use `command-a-plus-05-2026` not `command-r` |
| `response.message.content[0].text` is empty or wrong | Cohere wraps in thinking blocks — find text block by `.type === 'text'` |
| `E11000 duplicate key` | Not a real error in test — just delete the duplicate and retry |
| Tesseract returns empty text | Image has no text, or `eng+mya` traineddata missing — verify `server/eng.traineddata` and `server/mya.traineddata` are present |
| `createScheduler is not a function` | Tesseract.js may need update — `createScheduler()` is available since v5.x |
| 422 `UNRECOGNIZED_BILL` | Bill validation rejected it — amount was 0 or title was "Unknown Bill" |
