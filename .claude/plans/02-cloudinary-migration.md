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
- [x] `server/src/models/Bill.js` — added `cloudinaryPublicId: { type: String, default: '' }`

### 2.3 Updated Controller
- [x] `server/src/controllers/billController.js`
  - `createBill`: uses `uploadToCloudinary()` → saves `{ imageUrl: result.url, cloudinaryPublicId: result.publicId }`
  - `deleteBill`: attempts `deleteFromCloudinary(bill.cloudinaryPublicId)` after MongoDB delete

### 2.4 Updated Env
- [x] `server/.env` — added `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [x] `server/.env.example` — added Cloudinary section with placeholder values

### 2.5 Updated Docs
- [x] `CLAUDE.md` — Firebase → Cloudinary in tech stack, allowed APIs, env vars, anti-patterns

---

## Phase 3: Verification

- [x] TypeScript + Vite build: 22 modules, 0 errors
- [x] All 12 backend modules import (including cloudinaryStorage.js)
- [x] Stub backend works with `cloudinaryPublicId` field
- [ ] Full pipeline test with real Cloudinary upload (needs Vision + Gemini keys)

## What was NOT removed

- `server/src/utils/firebaseStorage.js` kept for reference — can be deleted later
- `server/src/config/firebase.js` kept (Firebase init still exists but is non-fatal)
- `firebase-admin` package not uninstalled (may still be useful for other Firebase services)

## Cleanup pending

- Delete `server/src/cloudinary-onboard.js` after confirmation (onboarding test script)
- Remove `firebase-admin` from package.json if no other Firebase services are needed
- Delete `server/src/utils/firebaseStorage.js` and `server/src/config/firebase.js`
