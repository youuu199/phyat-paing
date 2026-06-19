# Smart All-in-One Bill Organizer — Implementation Plan

## Tech Stack (Concrete Versions)

| Layer | Package | Import/Usage |
|-------|---------|-------------|
| Frontend | React 19 (Vite `react-ts` template) | `npm create vite@latest client -- --template react-ts` |
| Backend | Express 4.x | `import express from 'express'` |
| Database | Mongoose 8.x | `import mongoose from 'mongoose'` |
| File Upload | multer | `import multer from 'multer'` |
| CORS | cors | `import cors from 'cors'` |
| Image Storage | firebase-admin | `import { initializeApp, cert } from 'firebase-admin/app'` |
| OCR | @google-cloud/vision | `import vision from '@google-cloud/vision'` |
| AI | @google/genai | `import { GoogleGenAI } from '@google/genai'` |

## Allowed APIs (from Phase 0 documentation discovery)

### Firebase Admin SDK
- `initializeApp({ credential: cert(serviceAccount), storageBucket: '...' })` from `firebase-admin/app`
- `getStorage().bucket()` from `firebase-admin/storage`
- `bucket.file(destination).save(buffer, { contentType })` → upload from Buffer
- `file.makePublic()` → make file publicly readable
- `getDownloadURL(file)` from `firebase-admin/storage` → returns `https://firebasestorage.googleapis.com/v0/b/...`
- **Anti-pattern**: Do NOT use `admin.storage().bucket()` (old namespace). Do NOT use `bucket.upload()` with a Buffer (use `file.save()`).

### Google Cloud Vision
- `new vision.ImageAnnotatorClient({ keyFilename })` OR `{ credentials: { client_email, private_key } }`
- `client.documentTextDetection(image)` — image can be Buffer OR `{ image: { content: base64 } }` OR `{ image: { source: { imageUri } } }`
- Response: `result[0].fullTextAnnotation.text`
- Language hints: `{ imageContext: { languageHints: ['en', 'my'] } }`
- **Anti-pattern**: Do NOT use API key (requires service account). Prefer `documentTextDetection` over `textDetection` for bills.

### Google Gemini 2.5
- `new GoogleGenAI({ apiKey })` from `@google/genai`
- `ai.models.generateContent({ model: 'gemini-2.5-flash', contents, config: { systemInstruction, responseMimeType: 'application/json', responseSchema } })`
- `JSON.parse(response.text)` to get the structured object
- **Anti-pattern**: Do NOT use `gemini-pro` (legacy). `systemInstruction` goes inside `config`, not at top level.

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

## Phase 2: Backend Boilerplate (Express + MongoDB + Firebase Init)

### What to implement
1. `server/package.json` with dependencies: express, cors, mongoose, dotenv, firebase-admin, @google-cloud/vision, @google/genai, multer
2. `server/src/app.js` — Express app with cors, express.json(), error handler
3. `server/src/server.js` — entry point that imports app and listens on PORT
4. `server/src/config/db.js` — Mongoose connect wrapper
5. `server/src/config/firebase.js` — Firebase Admin init using env vars

### Documentation references
- Express boilerplate: official Express docs — `app.use(express.json())`, 4-arg error middleware
- Mongoose connect: `mongoose.connect(uri)` without deprecated options
- Firebase init: `initializeApp({ credential: cert(serviceAccount), storageBucket })`

### Verification
- [ ] `node server/src/server.js` starts without crash (will fail on DB if no MongoDB, but Express should listen)
- [ ] `console.log('MongoDB connected')` prints on successful connection
- [ ] Firebase init does not throw (will succeed even without actual GCP project if `storageBucket` is set)

---

## Phase 3: Image Upload Logic (Multer + Firebase Storage)

### What to implement
1. `server/src/middleware/upload.js` — multer config with memoryStorage (stores file as Buffer on `req.file`)
2. `server/src/utils/firebaseStorage.js` — `uploadToFirebase(file)` function that:
   - Takes multer file object `{ buffer, mimetype, originalname }`
   - Calls `bucket.file(path).save(buffer, { contentType })`
   - Calls `file.makePublic()` OR `getDownloadURL(file)`
   - Returns the public URL string
3. `server/src/routes/upload.js` — POST `/api/upload` route using multer middleware + Firebase upload

### Documentation references
- Multer memoryStorage: `multer({ storage: multer.memoryStorage() })` — file is available as `req.file.buffer`
- Firebase file.save(): `bucket.file('uploads/xxx.jpg').save(buffer, { contentType })`
- Firebase makePublic() + public URL pattern: `https://storage.googleapis.com/${bucket.name}/${destination}`

### Verification
- [ ] POST multipart/form-data to `/api/upload` saves file to Firebase
- [ ] Response contains the public URL of the uploaded image
- [ ] Opening the URL in browser shows the image

---

## Phase 4: OCR & AI Integration

### What to implement
1. `server/src/utils/ocrService.js` — `extractTextFromImage(imageBuffer)` function:
   - Creates Vision client
   - Calls `client.documentTextDetection(imageBuffer)` with language hints `['en', 'my']`
   - Returns `result[0].fullTextAnnotation.text`
2. `server/src/utils/geminiService.js` — `classifyBillData(rawText)` function:
   - Creates `GoogleGenAI({ apiKey: GEMINI_API_KEY })`
   - Calls `ai.models.generateContent()` with system instruction + user prompt containing the raw text
   - Uses `responseMimeType: 'application/json'` and `responseSchema` matching: `{ title: String, amount: Number, category: String }`
   - Categories: Electricity, Water, Internet, Phone, Shopping, Other
   - Returns parsed JSON object

### Documentation references
- Vision: `client.documentTextDetection({ image: { content: base64 }, imageContext: { languageHints: ['en', 'my'] } })`
- Gemini: `ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, responseMimeType: 'application/json', responseSchema } })`

### Verification
- [ ] Calling `extractTextFromImage()` with a test bill image returns raw text containing amounts/dates
- [ ] Calling `classifyBillData()` with Myanmar or English bill text returns valid JSON
- [ ] JSON output has correct shape: `{ title, amount, category }`
- [ ] Category is one of the valid enum values

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
