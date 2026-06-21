# CLAUDE.md — Smart All-in-One Bill Organizer

## Project Overview

A MERN web app that lets users upload images of utility bills/receipts, extracts data via OCR (Tesseract.js) and AI classification (Cohere), and displays them on a filterable dashboard. Includes JWT-based user authentication with httpOnly cookies and per-user bill isolation.

**Data flow:** Upload image → Cloudinary → Tesseract OCR → Cohere AI → MongoDB → React Dashboard

## Tech Stack (exact versions — do NOT use alternatives)

| Layer | Package | Key Constraint |
|-------|---------|---------------|
| Frontend | Vite + React-TS | `npm create vite@latest client -- --template react-ts` |
| Backend | Express 5.x | `import express from 'express'` |
| Database | Mongoose 9.x | No `useNewUrlParser`/`useUnifiedTopology` (removed in v6+) |
| File Upload | multer | `memoryStorage()` — file on `req.file.buffer` |
| Image Storage | cloudinary | `upload_stream()` NOT `upload()` for Buffers |
| OCR | tesseract.js | `createWorker('eng+mya')` + `createScheduler()` for concurrent jobs. `scheduler.addJob('recognize', buffer)` NOT single worker |
| AI | cohere-ai | Model `command-a-plus-05-2026` (configurable via `COHERE_MODEL`). `response_format` with schema |
| Auth | jsonwebtoken + bcryptjs | JWT in httpOnly cookie + `Authorization: Bearer <token>` header. `req.userId` set by auth middleware |
| CORS | cors | `npm install cors` (not built into Express) |
| Security | helmet, express-rate-limit | Security headers + rate limiting |
| Logging | pino, pino-http | Structured JSON logging |
| Cookies | cookie-parser | Parse httpOnly auth cookies |

## Project Structure

```
pyat-paing/
├── client/                        # Vite React-TS (port 5173)
│   ├── index.html                 # Entry HTML — MUST be at root, NOT in public/
│   ├── src/
│   │   ├── main.tsx               # ReactDOM.createRoot entry
│   │   ├── App.tsx                # App shell with ErrorBoundary
│   │   ├── types.ts               # Shared TypeScript interfaces
│   │   └── components/
│   │       ├── AuthContext.tsx     # JWT auth, apiFetch, backend-down detection
│   │       ├── AuthPage.tsx       # Login/register form
│   │       ├── BillDashboard.tsx  # Main dashboard with search, filters
│   │       ├── BillCard.tsx       # Bill card (view, edit, delete with confirmation)
│   │       ├── BillEditModal.tsx  # Modal for editing bill details
│   │       ├── BillUploader.tsx   # Upload with progress stages
│   │       ├── CategoryTabs.tsx   # Category filter tabs
│   │       ├── Sidebar.tsx        # Date filter sidebar
│   │       ├── Toast.tsx          # Toast notifications
│   │       └── ErrorBoundary.tsx  # React error boundary
│   ├── package.json
│   └── vite.config.ts             # Add server.proxy for /api → backend
├── server/                        # Express backend (port 5000)
│   ├── src/
│   │   ├── server.js              # Entry point — app.listen(PORT) + graceful shutdown
│   │   ├── app.js                 # Express app with middleware, routes, API versioning
│   │   ├── routes/                # Express Routers (rate limited)
│   │   ├── controllers/           # Request handlers
│   │   ├── models/                # Mongoose models (Bill, User with lockout)
│   │   ├── middleware/            # Custom middleware (multer, auth with cookie support)
│   │   ├── config/                # db.js (production-safe)
│   │   └── utils/
│   │       ├── ocrService.js      # Tesseract.js scheduler pool
│   │       ├── cohereService.js   # Cohere structured JSON (cached client, retry)
│   │       ├── cloudinaryStorage.js # Cloudinary upload/delete (retry)
│   │       └── logger.js          # Pino structured logger
│   ├── .env.example               # Template — copy to .env
│   └── package.json               # type: "module" (ESM)
├── docs/
│   └── superpowers/specs/         # Design docs + audit reports
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
import pRetry from 'p-retry';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload from Buffer (multer memoryStorage) with retry
async function uploadFromBuffer(buffer, options = {}) {
  const doUpload = () => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
  return pRetry(doUpload, { retries: 2, minTimeout: 1000 });
}

// Delete with retry
async function deleteFromCloudinary(publicId) {
  const doDelete = () => cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
  return pRetry(doDelete, { retries: 2, minTimeout: 1000 });
}
```
- ❌ Do NOT use `cloudinary.uploader.upload(buffer)` — expects file path or URL, not Buffer
- ❌ Do NOT call `upload()` with a raw Buffer as first argument
- ❌ `upload_stream()` returns a stream, NOT a Promise — wrap in Promise
- ❌ Do NOT look for `uploader.uploadBuffer()` — it does not exist

### Tesseract.js (OCR)
```javascript
import Tesseract from 'tesseract.js';
import os from 'os';
import path from 'path';

// Use a scheduler (worker pool) for concurrent OCR — single worker serializes jobs
const scheduler = Tesseract.createScheduler();

// Create multiple workers for the pool
const workers = await Promise.all(
  Array.from({ length: 3 }, () =>
    Tesseract.createWorker('eng+mya', 1, {
      cachePath: path.join(os.tmpdir(), 'tesseract-cache'), // Use temp dir, not hardcoded path
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
- ❌ Do NOT hardcode cache path — use `os.tmpdir()` for portability

### Cohere (Command A)
```javascript
import { CohereClientV2 } from 'cohere-ai';
import pRetry from 'p-retry';

