# Firebase Storage → Cloudinary Migration Plan

## Phase 0: Documentation Discovery

### Cloudinary Node.js SDK — Allowed APIs

| Method | Signature | Use |
|--------|-----------|-----|
| Config | `cloudinary.config({ cloud_name, api_key, api_secret, secure: true })` | One-time init |
| Upload | `upload_stream(options, callback)` → stream | Upload from Buffer (multer) |
| Delete | `cloudinary.uploader.destroy(publicId, { invalidate: true })` | Delete by public_id |
| URL Build | `cloudinary.url(publicId, { fetch_format, quality, secure })` | Transform URL (no API call) |

### Anti-patterns (Cloudinary)
- ❌ `upload()` with a Buffer — expects file path, URL, or base64 data URI
- ❌ `uploader.uploadBuffer()` — does not exist
- ❌ `upload_stream()` returns a stream, NOT a Promise — must wrap in Promise
- ❌ `cloudinary.url()` makes NO network call — purely a URL builder

---

## Phase 1: Install SDK + Verify

- [x] `npm install cloudinary` — 2 packages added, 0 vulns
- [x] `server/src/cloudinary-onboard.js` — uploads demo image, prints metadata, transforms, cleans up
- [x] Live test: uploaded 864×576 JPEG (109,669 bytes), transformed URL generated, deleted OK

---

## Phase 2: Replace Firebase with Cloudinary

### 2.1 New File
- [x] `server/src/utils/cloudinaryStorage.js` — `uploadToCloudinary(buffer, name, mime)` + `deleteFromCloudinary(publicId)`
  - Uses `upload_stream()` wrapped in Promise for async/await
  - `secure: true` — all URLs are HTTPS
  - `resource_type: 'image'` + `folder: 'bill-organizer'`
  - Returns `{ url: secure_url, publicId: public_id }`

### 2.2 Updated Models
- [x] `server/src/models/Bill.js` — added `cloudinaryPublicId: { type: String, default: '' }`, updated comment

### 2.3 Updated Controller
- [x] `server/src/controllers/billController.js`
  - `createBill`: uses `uploadToCloudinary()` → saves `{ imageUrl: result.url, cloudinaryPublicId: result.publicId }`
  - `deleteBill`: attempts `deleteFromCloudinary(bill.cloudinaryPublicId)` after MongoDB delete

### 2.4 Updated Routes
- [x] `server/src/routes/upload.js` — switched imports from `firebaseStorage.js` to `cloudinaryStorage.js`
  - POST `/api/upload` returns `{ url, publicId }` instead of just `imageUrl`
  - DELETE `/api/upload` uses `publicId` query param instead of `url`

### 2.5 Updated Server
- [x] `server/src/server.js` — removed `initFirebase()` call, removed firebase import

### 2.6 Updated Env
- [x] `server/.env` — added `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [x] `server/.env.example` — added Cloudinary section, removed Firebase section

### 2.7 Cleanup
- [x] Deleted `server/src/config/firebase.js`
- [x] Deleted `server/src/utils/firebaseStorage.js`
- [x] Removed `firebase-admin` from `server/package.json`
- [x] `CLAUDE.md` — updated project structure, Firebase → Cloudinary throughout

---

## Phase 3: Verification

- [x] TypeScript + Vite build: 22 modules, 0 errors
- [x] All backend modules import cleanly
- [x] Stub backend works with `cloudinaryPublicId` field
- [x] Full pipeline test with Cloudinary + Vision + Cohere + MongoDB

## Gemini → Cohere Migration (2026-06-19)

- [x] `server/src/utils/cohereService.js` — created, replaces geminiService.js
- [x] `server/src/controllers/billController.js` — imports from cohereService.js
- [x] `server/src/utils/geminiService.js` — deleted
- [x] `server/package.json` — replaced `@google/genai` with `cohere-ai`
- [x] `server/.env.example` — replaced `GEMINI_API_KEY` with `COHERE_API_KEY`
- [x] All `.claude/agents/` updated (pipeline-debugger, mern-reviewer, ai-ocr-specialist)
- [x] All `.claude/skills/` updated (test-pipeline, code-review, setup-env, extract-categorize-bill)
- [x] `.claude/plans/01-bill-organizer.md` — Firebase → Cloudinary, Gemini → Cohere throughout
- [x] `CLAUDE.md` — anti-pattern checklist updated for Cohere
- [x] `README.md` — already reflects Cloudinary + Cohere stack
