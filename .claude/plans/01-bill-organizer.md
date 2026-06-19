# Smart All-in-One Bill Organizer — Implementation Plan

## Tech Stack (Concrete Versions)

| Layer | Package | Import/Usage |
|-------|---------|-------------|
| Frontend | React 19 (Vite `react-ts` template) | `npm create vite@latest client -- --template react-ts` |
| Backend | Express 4.x | `import express from 'express'` |
| Database | Mongoose 8.x | `import mongoose from 'mongoose'` |
| File Upload | multer | `import multer from 'multer'` |
| CORS | cors | `import cors from 'cors'` |
| Image Storage | cloudinary | `import { v2 as cloudinary } from 'cloudinary'` |
| OCR | tesseract.js | `import Tesseract from 'tesseract.js'` |
| AI | cohere-ai | `import { CohereClientV2 } from 'cohere-ai'` |

## Allowed APIs (from Phase 0 documentation discovery)

### Cloudinary (Image Storage)
- `cloudinary.config({ cloud_name, api_key, api_secret, secure: true })` — configure from env vars
- `cloudinary.uploader.upload_stream(options, callback)` — upload from Buffer (wrap in Promise)
- `cloudinary.uploader.destroy(publicId)` — delete an image
- `cloudinary.url(publicId, transforms)` — build transformed URL
- **Anti-pattern**: Do NOT use `upload()` with a Buffer (expects file path or URL). Always wrap `upload_stream()` in a Promise. Import as `{ v2 as cloudinary }`.

### Tesseract.js (OCR)
- `Tesseract.createScheduler()` — synchronous, NOT awaited. Creates a worker pool for concurrent OCR.
- `Tesseract.createWorker('eng+mya', 1, { cachePath })` — create a worker with English + Myanmar language support
- `scheduler.addWorker(worker)` — add worker to pool
- `scheduler.addJob('recognize', imageBuffer)` — recognize text from Buffer (concurrent-safe)
- Response: `{ data: { text, confidence, words, lines, paragraphs } }`
- **Anti-pattern**: Do NOT use a single `createWorker()` + `worker.recognize()` for concurrent requests — it serializes jobs and causes timeouts. Do NOT use `@google-cloud/vision`.

### Cohere Command A
- `new CohereClientV2({ token })` from `cohere-ai`
- `co.chat({ model: 'command-a-plus-05-2026', messages: [{ role: 'user', content }], response_format: { type: 'json_object', schema } })`
- `JSON.parse(response.message.content[0].text)` to get the structured object
- **Anti-pattern**: Do NOT use `CohereClient` (v1). Do NOT use `system` role in messages. Do NOT forget `response_format.schema` — `{ type: "json_object" }` alone doesn't enforce structure.

### Mongoose
- `mongoose.connect(uri)` — do NOT pass `useNewUrlParser`, `useUnifiedTopology`, `useFindAndModify`, `useCreateIndex` (removed in Mongoose 6+)
- `new Schema({...}, { timestamps: true })` — `timestamps` adds `createdAt`/`updatedAt`
- `Model.create({...})`, `Model.find({...})`, `Model.findByIdAndDelete(id)`
- **Anti-pattern**: Connection string use `127.0.0.1` not `localhost` (avoids IPv6 resolution issues)

---

## Phase 1: Project Scaffolding & Folder Structure

### What to implement
1. Scaffold Vite React-TS project in `client/` directory
2. Create `server/` directory with Express boilerplate
3. Create shared folder structure for both

### Commands
```bash
# From project root
npm create vite@latest client -- --template react-ts
mkdir -p server/src/{routes,controllers,models,middleware,config,utils}
```