// Cache client at module level (don't create on every request)
let co = null;
function getClient() {
  if (!co) co = new CohereClientV2({ token: process.env.COHERE_API_KEY });
  return co;
}

const COHERE_MODEL = process.env.COHERE_MODEL || 'command-a-plus-05-2026';

async function classifyBillData(rawText) {
  const client = getClient();

  const doClassify = async () => {
    const response = await client.chat({
      model: COHERE_MODEL,
      messages: [{
        role: 'user',
        content: `You extract bill data. Return ONLY valid JSON.\n\nExtract bill data from this text:\n\n${rawText}`,
      }],
      responseFormat: {
        type: 'json_object',
        jsonSchema: {
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

    const contents = response.message?.content || [];
    const textBlock = contents.find((c) => c.type === 'text');
    let text = textBlock?.text || '{}';
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(text);
  };

  return pRetry(doClassify, { retries: 2, minTimeout: 1000 });
}
```
- ❌ Do NOT use `CohereClient` (v1) — always use `CohereClientV2` (v2)
- ❌ Do NOT use `system` role in messages — Cohere v2 only supports `user`/`assistant`; fold system prompt into user content
- ❌ Do NOT use `command-nightly` in production — use `command-a-plus-05-2026`
- ❌ Do NOT forget `responseFormat.jsonSchema` — `{ type: "json_object" }` alone doesn't enforce structure
- ❌ Do NOT assume `response.message.content[0].text` — find the text block by type
- ❌ Do NOT create `CohereClientV2` on every request — cache at module level
- ❌ Do NOT hardcode model name — use `COHERE_MODEL` env var

### Mongoose
```javascript
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/bill-organizer');
// Or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/bill-organizer?retryWrites=true&w=majority

// For local dev without Atlas: mongodb-memory-server fallback (NEVER in production)
if (process.env.NODE_ENV !== 'production') {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

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
- ❌ Do NOT fall back to mongodb-memory-server in production — data would be lost on restart

### Express + Multer + Auth
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import logger from './utils/logger.js';

const app = express();

// Request logging
app.use(pinoHttp({ logger }));

// Security headers
app.use(helmet());

// CORS (strict in production)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL  // Must be set in production
    : ['http://localhost:5173'],
  credentials: true,
}));

// Parse cookies + JSON
app.use(cookieParser());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/v1/upload', auth, upload.single('image'), handler);
// File at: req.file.buffer, req.file.mimetype, req.file.originalname

// JWT auth middleware (reads from httpOnly cookie OR Authorization header)
function auth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.slice(7);
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = payload.userId;
  next();
}

// Set httpOnly cookie
function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

// Error handler MUST be last, MUST have 4 args:
app.use((err, req, res, next) => {
  req.log.error({ err }, 'Request error');
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

app.listen(process.env.PORT || 5000);
```
- ❌ Do NOT install `body-parser` — `express.json()` is built-in since Express 4.16
- ❌ Do NOT put `index.html` in `public/` — Vite requires it at project root
- ❌ Do NOT skip auth middleware on `/api/bills` routes — all bills must be user-scoped
- ❌ Do NOT store JWT only in localStorage — use httpOnly cookies (XSS-safe)
- ❌ Do NOT send `err.message` to client in production — use generic "Internal Server Error"
- ❌ Do NOT skip helmet — security headers are required
- ❌ Do NOT skip rate limiting on auth/upload endpoints

## Environment Variables (server/.env)

```
MONGODB_URI=mongodb://127.0.0.1:27017/bill-organizer
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
COHERE_API_KEY=<key-from-dashboard.cohere.com>
COHERE_MODEL=command-a-plus-05-2026
JWT_SECRET=<random-256-bit-secret>
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
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

# Hardcoded Tesseract cache path (should use os.tmpdir())
grep -rn "tesseract-cache" server/src/ | grep -v "os.tmpdir"

# Cohere client not cached (should be at module level)
grep -rn "new CohereClientV2" server/src/ | grep -v "getClient\|let co"

# Hardcoded Cohere model (should use env var)
grep -rn "command-a-plus" server/src/ | grep -v "COHERE_MODEL"

# In-memory MongoDB in production (data loss risk!)
grep -rn "MongoMemoryServer" server/src/ | grep -v "NODE_ENV"
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

## Security Features

- **httpOnly cookies:** JWT tokens stored in httpOnly cookies (XSS-safe)
- **Rate limiting:** Auth endpoints (20/15min), upload endpoints (10/min)
- **Account lockout:** Locks after 5 failed attempts for 15 minutes
- **Helmet:** Security headers (CSP, X-Frame-Options, HSTS)
- **Strong passwords:** Minimum 8 characters with at least one number
- **Email validation:** Proper email format validation via `validator.isEmail()`
- **CORS:** Strict origin validation in production
- **Error sanitization:** Generic error messages in production
- **Request timeout:** 120s timeout prevents hung requests
- **Graceful shutdown:** Closes DB connections and Tesseract workers on SIGTERM/SIGINT

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
