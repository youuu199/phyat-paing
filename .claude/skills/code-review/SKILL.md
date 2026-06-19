---
name: bill-organizer:code-review
description: Reviews current changes for anti-patterns specific to this project's MERN + Firebase + Vision + Gemini stack. Activates on /code-review or when user asks to review recent code, check for bugs, or audit against Phase 0 allowed APIs.
---

# Code Review — Bill Organizer Stack

Review changed files against the **Allowed APIs** documented in `.claude/plans/01-bill-organizer.md` Phase 0.

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

### Firebase — old namespace import
```bash
grep -rn "admin.storage()" server/src/
```
Must use `getStorage()` from `firebase-admin/storage`, not `admin.storage()`.

### Firebase — gs:// URI in bucket()
```bash
grep -rn "gs://" server/src/
```
`bucket()` takes just the name (e.g., `my-project.appspot.com`), NOT a `gs://` URI.

### Google Cloud Vision — API key
```bash
grep -rn "apiKey" server/src/utils/ocrService.js 2>/dev/null
```
Text detection requires service account credentials. API keys will throw auth errors.

### Vision — textDetection for documents
```bash
grep -rn "textDetection" server/src/utils/
```
Should use `documentTextDetection` for bills/receipts (dense text). `textDetection` returns max ~10 annotations.

### Gemini — wrong model name
```bash
grep -rn "gemini-pro\|gemini-1\|gemini-2.0" server/src/
```
Must use `gemini-2.5-flash` or `gemini-2.5-pro`. Legacy model names will 404.

### Gemini — systemInstruction location
```bash
grep -rn "systemInstruction" server/src/
```
Must be inside `config: { systemInstruction: "..." }`, NOT at the top level of `generateContent()`.

### Mongoose — `new: true` (deprecated)
```bash
grep -rn "new: true" server/src/
```
Should use `returnDocument: 'after'` in Mongoose 7+.

## Execution

1. Run `git diff` (or `git diff --staged`) to see changed files
2. For each changed file, run the relevant grep checks above
3. Report findings with file:line, the anti-pattern, and the fix
4. Also check for missing error handling: every `await mongoose.connect()`, `await file.save()`, Vision/Gemini API calls should be wrapped in try/catch
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
