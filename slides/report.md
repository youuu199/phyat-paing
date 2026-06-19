# Project Report — phyat-paing (Smart Bill Organizer)

**Author:** youuu199  
**Repo:** [github.com/youuu199/phyat-paing](https://github.com/youuu199/phyat-paing)  
**Stack:** MongoDB + Express + React + Node.js (MERN) + Cloudinary + Tesseract.js + Cohere  
**Date:** 2026-06-19

---

## 1. Problem

Myanmar utility bills are printed in mixed Burmese/English, photographed with phones, and manually transcribed into spreadsheets. No existing expense-tracker reads Burmese script offline or auto-categorizes Myanmar-specific billers (YESB, YCDC, MPT Fiber).

## 2. Solution

A MERN web app that accepts a photo of any utility bill and runs it through:

1. **Cloudinary** — stores the image
2. **Tesseract.js** (`eng+mya`) — extracts text offline, no API keys
3. **Cohere Command A** — classifies into { title, amount, category }
4. **Validation** — rejects unrecognized bills (422), cleans up Cloudinary
5. **MongoDB** — saves per-user with JWT auth isolation
6. **React Dashboard** — filterable cards with category tabs and month sidebar

## 3. Claude Code Integration

### MCPs Used

| MCP | Purpose |
|-----|---------|
| **Context7** | Resolved live docs for every library: Cloudinary `upload_stream()`, Cohere `response_format`, Tesseract `createScheduler()`, Mongoose connect |
| **21st.dev** | Generated React component scaffolding (BillCard, Sidebar, Uploader, Tabs) |

### Skills Created

| Skill | Purpose |
|-------|---------|
| `setup-env` | Interactive `.env` configuration walkthrough |
| `test-pipeline` | End-to-end pipeline test: Cloudinary→Tesseract→Cohere→MongoDB |
| `code-review` | 13 anti-pattern grep checks (Mongoose deprecated opts, Cloudinary `upload()` on Buffer, etc.) |
| `extract-categorize-bill` | Standalone Cohere debug — reprocess stored rawText without re-uploading |

### Agents Used

| Agent | Role | Key Catch |
|-------|------|-----------|
| `mern-reviewer` (red) | Anti-pattern detection | Caught `upload()` on Buffer (crash), missing `userId` filters (data leak), Cohere v1 client |
| `pipeline-debugger` (yellow) | Stage-by-stage failure isolation | Diagnosed second-upload timeout → single Tesseract worker bottleneck |
| `ai-ocr-specialist` (green) | OCR + AI prompt engineering | Designed scheduler worker pool, Myanmar prompt tuning |

## 4. Technical Highlights

### Concurrent OCR via Worker Pool

The initial implementation used a single `Tesseract.createWorker()`. The second upload blocked waiting for the first to finish and timed out. Fix: `Tesseract.createScheduler()` with 3 workers via `scheduler.addJob('recognize', buffer)`.

### Pipeline Validation (Stage 4.5)

After AI classification, bills with `amount <= 0` or `title === 'Unknown Bill'` are rejected with HTTP 422. The Cloudinary image is deleted inline — no orphaned files. The frontend displays a descriptive alert.

### Graceful MongoDB Fallback

If Atlas is unreachable (IP whitelist), the app auto-falls-back to `mongodb-memory-server` — zero-config local development.

## 5. Commits

| Commit | Description |
|--------|-------------|
| `640ea68` | Tesseract.js OCR + worker pool + bill validation + doc refresh |
| `bdba4e2` | Steps 5-6 + Cloudinary migration + sidebar + README |
| `99fbb2c` | Steps 1-4 — project scaffold, backend, upload, OCR & AI |
| `9565aaf` | Initial commit |

## 6. How to Run

```bash
git clone git@github.com:youuu199/phyat-paing.git
cd phyat-paing

# Install
cd client && npm install
cd ../server && npm install
cd ..

# Configure
cp server/.env.example server/.env
# Edit server/.env with Cloudinary + Cohere keys (Tesseract is offline)

# Run
cd server && npm run dev    # http://localhost:5000
cd client && npm run dev    # http://localhost:5173
```