### Target folder structure
```
pyat-paing/
├── client/                    # Vite React-TS app
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

### Verification
- [ ] `ls client/package.json` exists
- [ ] `ls client/vite.config.ts` exists
- [ ] `ls server/src/` has all subdirectories
- [ ] `cd client && npm install` runs without errors
- [ ] `cd server && npm init -y` creates package.json

---

## Phase 2: Backend Boilerplate (Express + MongoDB + Cloudinary Init)

### What to implement
1. `server/package.json` with dependencies: express, cors, mongoose, dotenv, cloudinary, @google-cloud/vision, cohere-ai, multer
2. `server/src/app.js` — Express app with cors, express.json(), error handler
3. `server/src/server.js` — entry point that imports app and listens on PORT
4. `server/src/config/db.js` — Mongoose connect wrapper
5. `server/src/config/cloudinaryStorage.js` — Cloudinary config using env vars

### Documentation references
- Express boilerplate: official Express docs — `app.use(express.json())`, 4-arg error middleware
- Mongoose connect: `mongoose.connect(uri)` without deprecated options
- Cloudinary config: `cloudinary.config({ cloud_name, api_key, api_secret, secure: true })`

### Verification
- [ ] `node server/src/server.js` starts without crash (will fail on DB if no MongoDB, but Express should listen)
- [ ] `console.log('MongoDB connected')` prints on successful connection
- [ ] Cloudinary config does not throw (validates at first API call, not at init time)

---

## Phase 3: Image Upload Logic (Multer + Cloudinary Storage)

### What to implement
1. `server/src/middleware/upload.js` — multer config with memoryStorage (stores file as Buffer on `req.file`)
2. `server/src/utils/cloudinaryStorage.js` — `uploadToCloudinary(buffer)` function that:
   - Takes multer file object `{ buffer, mimetype, originalname }`
   - Calls `bucket.file(path).save(buffer, { contentType })`
   - Calls `file.makePublic()` OR `getDownloadURL(file)`
   - Returns the public URL string
3. `server/src/routes/upload.js` — POST `/api/upload` route using multer middleware + Cloudinary upload

### Documentation references
- Multer memoryStorage: `multer({ storage: multer.memoryStorage() })` — file is available as `req.file.buffer`
- Cloudinary upload_stream(): `cloudinary.uploader.upload_stream(options, callback)` wrapped in Promise
- Cloudinary secure URL: `result.secure_url` — Cloudinary stores publicId for later deletion

### Verification
- [ ] POST multipart/form-data to `/api/upload` saves file to Cloudinary
- [ ] Response contains the public URL of the uploaded image
- [ ] Opening the URL in browser shows the image

---

## Phase 4: OCR & AI Integration

### What to implement
1. `server/src/utils/ocrService.js` — `extractTextFromImage(imageBuffer)` function:
   - Creates a Tesseract scheduler with a pool of workers (`eng+mya` language)
   - Calls `scheduler.addJob('recognize', imageBuffer)` for concurrent-safe OCR
   - Returns extracted text string
2. `server/src/utils/cohereService.js` — `classifyBillData(rawText)` function:
   - Creates `CohereClientV2({ token: COHERE_API_KEY })`
   - Calls `co.chat()` with user prompt containing the raw text
   - Uses `response_format: { type: 'json_object', schema }` matching: `{ title: String, amount: Number, category: String }`
   - Categories: Electricity, Water, Internet, Phone, Shopping, Other
   - Finds text block by `.type === 'text'` (Cohere may wrap in thinking blocks)
   - Returns parsed JSON object

### Documentation references
- Tesseract: `createScheduler()` → `createWorker('eng+mya')` → `addWorker()` → `addJob('recognize', buffer)`
- Cohere: `co.chat({ model: 'command-a-plus-05-2026', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object', schema: { ... } } })`

### Verification
- [ ] Calling `extractTextFromImage()` with a test bill image returns raw text containing amounts/dates
- [ ] Calling `classifyBillData()` with Myanmar or English bill text returns valid JSON
- [ ] JSON output has correct shape: `{ title, amount, category }`
- [ ] Category is one of the valid enum values
- [ ] Concurrent uploads don't timeout (scheduler pool handles multiple jobs)

---

## Phase 5: Database Routing (Mongoose Model + CRUD Endpoints)

### What to implement
1. `server/src/models/Bill.js` — Mongoose schema:
   ```javascript
   {
     title:     { type: String, required: true },
     amount:    { type: Number, required: true },
     category:  { type: String, enum: ['Electricity','Water','Internet','Phone','Shopping','Other'], required: true },
     imageUrl:  { type: String, required: true },
     rawText:   { type: String },          // original OCR text for debugging
     createdAt: from timestamps
   }
   ```
2. `server/src/controllers/billController.js` — handlers:
   - `createBill(req, res)` — POST, saves bill doc from request body
   - `getBills(req, res)` — GET, returns all bills, supports `?category=` query filter
   - `deleteBill(req, res)` — DELETE `/:id`
3. `server/src/routes/billRoutes.js` — Express Router mounting controller handlers
4. Combined `/api/bills` upload + OCR + AI + save pipeline endpoint

### Documentation references
- Mongoose Schema: `new Schema({...}, { timestamps: true })`, `enum: [...]` for category
- Model.find filter: `Model.find(category ? { category } : {})`
- Express Router: `router.get('/', handler)`, `app.use('/api/bills', router)`

### Verification
- [ ] POST `/api/bills` creates a document in MongoDB
- [ ] GET `/api/bills` returns array of bills
- [ ] GET `/api/bills?category=Electricity` filters correctly
- [ ] DELETE `/api/bills/:id` removes document

---

## Phase 6: Frontend Development (Upload UI + Dashboard + Filters)

### What to implement
1. `client/src/App.tsx` — main app frame with routing/state
2. `client/src/components/BillUploader.tsx` — file input + upload form, POST to `/api/bills`
3. `client/src/components/BillDashboard.tsx` — card/list view of bills fetched from GET `/api/bills`
4. `client/src/components/CategoryTabs.tsx` — filter tabs bar (All, Electricity, Water, Internet, Phone, Shopping, Other)
5. `client/src/components/BillCard.tsx` — single bill card showing title, amount, category badge, image thumbnail
6. CSS styling (basic, clean)

### Documentation references
- React fetch pattern: `useEffect(() => { fetch('/api/bills').then(...) }, [selectedCategory])`
- Vite proxy config: `vite.config.ts` with `server.proxy` to forward `/api` to Express backend

### Verification
- [ ] File upload UI works (select file → upload → see results)
- [ ] Dashboard displays bills from MongoDB
- [ ] Category tabs filter the displayed bills
- [ ] Newly uploaded bill appears in dashboard without page refresh

---

## Phase 7: Final Verification

### Checklist
- [ ] Full e2e flow: upload image → OCR → AI classification → MongoDB save → dashboard display
- [ ] All errors are handled (no unhandled promise rejections)
- [ ] CORS works between Vite dev server and Express
- [ ] `.env.example` documents all required env vars
- [ ] `README.md` has setup instructions
- [ ] All npm scripts work: `npm run dev` (client), `npm run dev` (server)
