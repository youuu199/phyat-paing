# CLAUDE.md — Smart All-in-One Bill Organizer

## Project Overview

A MERN web app that lets users upload images of utility bills/receipts, extracts data via OCR (Tesseract.js) and AI classification (Cohere), and displays them on a filterable dashboard. Includes JWT-based user authentication with per-user bill isolation.

**Data flow:** Upload image → Cloudinary → Tesseract OCR → Cohere AI → MongoDB → React Dashboard

## Tech Stack (exact versions — do NOT use alternatives)

| Layer | Package | Key Constraint |
|-------|---------|---------------|
| Frontend | Vite + React-TS | `npm create vite@latest client -- --template react-ts` |
| Backend | Express 4.x | `import express from 'express'` |
| Database | Mongoose 8.x | No `useNewUrlParser`/`useUnifiedTopology` (removed in v6+) |
| File Upload | multer | `memoryStorage()` — file on `req.file.buffer` |
| Image Storage | cloudinary | `upload_stream()` NOT `upload()` for Buffers |
| OCR | tesseract.js | `createWorker('eng+mya')` + `createScheduler()` for concurrent jobs. `scheduler.addJob('recognize', buffer)` NOT single worker |
| AI | cohere-ai | Model `command-a-plus-05-2026`. `response_format` with schema, NOT `config.systemInstruction` |
| Auth | jsonwebtoken + bcryptjs | JWT in `Authorization: Bearer <token>` header. `req.userId` set by auth middleware |
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
│   │   ├── models/                # Mongoose models (Bill, User)
│   │   ├── middleware/            # Custom middleware (multer, auth)
│   │   ├── config/                # db.js
│   │   └── utils/                 # ocrService.js, cohereService.js, cloudinaryStorage.js
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

### Tesseract.js (OCR)
```javascript
import Tesseract from 'tesseract.js';

// Use a scheduler (worker pool) for concurrent OCR — single worker serializes jobs
const scheduler = Tesseract.createScheduler();

// Create multiple workers for the pool
const workers = await Promise.all(
  Array.from({ length: 3 }, () =>
    Tesseract.createWorker('eng+mya', 1, {
      cachePath: '/home/vim/.tesseract-cache',
    })
  )
);
for (const w of workers) scheduler.addWorker(w);

// Recognize text from image buffer (concurrent-safe)
const { data } = await scheduler.addJob('recognize', imageBuffer);
const extractedText = data.text.trim();
// data also has: data.confidence (0-100), data.words, data.lines, data.paragraphs

// Shutdown all workers
await scheduler.terminate();
```
- ❌ Do NOT use a single `createWorker()` for concurrent requests — use `createScheduler()` with 3 workers
- ❌ Do NOT call `worker.recognize()` directly — use `scheduler.addJob('recognize', buffer)` for concurrency
- ❌ Do NOT use Google Cloud Vision (`@google-cloud/vision`) — the project uses free offline Tesseract.js
- ❌ `createScheduler()` is NOT an async factory — call it synchronously then add workers

### Cohere (Command A)
```javascript
import { CohereClientV2 } from 'cohere-ai';

const co = new CohereClientV2({ token: process.env.COHERE_API_KEY });

const response = await co.chat({
  model: 'command-a-plus-05-2026',
  messages: [{
    role: 'user',
    content: `You extract bill data. Return ONLY valid JSON.\n\nExtract bill data from this text:\n\n${rawText}`,
  }],
  response_format: {
    type: 'json_object',
    schema: {
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

// Find the text block (may be wrapped in thinking/content blocks)
const contents = response.message?.content || [];
const textBlock = contents.find((c) => c.type === 'text');
let text = textBlock?.text || '{}';
text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
const billData = JSON.parse(text);
```
- ❌ Do NOT use `CohereClient` (v1) — always use `CohereClientV2` (v2)
- ❌ Do NOT use `system` role in messages — Cohere v2 only supports `user`/`assistant`; fold system prompt into user content
- ❌ Do NOT use `command-nightly` in production — use `command-a-plus-05-2026`
- ❌ Do NOT forget `response_format.schema` — `{ type: "json_object" }` alone doesn't enforce structure
- ❌ Do NOT assume `response.message.content[0].text` — find the text block by type

### Mongoose
```javascript
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/bill-organizer');
// Or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/bill-organizer?retryWrites=true&w=majority

// For local dev without Atlas: mongodb-memory-server fallback
import { MongoMemoryServer } from 'mongodb-memory-server';
const mongod = await MongoMemoryServer.create();
const fallbackUri = mongod.getUri();
await mongoose.connect(fallbackUri);

const billSchema = new Schema({
  userId:              { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:               { type: String, required: true },
  amount:              { type: Number, required: true },
  category:            { type: String, enum: ['Electricity','Water','Internet','Phone','Shopping','Other'], required: true },
  imageUrl:            { type: String, required: true },
  cloudinaryPublicId:  { type: String },
  rawText:             { type: String },
}, { timestamps: true });

const Bill = model('Bill', billSchema);
```
- ❌ Do NOT pass `useNewUrlParser`, `useUnifiedTopology`, `useFindAndModify`, `useCreateIndex` (removed in Mongoose 6)
- ❌ Do NOT use `localhost:27017` — use `127.0.0.1:27017` (avoids IPv6 resolution issues)
- ❌ Do NOT use `findByIdAndUpdate(id, update, { new: true })` — use `{ returnDocument: 'after' }`
- ❌ Do NOT return all bills without userId filter — use `$match: { userId }` in aggregations

