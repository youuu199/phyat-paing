# CLAUDE.md — Smart All-in-One Bill Organizer

## Project Overview

A MERN web app that lets users upload images of utility bills/receipts, extracts data via OCR (Google Cloud Vision) and AI classification (Gemini 2.5), and displays them on a filterable dashboard.

**Data flow:** Upload image → Cloudinary → Google Vision OCR → Gemini AI → MongoDB → React Dashboard

## Tech Stack (exact versions — do NOT use alternatives)

| Layer | Package | Key Constraint |
|-------|---------|---------------|
| Frontend | Vite + React-TS | `npm create vite@latest client -- --template react-ts` |
| Backend | Express 4.x | `import express from 'express'` |
| Database | Mongoose 8.x | No `useNewUrlParser`/`useUnifiedTopology` (removed in v6+) |
| File Upload | multer | `memoryStorage()` — file on `req.file.buffer` |
| Image Storage | cloudinary | `upload_stream()` NOT `upload()` for Buffers |
| OCR | @google-cloud/vision | `documentTextDetection()` NOT `textDetection()` |
| AI | @google/genai | Model `gemini-2.5-flash`. `config.systemInstruction` NOT top-level |
| CORS | cors | `npm install cors` (not built into Express) |

## Project Structure

```
pyat-paing/
├── client/                        # Vite React-TS (port 5173)
│   ├── index.html                 # Entry HTML — MUST be at root, NOT in public/
│   ├── src/
│   │   ├── main.tsx               # ReactDOM.createRoot entry
│   │   ├── App.tsx
│   │   └── components/            # React components go here
│   ├── package.json
│   └── vite.config.ts             # Add server.proxy for /api → backend
├── server/                        # Express backend (port 5000)
│   ├── src/
│   │   ├── server.js              # Entry point — app.listen(PORT)
│   │   ├── app.js                 # Express app with cors, json, error handler
│   │   ├── routes/                # Express Routers
│   │   ├── controllers/           # Request handlers
│   │   ├── models/                # Mongoose models
│   │   ├── middleware/            # Custom middleware (multer, etc.)
│   │   ├── config/                # db.js, firebase.js (legacy), cloudinaryStorage.js
│   │   └── utils/                 # ocrService.js, geminiService.js, cloudinaryStorage.js, firebaseStorage.js (legacy)
│   ├── .env.example               # Template — copy to .env
│   └── package.json               # type: "module" (ESM)
├── .gitignore                     # node_modules, .env, dist/, service account keys
└── CLAUDE.md
```

## Commands

```bash
# Frontend
cd client && npm install          # Install frontend deps
cd client && npm run dev          # Start Vite dev server (http://localhost:5173)

# Backend
cd server && npm install          # Install backend deps
cd server && npm run dev          # Start Express with --watch (http://localhost:5000)

# Seed database (after creating model and seed script)
cd server && node src/seed.js
```

## Allowed APIs (Phase 0 verified)

### Cloudinary (Image Storage)
```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload from Buffer (multer memoryStorage)
function uploadFromBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

const result = await uploadFromBuffer(buffer, {
  folder: 'bill-organizer',
  public_id: `bill_${Date.now()}`,
  resource_type: 'image',
});
// → { secure_url, public_id, width, height, format, bytes }

// Delete
await cloudinary.uploader.destroy(publicId, { invalidate: true });

// Transform URL (local URL builder — no API call)
const transformedUrl = cloudinary.url(publicId, {
  fetch_format: 'auto',  // f_auto
  quality: 'auto',       // q_auto
  secure: true,
});
```
- ❌ Do NOT use `cloudinary.uploader.upload(buffer)` — expects file path or URL, not Buffer
- ❌ Do NOT call `upload()` with a raw Buffer as first argument
- ❌ `upload_stream()` returns a stream, NOT a Promise — wrap in Promise
- ❌ Do NOT look for `uploader.uploadBuffer()` — it does not exist

### Google Cloud Vision
```javascript
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

// Buffer OR { image: { content: base64 } } OR { image: { source: { imageUri } } }
const [result] = await client.documentTextDetection(imageBuffer, {
  imageContext: { languageHints: ['en', 'my'] },
});
const rawText = result.fullTextAnnotation.text;
```
- ❌ Do NOT use `textDetection()` — only 10 annotations max. Use `documentTextDetection()` for bills
- ❌ Do NOT use API key auth — requires service account credentials
- ❌ The `private_key` MUST have literal `\n` newlines, not escaped `\\n`

### Google Gemini 2.5
```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: `Extract bill data from this text:\n\n${rawText}`,
  config: {
    systemInstruction: 'You extract bill data. Return ONLY valid JSON.',
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
const billData = JSON.parse(response.text);
```
- ❌ Do NOT use `gemini-pro` (legacy 1.0 — returns 404)
- ❌ Do NOT put `systemInstruction` at top level — it goes inside `config: { }`
- ❌ Do NOT use Google Cloud service account key with `@google/genai` — that requires Vertex AI, not Gemini API

