<!--
  Marp template — "pitch-bold"
  Dark theme, high contrast, big type.
  Render:  marp slides/tech-stack.md -o slides.html
-->

---

marp: true
paginate: true
size: 16:9

---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@500&display=swap');
:root { --bg:#0a0a0a; --ink:#fafafa; --muted:#a3a3a3; --accent:#f0b429; --code:#171717; }
section {
  background:var(--bg); color:var(--ink);
  font-family:'Inter','Noto Sans','Pyidaungsu',sans-serif;
  font-size:22px; line-height:1.35; padding:44px 56px; font-weight:400;
}
h1 { color:var(--accent); font-weight:900; font-size:1.7em; line-height:1.05; letter-spacing:-.02em; margin:.1em 0 .2em; }
h2 { color:var(--ink); font-weight:700; font-size:1.2em; margin:.15em 0 .2em; }
h3 { color:var(--muted); font-weight:700; font-size:1em; }
strong { color:var(--accent); }
a { color:var(--accent); text-decoration:none; }
ul { font-weight:500; margin:.2em 0; }
code { background:var(--code); color:var(--accent); padding:.05em .3em; border-radius:5px; font-family:'JetBrains Mono',monospace; font-size:.8em; }
pre  { background:var(--code); border:1px solid #222; border-radius:8px; padding:.4em .8em; margin:.3em 0; }
pre code { background:none; color:#fafafa; padding:0; font-size:.55em; line-height:1.35; }
table {
  width: 100%;
  border-collapse: collapse;
  background: #111;
}

th {
  background: #1a1a1a;
  color: var(--accent);
}

td {
  background: #111;
  color: #fafafa;
}

tr:nth-child(even) td {
  background: #181818;
}

th, td {
  padding: 5px 10px;
  border: 1px solid #333;
  font-size: .9em;
}
blockquote { border-left:5px solid var(--accent); color:var(--muted); padding:.3em .8em; margin:0; }
header,footer,section::after { color:#525252; font-size:.5em; }
section.cover { background:linear-gradient(135deg,#0a0a0a 0%, #1a1500 100%); }
section.cover h1 { font-size:2.8em; }
section.lead { background:#111; }
section.lead h1 { font-size:2.4em; }
section.lead h2 { font-size:1.3em; }
section.lead p { font-size:1em; }
.tag {
  display:inline-block; background:var(--accent); color:#0a0a0a;
  font-size:14px; font-weight:700; letter-spacing:.06em;
  text-transform:uppercase; padding:3px 10px; border-radius:999px;
}
.tag-sm {
  display:inline-block; background:#222; color:var(--muted);
  font-size:13px; font-weight:600; padding:2px 8px; border-radius:999px;
}
.muted { color:var(--muted); }
.two-col { display:flex; gap:36px; }
.two-col > div { flex:1; }
.flow-arrow { color:var(--muted); font-size:28px; text-align:center; margin:6px 0; }
.card { background:#111; border:1px solid #222; border-radius:10px; padding:16px 22px; margin:10px 0; }
</style>

<!-- _class: cover -->
<!-- _paginate: false -->

# Phyat Paing

## AI-Powered Bill Organizer

**Upload. OCR. Classify. Track. Export.**

---

# The Problem

Households and small businesses manage bills through scattered channels:

- Paper receipts stuffed in drawers
- Utility bill emails buried in inboxes
- Photos of invoices on phone galleries
- Spreadsheets that never get updated

**Result:** Missed due dates, no spending visibility, manual data entry nightmares.

---

# The Solution

A centralized platform that streamlines the entire bill workflow:

- **Upload** — Snap a photo or upload any bill image
- **Extract** — OCR reads text automatically (English + Myanmar)
- **Classify** — AI identifies amount, category, and vendor
- **Track** — Dashboard with filters, charts, and payment status
- **Export** — CSV or PDF for accounting

---

# Core Features

| Feature | Description |
|---------|-------------|
| Bill Upload | Drag-and-drop image upload with progress stages |
| OCR Engine | Tesseract.js extracts text from bills (eng+mya) |
| AI Classification | Cohere Command A classifies amount, category, vendor |
| Dashboard | Filterable bill list with search, sort, and pagination |
| Analytics | Spending overview donut chart + monthly trend line chart |
| Payment Tracking | Mark bills paid/unpaid with date stamps |
| Recurring Bills | Auto-creation of monthly/quarterly/yearly bills via cron |
| Multi-Currency | Live exchange rates via open.er-api.com |
| Export | CSV and PDF export for accounting |
| Dark Mode | Theme toggle with system preference detection |

---

# Architecture

```
┌──────────┐     ┌──────────────────────────────────┐     ┌──────────┐
│  Vite +  │────▶│         Express 5 API             │────▶│ MongoDB  │
│  React   │     │  /api/v1/* — versioned routes     │     │ Atlas    │
│   :5173  │     │  JWT auth — httpOnly cookies       │     │          │
└──────────┘     │  Multer — memoryStorage            │     └──────────┘
       ▲         │  Rate-limited — Helmet secured     │
       │         └──────────┬──────────┬──────────────┘
       │                    │          │
       │         ┌──────────▼──┐ ┌─────▼───────────┐
       │         │ Cloudinary  │ │ Tesseract.js    │
       │         │ Image CDN   │ │ OCR (eng+mya)   │
       │         └─────────────┘ └─────┬───────────┘
       │                               │
       │                     ┌─────────▼──────────┐
       │                     │ Cohere Command A   │
       │                     │ JSON classification│
       │                     └────────────────────┘
       │
  ┌────┴───────┐
  │ Proxy Vite │  /api/* → localhost:5000
  └────────────┘
```

---

# Data Pipeline

Every upload flows through a 5-stage pipeline with retry logic at each step:

```
📸 Upload ──▶ ☁️ Cloudinary ──▶ 👁️ Tesseract ──▶ 🤖 Cohere ──▶ 🗄️ MongoDB
   multer       upload_stream     scheduler         V2 client      user-scoped
   memory       wrapped in        worker pool       response       bills only
   storage      p-retry           (3 workers)       Format.JSON
```

**Validation gate (after Cohere):**
- `amount <= 0` → Reject with 422 + cleanup Cloudinary image
- `title === 'Unknown Bill'` → Reject with 422 + cleanup Cloudinary image
- Response includes `code: 'UNRECOGNIZED_BILL'` for frontend alerts

---

# Cloudinary Integration

**Purpose:** Upload, store, and optimize bill images via CDN.

```javascript
// Upload from Buffer — NOT upload() which expects a file path
const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
  if (err) return reject(err);
  resolve(result);
});
stream.end(buffer);

// Wrapped in p-retry (2 retries, 1s backoff)
return pRetry(doUpload, { retries: 2, minTimeout: 1000 });
```

| Feature | Detail |
|---------|--------|
| Storage | Bill images stored securely, auto-optimized |
| Deletion | Images cleaned up on bill delete or pipeline rejection |
| Security | Credentials via env vars, never committed |

---

# OCR Engine — Tesseract.js

**Purpose:** Extract raw text from bill images — fully free and offline.

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Worker 1 │     │ Worker 2 │     │ Worker 3 │
│ eng+mya  │     │ eng+mya  │     │ eng+mya  │
└─────┬────┘     └─────┬────┘     └─────┬────┘
      └───────────────┬┘────────────────┘
                      │
           ┌──────────▼──────────┐
           │  createScheduler()  │  ← concurrent-safe
           │  scheduler.addJob() │
           └─────────────────────┘
```

- 3-worker pool via `createScheduler()` — avoids serialized single-worker blocking
- Supports Myanmar + English text in the same image (`eng+mya`)
- Cache path uses `os.tmpdir()` for portability

---

# AI Classification — Cohere Command A

**Purpose:** Parse raw OCR text into structured bill data.

```
Input:  "Electric Bill - Yangon - 45,000 MMK - Due 15/06/2026"

Output: {
  "title":    "Electric Bill",
  "amount":   45000,
  "category": "Electricity",
  "dueDate":  "2026-06-15"
}
```

| Detail | Value |
|--------|-------|
| Model | `command-a-plus-05-2026` (env-configurable) |
| Client | `CohereClientV2` (v2, not v1) |
| Schema | `responseFormat.jsonSchema` enforces structure |
| Retry | `p-retry` with 2 retries |
| Caching | Client cached at module level — never created per request |

---

# Authentication

**JWT in httpOnly cookies — XSS-safe by design.**

```
Login ──▶ Set-Cookie: token=<jwt>; httpOnly; Secure; SameSite=Lax
                                                   └── JS can't read it
Request ──▶ Cookie header ──▶ jwt.verify() ──▶ req.userId
```

| Feature | Detail |
|---------|--------|
| httpOnly Cookies | Token inaccessible to JavaScript — defeats XSS |
| Auth Header | `Authorization: Bearer <token>` fallback for mobile |
| Session | 7-day expiry, refreshed on each request |
| Registration | Email + password with `validator.isEmail()` |

---

# Security

| Measure | Detail |
|---------|--------|
| Account Lockout | 5 failed attempts → 15-minute lockout |
| Rate Limiting | Auth: 20/15min · Upload: 10/min |
| Helmet | Security headers (CSP, HSTS, X-Frame-Options) |
| Password Policy | Min 8 chars, at least one number |
| CORS | Strict origin validation in production |
| Error Sanitization | Generic messages prod — no stack leaks |
| Timeouts | 120s request timeout prevents hung connections |
| Graceful Shutdown | SIGTERM/SIGINT closes DB + Tesseract workers |

---

# Agent System

Four specialized subagents — dispatched by Claude Code when the task matches their focus.

| Agent | Color | Model | Focus |
|-------|-------|-------|-------|
| **mern-reviewer** | 🔴 | Sonnet | Anti-pattern detection — 13 grep patterns |
| **pipeline-debugger** | 🟡 | Sonnet | Stage-by-stage pipeline failure isolation |
| **backend-db-specialist** | 🔵 | Sonnet | Express routing, schemas, aggregations |
| **ai-ocr-specialist** | 🟢 | Sonnet | OCR tuning, Cohere prompts, Myanmar text |

**Trigger phrases:**
- `mern-reviewer` → "review", "check for bugs", "audit"
- `pipeline-debugger` → "upload failed", "pipeline broken"
- `backend-db-specialist` → "schemas", "routes", "aggregations"
- `ai-ocr-specialist` → "OCR", "Cohere", "Myanmar text"

---

# Skills — Packaged Workflows

Six slash commands for common tasks:

| Command | What it does |
|---------|-------------|
| `/setup-env` | Interactive .env configuration — all 10+ vars |
| `/db-seed` | Seeds MongoDB with 12 realistic test bills |
| `/test-pipeline` | End-to-end: upload → Cloudinary → OCR → AI → DB |
| `/code-review` | Grep-checks changed files for 13 anti-patterns |
| `/extract-categorize-bill` | Standalone Cohere classification debug |
| `/upload-cloudinary-storage` | Test multer → Cloudinary in isolation |

---

# Quality Gates

```
main ← feature branches

Every commit must pass:
  ✅ Context7 docs resolved before new library
  ✅ Anti-pattern grep returns nothing
  ✅ No .env / API keys / service accounts committed
  ✅ try/catch on every async call
  ✅ All bills scoped to userId (no data leaks)
  ✅ Pipeline validation — reject amount=0 / Unknown Bill
```

**Pre-commit checklist** (run via `/code-review`):
```bash
grep -rn "useNewUrlParser\|useUnifiedTopology" server/src/
grep -rn "cloudinary\.uploader\.upload" server/src/
grep -rn "content\[0\]\.text" server/src/
grep -rn "localhost:27017" server/src/
```

---

# MCP Toolchain

| Tool | Role |
|------|------|
| **Claude Code (Sonnet/Opus)** | Primary pair programmer |
| **Superpowers SDD** | Phase methodology — Phase 0→5 |
| **Context7 MCP** | Live docs for Express 5, Mongoose 9, Cohere v2 |
| **21st.dev MCP** | Generated & refined UI components |
| **Chrome DevTools MCP** | Screenshots, responsive tests, Lighthouse |
| **claude-mem MCP** | Persistent session memory |
| **GSD Framework** | Planning, review, verification |
| **MongoDB MCP** | DB inspection — schema, indexes, aggregations |

---

# Future Roadmap

| Phase | Feature |
|-------|---------|
| Phase 7 | Email notifications for upcoming bills |
| Phase 8 | WhatsApp/Telegram bill alerts |
| Phase 9 | Mobile app (React Native or PWA) |
| Phase 10 | Multi-user household accounts |
| Phase 11 | Bank statement import + reconciliation |
| Phase 12 | Budget forecasting with spending trends |

---

# Tech Stack

| Layer | Package | Why |
|-------|---------|-----|
| **Frontend** | Vite + React 19 + TS | Fast HMR, lazy routes |
| **Styling** | Tailwind CSS v4 | Utility-first responsive |
| **Backend** | Express 5 | Async-safe, latest |
| **Database** | MongoDB + Mongoose 9 | Document store, aggregations |
| **OCR** | Tesseract.js (eng+mya) | Free, offline, in-process |
| **AI** | Cohere Command A | Structured JSON with schema |
| **Image Storage** | Cloudinary | CDN, auto-optimization |
| **Auth** | JWT + httpOnly cookies | XSS-safe |
| **Security** | Helmet, rate-limit, CORS | OWASP basics |
| **Logging** | Pino + pino-http | Structured JSON logs |

---

# Demo

1. **Open** the app at [phyat-paing.vercel.app](https://phyat-paing.vercel.app/)
2. **Register** an account (or log in with test credentials)
3. **Upload** a bill image — watch the pipeline progress
4. **View** the classified result on the dashboard
5. **Filter** by category, date range, or search
6. **Toggle** payment status and set recurring intervals
7. **Export** to CSV or PDF

---

# Commands

```bash
# ─── Development ───────────────────────────
cd client && npm install    npm run dev       # Vite → :5173
cd server && npm install    npm run dev       # Express → :5000
cd server && node src/seed.js                 # Seed 12 test bills

# ─── Inside Claude Code ────────────────────
/setup-env    /db-seed    /code-review
/test-pipeline   /extract-categorize-bill   /upload-cloudinary-storage
```

---

<!-- _class: lead -->

# Summary

<span class="tag-sm">Stack</span> MERN + Tesseract.js + Cohere + Cloudinary
<span class="tag-sm">Agents</span> 4 specialized (reviewer, debugger, backend, OCR/AI)
<span class="tag-sm">Skills</span> 6 packaged workflows
<span class="tag-sm">Methodology</span> Superpowers Spec-Driven Development
<span class="tag-sm">MCP</span> Context7 · 21st.dev · Chrome · MongoDB · claude-mem

---

<!-- _paginate: false -->

**Phyat Paing** — AI-Powered Bill Organizer

[github.com/youuu199/phyat-paing](https://github.com/youuu199/phyat-paing) · [phyat-paing.vercel.app](https://phyat-paing.vercel.app/)

**Built with** Claude Code · Superpowers · Context7 · 21st.dev