### Express + Multer + Auth
```javascript
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());              // built-in since Express 4.16 — no body-parser needed
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/upload', upload.single('image'), handler);
// File at: req.file.buffer, req.file.mimetype, req.file.originalname

// JWT auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.slice(7); // "Bearer <token>"
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = payload.userId;
  next();
}

// Error handler MUST be last, MUST have 4 args:
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(process.env.PORT || 5000);
```
- ❌ Do NOT install `body-parser` — `express.json()` is built-in since Express 4.16
- ❌ Do NOT put `index.html` in `public/` — Vite requires it at project root
- ❌ Do NOT skip auth middleware on `/api/bills` routes — all bills must be user-scoped

## Environment Variables (server/.env)

```
MONGODB_URI=mongodb://127.0.0.1:27017/bill-organizer
PORT=5000
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
COHERE_API_KEY=<key-from-dashboard.cohere.com>
JWT_SECRET=<random-256-bit-secret>
```

## Anti-Pattern Checklist (run before commits)

```bash
# Mongoose deprecated options (must return nothing)
grep -rn "useNewUrlParser\|useUnifiedTopology\|useFindAndModify\|useCreateIndex" server/src/

# MongoDB localhost (should be 127.0.0.1)
grep -rn "localhost:27017" server/src/

# Cloudinary upload() with Buffer (use upload_stream() instead)
grep -rn "cloudinary\.uploader\.upload\s*(" server/src/

# Cohere wrong client version (use CohereClientV2 not CohereClient v1)
grep -rn "from 'cohere-ai'" server/src/ | grep -v "CohereClientV2"

# Google Cloud Vision import (should NOT exist — we use Tesseract.js)
grep -rn "@google-cloud/vision" server/src/

# Tesseract single worker (should use scheduler for concurrency)
grep -rn "createWorker\|worker\.recognize" server/src/ | grep -v "createScheduler\|scheduler"

# body-parser package (not needed)
grep -rn "body-parser" server/src/ server/package.json

# Cloudinary missing v2 import
grep -rn "from 'cloudinary'" server/src/ | grep -v "v2 as"

# Bills without userId filter (all queries must be user-scoped)
grep -rn "Bill\.find\|Bill\.aggregate" server/src/ | grep -v "userId"
```

## Development Workflow

1. **Before writing any code:** Resolve docs via Context7 MCP for the library in question
2. **Small commits per phase:** See `.claude/plans/01-bill-organizer.md` for the phased plan
3. **Vite proxy:** When frontend calls `/api/*`, add `server.proxy` in `vite.config.ts` to forward to `http://localhost:5000`
4. **Error handling:** Every `await mongoose.connect()`, `cloudinary.upload_stream()` (wrapped in Promise), Tesseract/Cohere call must be in try/catch
5. **Never commit:** `.env`, `serviceAccountKey.json`, `*-service-account.json`, API keys/secrets
6. **Validation:** After OCR+AI, reject bills with `amount <= 0` or `title === 'Unknown Bill'` (422 + cleanup Cloudinary image)

## Pipeline Validation (Stage 4.5)

After Cohere classification, the backend validates extracted data:
- `amount <= 0` → rejects with 422 "No total amount could be detected"
- `title === 'Unknown Bill'` → rejects with 422 "This bill could not be identified"
- On rejection: Cloudinary image is deleted (no orphaned files)
- Response includes `code: 'UNRECOGNIZED_BILL'` for frontend alert handling

## Project Skills & Agents

### Skills (`/` commands)

| Skill | Use |
|-------|-----|
| `bill-organizer:setup-env` | Configure all .env variables interactively |
| `bill-organizer:db-seed` | Seed MongoDB with 12 realistic test bills |
| `bill-organizer:test-pipeline` | Test upload→Cloudinary→Tesseract→Cohere→MongoDB end-to-end |
| `bill-organizer:code-review` | Grep-check for known anti-patterns |
| `bill-organizer:extract-categorize-bill` | Run Cohere classification step standalone — debug AI output, reprocess stored rawText |
| `bill-organizer:upload-cloudinary-storage` | Test multer→Cloudinary upload in isolation — verify `upload_stream()`, credentials, URL generation |

### Agents

| Agent | Color | Focus |
|-------|-------|-------|
| `mern-reviewer` | red | MERN + Cloudinary anti-pattern detection (Mongoose deprecated opts, Cloudinary upload() vs upload_stream(), Cohere wrong client version) |
| `pipeline-debugger` | yellow | Stage-by-stage pipeline failure isolation (Multer→Cloudinary→Tesseract→Cohere→MongoDB) |
| `backend-db-specialist` | blue | Express routing, Mongoose schema design, MongoDB aggregation, multer config, REST API patterns |
| `ai-ocr-specialist` | green | Tesseract.js OCR, Cohere structured output, Myanmar+English prompt engineering, image preprocessing |