### Mongoose
```javascript
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/bill-organizer');
// Or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/bill-organizer?retryWrites=true&w=majority

const billSchema = new Schema({
  title:    { type: String, required: true },
  amount:   { type: Number, required: true },
  category: { type: String, enum: ['Electricity','Water','Internet','Phone','Shopping','Other'], required: true },
  imageUrl: { type: String, required: true },
  rawText:  { type: String },
}, { timestamps: true });

const Bill = model('Bill', billSchema);
```
- ❌ Do NOT pass `useNewUrlParser`, `useUnifiedTopology`, `useFindAndModify`, `useCreateIndex` (removed in Mongoose 6)
- ❌ Do NOT use `localhost:27017` — use `127.0.0.1:27017` (avoids IPv6 resolution issues)
- ❌ Do NOT use `findByIdAndUpdate(id, update, { new: true })` — use `{ returnDocument: 'after' }`

### Express + Multer
```javascript
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());              // built-in since Express 4.16 — no body-parser needed
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/upload', upload.single('image'), handler);
// File at: req.file.buffer, req.file.mimetype, req.file.originalname

// Error handler MUST be last, MUST have 4 args:
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(process.env.PORT || 5000);
```
- ❌ Do NOT install `body-parser` — `express.json()` is built-in since Express 4.16
- ❌ Do NOT put `index.html` in `public/` — Vite requires it at project root

## Environment Variables (server/.env)

```
MONGODB_URI=mongodb://127.0.0.1:27017/bill-organizer
PORT=5000
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
GOOGLE_CLIENT_EMAIL=<service-account-email>
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GEMINI_API_KEY=<key-from-ai.google.dev>
```

## Anti-Pattern Checklist (run before commits)

```bash
# Mongoose deprecated options (must return nothing)
grep -rn "useNewUrlParser\|useUnifiedTopology\|useFindAndModify\|useCreateIndex" server/src/

# MongoDB localhost (should be 127.0.0.1)
grep -rn "localhost:27017" server/src/

# Cloudinary upload() with Buffer (use upload_stream() instead)
grep -rn "cloudinary\.uploader\.upload\s*(" server/src/

# Gemini wrong model name
grep -rn "gemini-pro\b" server/src/

# Vision wrong method
grep -rn "client\.textDetection" server/src/

# body-parser package (not needed)
grep -rn "body-parser" server/src/ server/package.json

# Cloudinary missing v2 import
grep -rn "from 'cloudinary'" server/src/ | grep -v "v2 as"
```

## Development Workflow

1. **Before writing any code:** Resolve docs via Context7 MCP for the library in question
2. **Small commits per phase:** See `.claude/plans/01-bill-organizer.md` for the 6-phase plan
3. **Vite proxy:** When frontend calls `/api/*`, add `server.proxy` in `vite.config.ts` to forward to `http://localhost:5000`
4. **Error handling:** Every `await mongoose.connect()`, `cloudinary.upload_stream()` (wrapped in Promise), Vision/Gemini call must be in try/catch
5. **Never commit:** `.env`, `serviceAccountKey.json`, `*-service-account.json`, API keys/secrets

## Project Skills & Agents

### Skills (`/` commands)

| Skill | Use |
|-------|-----|
| `bill-organizer:setup-env` | Configure all .env variables interactively |
| `bill-organizer:db-seed` | Seed MongoDB with 12 realistic test bills |
| `bill-organizer:test-pipeline` | Test upload→Cloudinary→Vision→Gemini→MongoDB end-to-end |
| `bill-organizer:code-review` | Grep-check for known anti-patterns |
| `bill-organizer:extract-categorize-bill` | Run Gemini 2.5 classification step standalone — debug AI output, reprocess stored rawText |
| `bill-organizer:upload-cloudinary-storage` | Test multer→Cloudinary upload in isolation — verify `upload_stream()`, credentials, URL generation |

### Agents

| Agent | Color | Focus |
|-------|-------|-------|
| `mern-reviewer` | red | MERN + Cloudinary anti-pattern detection (Mongoose deprecated opts, Cloudinary upload() vs upload_stream(), Gemini wrong model) |
| `pipeline-debugger` | yellow | Stage-by-stage pipeline failure isolation (Multer→Cloudinary→Vision→Gemini→MongoDB) |
| `backend-db-specialist` | blue | Express routing, Mongoose schema design, MongoDB aggregation, multer config, REST API patterns |
| `ai-ocr-specialist` | green | Vision OCR text detection, Gemini structured output, Myanmar+English prompt engineering, image preprocessing |
