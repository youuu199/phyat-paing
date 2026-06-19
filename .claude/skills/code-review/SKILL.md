---
name: bill-organizer:code-review
description: Reviews current changes for anti-patterns specific to this project's MERN + Cloudinary + Tesseract + Cohere stack. Activates on /code-review or when user asks to review recent code, check for bugs, or audit against Phase 0 allowed APIs.
---

# Code Review — Bill Organizer Stack

Review changed files against the **Allowed APIs** documented in `CLAUDE.md`.

## Anti-Pattern Checklist (must grep for each)

### Mongoose (6+ Migration)
```bash
grep -rn "useNewUrlParser\|useUnifiedTopology\|useFindAndModify\|useCreateIndex" server/src/
```
These options were removed in Mongoose 6. Any occurrence is a bug — they must be deleted.

### Mongoose `localhost` vs `127.0.0.1`
```bash
grep -rn "localhost:27017" server/src/
```
Node.js may resolve `localhost` to IPv6 `::1` while MongoDB listens on IPv4. Should be `127.0.0.1`.

### Cloudinary — `upload()` with Buffer
```bash
grep -rn "cloudinary\.uploader\.upload\s*(" server/src/
```
Must use `upload_stream()` wrapped in Promise for Buffer uploads. `upload()` expects file path string or URL, not a Buffer.

### Cloudinary — missing `v2` import
```bash
grep -rn "from 'cloudinary'" server/src/
```
Must be `import { v2 as cloudinary } from 'cloudinary'`. A bare `import cloudinary from 'cloudinary'` won't have `upload_stream()`.

### Google Cloud Vision — should NOT exist
```bash
grep -rn "@google-cloud/vision" server/src/ server/package.json
```
The project uses Tesseract.js for OCR (free, offline). No Google Cloud Vision imports should exist.

### Tesseract — single worker (should use scheduler)
```bash
grep -rn "createWorker\|\.recognize\s*(" server/src/utils/ocrService.js
```
Must use `createScheduler()` with multiple workers via `scheduler.addJob('recognize', buffer)`. A single `worker.recognize()` serializes concurrent uploads and causes timeouts.

### Cohere — wrong client version
```bash
grep -rn "from 'cohere-ai'" server/src/ | grep -v "CohereClientV2"
```
Must use `CohereClientV2` (v2). `CohereClient` (v1) uses a different API shape entirely.

### Cohere — system role in messages
```bash
grep -rn "role.*system" server/src/
```
Cohere v2 only supports `user`/`assistant` roles. Fold system instructions into the `user` message content instead.

### Cohere — missing response_format.schema
```bash
grep -rn "response_format" server/src/utils/cohereService.js
```
Must include both `type: 'json_object'` AND `schema: { ... }`. Just `{ type: "json_object" }` alone doesn't enforce structure.

### Cohere — assuming content[0].text
```bash
grep -rn "content\[0\]\.text" server/src/
```
Cohere may wrap in thinking blocks. Must find text block by `.type === 'text'` instead of assuming index 0.

### Mongoose — `new: true` (deprecated)
```bash
grep -rn "new: true" server/src/
```
Should use `returnDocument: 'after'` in Mongoose 7+.

### Mongoose — missing userId filter
```bash
grep -rn "Bill\.find\|Bill\.aggregate" server/src/ | grep -v "userId"
```
All bill queries must filter by `userId` for per-user data isolation. Unscoped queries are a security bug.

### Pipeline — missing validation
```bash
grep -rn "UNRECOGNIZED_BILL\|amount <= 0\|Unknown Bill" server/src/controllers/billController.js
```
Bills with `amount <= 0` or `title === 'Unknown Bill'` must be rejected with 422 and Cloudinary cleanup.

## Execution

1. Run `git diff` (or `git diff --staged`) to see changed files
2. For each changed file, run the relevant grep checks above
3. Report findings with file:line, the anti-pattern, and the fix
4. Also check for missing error handling: every `await mongoose.connect()`, `await file.save()`, Tesseract/Cohere API calls should be wrapped in try/catch
5. Check that `.env` is gitignored and no secrets are committed

## Output Format
```
## Code Review: Bill Organizer

### Critical (must fix)
- file:line — anti-pattern — fix

### Warnings (should fix)
- file:line — concern — suggestion

### Clean (confirmed correct)
- patterns/APIs that were verified correct
```
