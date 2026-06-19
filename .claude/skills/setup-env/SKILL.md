---
name: bill-organizer:setup-env
description: Interactive walkthrough to configure all .env variables for the Smart Bill Organizer. Activates when user needs to set up API keys, Firebase, MongoDB URI, or any environment variables for this project.
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
- Ask: "Local MongoDB or Atlas?"

### 2. Server Port
```
PORT=5000
```
- Default `5000` is fine unless the user has a conflict. Ask if they want a different port.

### 3. Firebase Admin SDK
```
FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
FIREBASE_SERVICE_ACCOUNT=<full JSON string>
```
- **Storage bucket**: format is `<project-id>.appspot.com` (NOT `gs://...`)
- **Service account**: the ENTIRE service account JSON, compressed to a single line
- Warn the user: the private key MUST have literal `\n` newlines — escaped `\\n` will fail
- Remind: this key should NEVER be committed to git (already in .gitignore)

### 4. Google Cloud Vision
```
GOOGLE_CLIENT_EMAIL=<service-account-email>
GOOGLE_PRIVATE_KEY=<private-key-with-literal-newlines>
```
- Can reuse the same Firebase service account if it has Vision API permissions
- Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`
- Warn: **API keys do NOT work for text detection** — must use service account credentials

### 5. Gemini API Key
```
GEMINI_API_KEY=<key-from-ai-google-dev>
```
- Get from: https://aistudio.google.com/apikey or https://ai.google.dev
- This is a simple string (not a JSON object or service account)
- Model string to use: `gemini-2.5-flash` (for speed) or `gemini-2.5-pro` (for accuracy)

## After Writing .env

Verify with:
```bash
cd server && node -e "import 'dotenv/config'; console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ set' : '✗ MISSING'); console.log('FIREBASE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET ? '✓ set' : '✗ MISSING'); console.log('GEMINI_KEY:', process.env.GEMINI_API_KEY ? '✓ set' : '✗ MISSING'); console.log('VISION_CREDS:', (process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_APPLICATION_CREDENTIALS) ? '✓ set' : '✗ MISSING')"
```

## Anti-Pattern Warnings
- ❌ `localhost` instead of `127.0.0.1` in MongoDB URI
- ❌ `useNewUrlParser`, `useUnifiedTopology` in Mongoose options (removed in v6+)
- ❌ Using API key for Google Cloud Vision text detection (requires service account)
- ❌ Using Firebase Web API key instead of service account for Admin SDK
- ❌ `gemini-pro` model name (legacy 1.0 — use `gemini-2.5-flash`)
