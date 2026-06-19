---
name: bill-organizer:setup-env
description: Interactive walkthrough to configure all .env variables for the Smart Bill Organizer. Activates when user needs to set up API keys, Cloudinary, MongoDB URI, or any environment variables for this project.
---

# Setup Environment Variables — Bill Organizer

Walk the user through each required environment variable from `server/.env.example`, one at a time. Do NOT just dump the template — ask for each value interactively.

## Required Variables

### 1. MongoDB Connection
```
MONGODB_URI=mongodb://127.0.0.1:27017/bill-organizer
```
- If local: use `mongodb://127.0.0.1:27017/bill-organizer` (not localhost — avoids IPv6 issues)
- If Atlas: use `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/bill-organizer?retryWrites=true&w=majority`
- If neither is available: the app auto-falls-back to `mongodb-memory-server` (in-memory, data lost on restart)
- Ask: "Local MongoDB, Atlas, or use auto-fallback?"

### 2. Server Port
```
PORT=5000
```
- Default `5000` is fine unless the user has a conflict. Ask if they want a different port.

### 3. Cloudinary (Image Storage)
```
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```
- Get these from: https://console.cloudinary.com/app/settings/api-keys
- Or use the single-connection-string form: `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
- **Cloud name**: found at the top of your Cloudinary dashboard
- **API secret**: click the eye icon to reveal it — treat like a password
- Remind: these keys should NEVER be committed to git (already in .gitignore)

### 4. Cohere API Key
```
COHERE_API_KEY=<key-from-dashboard.cohere.com>
```
- Get from: https://dashboard.cohere.com/api-keys
- This is a simple string (not a JSON object or service account)
- Model string to use: `command-a-plus-05-2026`

### 5. JWT Secret
```
JWT_SECRET=<random-256-bit-secret>
```
- Generate a random secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Used to sign and verify JWT tokens for user authentication
- Keep this secret — do NOT commit

## After Writing .env

Verify with:
```bash
cd server && node -e "import 'dotenv/config'; console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ set' : '✗ MISSING'); console.log('CLOUDINARY:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ set' : '✗ MISSING'); console.log('COHERE_KEY:', process.env.COHERE_API_KEY ? '✓ set' : '✗ MISSING'); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ set' : '✗ MISSING'); console.log('PORT:', process.env.PORT || 5000); console.log('OCR: Tesseract.js (offline — no API key needed)')"
```

## Anti-Pattern Warnings
- ❌ `localhost` instead of `127.0.0.1` in MongoDB URI
- ❌ `useNewUrlParser`, `useUnifiedTopology` in Mongoose options (removed in v6+)
- ❌ Using `upload()` with a Buffer instead of `upload_stream()` in Cloudinary
- ❌ `command-nightly` in production (use `command-a-plus-05-2026`)
- ❌ `CohereClient` (v1) instead of `CohereClientV2` (v2)
- ❌ Tesseract.js single worker — the app uses a scheduler pool automatically, no env config needed
