---
marp: true
paginate: true
transition: fade
size: 16:9
title: Phyat Paing — Tech Stack & AI Workflow
style: |
  :root {
    --paper: #FAF5EA;
    --paper-2: #F3ECDC;
    --ink: #2B2622;
    --ink-soft: #5C5247;
    --primary: #4F46E5;
    --primary-light: #818CF8;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --line: #E2D7C2;
  }
  section {
    background: var(--paper);
    color: var(--ink);
    font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 26px;
    line-height: 1.5;
    padding: 64px 72px;
  }
  h1, h2, h3 {
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  h1 { font-size: 60px; line-height: 1.05; margin: 0 0 .2em; }
  h2 { font-size: 40px; margin: 0 0 .5em; }
  h2::after {
    content: ""; display: block; width: 64px; height: 4px;
    background: var(--primary); margin-top: 14px; border-radius: 2px;
  }
  h3 { font-size: 30px; margin: 0 0 .3em; }
  strong { color: var(--primary); }
  a { color: var(--primary); text-decoration: none; }
  table { font-size: 22px; border-collapse: collapse; width: 100%; }
  th { background: var(--paper-2); text-align: left; }
  th, td { border: 1px solid var(--line); padding: 8px 14px; }
  code {
    background: var(--paper-2); color: var(--primary);
    padding: 1px 7px; border-radius: 5px; font-size: 0.85em;
  }
  ul { margin-top: .2em; }
  li { margin: .25em 0; }
  section.lead { display: flex; flex-direction: column; justify-content: center; }
  section.lead h1 { font-size: 72px; }
  section.lead h2 { font-size: 36px; }
  .tag {
    display: inline-block; background: var(--primary); color: var(--paper);
    font-size: 16px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; padding: 4px 12px; border-radius: 999px;
  }
  .tag-sm {
    display: inline-block; background: var(--paper-2); color: var(--primary);
    font-size: 14px; font-weight: 600; padding: 2px 10px; border-radius: 999px;
  }
  .muted { color: var(--ink-soft); }
  .two-col { display: flex; gap: 40px; }
  .two-col > div { flex: 1; }
  section.dark { background: #211D1A; color: #F3ECDC; }
  section.dark h1, section.dark h2, section.dark h3 { color: #F3ECDC; }
  section.dark strong { color: #818CF8; }
  section.dark a { color: #818CF8; }
  footer, header { color: var(--ink-soft); }
  section::after { color: var(--ink-soft); }
  .card {
    background: var(--paper-2); border-radius: 12px; padding: 20px 28px; margin: 12px 0;
  }
  .flow-arrow { color: var(--ink-soft); font-size: 32px; text-align: center; margin: 4px 0; }
---

<!-- _class: lead -->
<!-- _paginate: false -->

<span class="tag">Chapter 5 — Tech Stack & AI Workflow</span>

# Phyat Paing

### AI-Powered Bill Organizer

<span class="muted">Tech Stack · Agents · Skills · Methodology · Triggers · Commands</span>

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript + Vite | SPA with modern tooling |
| **Styling** | Tailwind CSS v4 | Utility-first responsive UI |
| **Charts** | Recharts | Spending analytics & donut charts |
| **Backend** | Node.js + Express 5 | REST API with middleware pipeline |
| **Database** | MongoDB Atlas + Mongoose 9 | Document storage, aggregations |
| **ORM** | Mongoose 9 | Schema validation, queries |
| **OCR** | Tesseract.js (eng+mya) | Offline text extraction from bill images |
| **AI** | Cohere Command A | Structured JSON classification |
| **Storage** | Cloudinary | Image hosting, CDN delivery |
| **Currency** | open.er-api.com | Live exchange rates (free, no key) |
| **Auth** | JWT + bcryptjs + httpOnly cookies | Secure authentication |
| **Security** | Helmet, express-rate-limit, CORS | Production hardening |

---

## Tech Stack — Why These Choices

<div class="two-col">
<div>

### 🆓 Free / Offline

- **Tesseract.js** runs entirely in process — no API costs, no external service, works offline
- **open.er-api.com** needs no API key
- **MongoDB Atlas** has a generous free tier

### 🔒 Security-First

- **JWT in httpOnly cookies** — XSS-safe auth (can't steal token via JS)
- **Helmet** + rate limiting — OWASP basics covered
</div>
<div>

### 🤖 AI Pipeline

- **Cohere Command A** — structured JSON output with schema validation, cheaper than GPT-4
- **Cloudinary** — handles image optimization, CDN, auto-format

### 🏗️ Modern Stack

- **Vite + React 19** — fast HMR, lazy routes
- **Express 5** — latest Express with async error handling
- **Mongoose 9** — latest Mongoose with modern API (no deprecated options)
</div>
</div>

---

## Project Agents

Four specialized subagents, each with a specific color and focus:

| Agent | Model | Color | Focus |
|-------|-------|-------|-------|
| **mern-reviewer** | Sonnet | 🔴 Red | Anti-pattern detection (Mongoose, Cloudinary, Cohere, Tesseract) |
| **pipeline-debugger** | Sonnet | 🟡 Yellow | Stage-by-stage pipeline failure isolation |
| **backend-db-specialist** | Sonnet | 🔵 Blue | Express routing, Mongoose schemas, aggregations, REST APIs |
| **ai-ocr-specialist** | Sonnet | 🟢 Green | Tesseract.js OCR, Cohere prompt engineering, Myanmar text |

### Agent Architecture

Each agent has:
- **`tools`** — scoped tool access (Glob, Grep, Read, Bash, Context7)
- **`model`** — explicit model assignment
- **`color`** — terminal output color for quick identification
- **`description`** — clear purpose for Claude Code to dispatch correctly

---

## Agent Deep Dive — mern-reviewer

```
─── .claude/agents/mern-reviewer.md ───
│
├── name: mern-reviewer
├── model: sonnet     ← dedicated model, not default
├── color: red        ← visible agent identity
├── tools: Glob, Grep, Read, Bash, Context7
│
└── behavior:
    ├── runs grep commands for 13 known anti-patterns
    ├── checks all changed files against Allowed APIs
    ├── scores every finding ≥ 80% confidence
    └── never reports style preferences — only verifiable bugs
```

**Typical output:**
```
## MERN Review

### 🔴 Critical
- **server/src/utils/cloudinaryStorage.js:17** — `upload()` with Buffer.
  Use `upload_stream()` wrapped in Promise.

### 🟡 Warnings
- **server/src/controllers/billController.js:42** — Missing `returnDocument: 'after'`.
  `findByIdAndUpdate` with `new: true` works but is deprecated in Mongoose 7+.

### 🟢 Confirmed Correct
- Cohere: `CohereClientV2` with `responseFormat.jsonSchema` ✅
- Tesseract: `createScheduler()` with worker pool ✅
```

---

## Agent Deep Dive — pipeline-debugger

Isolates **which stage** of the upload pipeline failed — saves hours of manual testing.

```
📸 Upload → ☁️ Cloudinary → 👁️ Tesseract → 🤖 Cohere → 🗄️ MongoDB
   Stage 1     Stage 2        Stage 3       Stage 4      Stage 5
```

### Failure Signature Table

| Error | Stage | Cause |
|-------|-------|-------|
| `req.file is undefined` | 1 | Multer config wrong |
| `upload_stream timeout` | 2 | Buffer > 10MB or API down |
| No text extracted | 3 | Wrong language code or image quality |
| JSON parse error | 4 | Cohere wrapped in thinking blocks — find `.type === 'text'` |
| `MongooseServerSelectionError` | 5 | MongoDB unreachable |

For each failure the agent produces: **root cause** → **exact code fix** → **verification step**.

---

## Project Skills

Six packaged skills / slash commands that encapsulate recurring workflows:

| Skill (Slash Command) | What It Does |
|-----------------------|-------------|
| **`/bill-organizer:setup-env`** | Interactive .env configuration — walks through all 10+ variables |
| **`/bill-organizer:db-seed`** | Seeds MongoDB with 12 realistic test bills across 6 categories |
| **`/bill-organizer:test-pipeline`** | End-to-end test of upload → Cloudinary → Tesseract → Cohere → MongoDB |
| **`/bill-organizer:code-review`** | Grep-checks changed files for 13 known anti-patterns |
| **`/bill-organizer:extract-categorize-bill`** | Standalone Cohere classification — debug AI output without full pipeline |
| **`/bill-organizer:upload-cloudinary-storage`** | Test multer → Cloudinary in isolation (verify credentials, upload_stream) |

### Skill File Structure

```
.claude/skills/<name>/
  └── SKILL.md     ← trigger, prerequisites, usage, verification
```

---

## Skill Deep Dive — code-review

```
─── .claude/skills/code-review/SKILL.md ───

Trigger:  User says "review my code" or /bill-organizer:code-review
What:     Scans all changed files for anti-patterns
Checklist: 13 grep patterns covering:
  - Mongoose deprecated options
  - Cloudinary upload() vs upload_stream()
  - Cohere CohereClient vs CohereClientV2
  - Missing userId filter on bill queries
  - Hardcoded Tesseract cache path
  - Cohere content[0].text (should find by type)
  - ...and 7 more

Output:   File:line findings with exact fix code
```

**Example run:**
```bash
# In Claude Code, type:
/code-review

# Output:
# 🔴 server/src/utils/cloudinaryStorage.js:17 — upload() with Buffer
# → Fix: Use upload_stream() wrapped in Promise
```

---

## Methodology — Spec-Driven Development (SDD)

The project follows **Spec-Driven Development** from **Superpowers** — a structured methodology:

```
┌─────────────────────────────────────────────────────────┐
│  Phase 0 — Tech Discovery                                 │
│  » Document exact package versions & Allowed APIs         │
│  » Identify anti-patterns before writing code             │
├─────────────────────────────────────────────────────────┤
│  Phase 1–4 — Incremental Feature Delivery                 │
│  » Each phase adds one slice of functionality             │
│  » Docs resolved via Context7 before each new library     │
│  » Anti-pattern checklist run before each commit          │
├─────────────────────────────────────────────────────────┤
│  Phase 5 — Polish & Deploy                                │
│  » Live URL on Vercel                                     │
│  » Production hardening (Helmet, rate limits, timeouts)   │
└─────────────────────────────────────────────────────────┘
```

**Key principle:** *Every library integration is verified against live docs before use, not from memory.*

---

## AI Tools & Workflow

All the AI tools used across the project:

| Tool | What It Did |
|------|------------|
| **Claude Code (Sonnet/Opus)** | Primary AI pair programmer — code generation, debugging, architecture |
| **Superpowers SDD** | Spec-Driven Development methodology — Phase 0→5 structure |
| **Context7 MCP** | Fetched live docs for Express 5, Mongoose 9, Cohere v2 API, Tesseract.js |
| **21st.dev MCP** | Generated and refined UI components (uploader, cards, modals, theme toggle) |
| **Chrome DevTools MCP** | Screenshot capture at 1280×800, responsive testing, Lighthouse audits |
| **claude-mem MCP** | Persistent session memory — remembers project decisions across sessions |
| **GSD Framework** | Structured workflow with planning, review, and verification stages |
| **MongoDB MCP** | Database inspection — schema validation, index creation, aggregation testing |

---

## Triggers — When Skills & Agents Activate

### Automatic Triggers (Agent)

| Agent | Trigger |
|-------|---------|
| `mern-reviewer` | User asks "review", "check for bugs", or "audit" — Claude dispatches automatically based on description |
| `pipeline-debugger` | User reports upload failure, "pipeline broken", or Cohere/Tesseract error |
| `backend-db-specialist` | User asks about schemas, routes, aggregations, or Mongoose queries |
| `ai-ocr-specialist` | User asks about OCR, Cohere classification, or Myanmar text handling |

### Manual Triggers (Skill)

| Skill | Trigger | How |
|-------|---------|-----|
| `setup-env` | User types | `/bill-organizer:setup-env` |
| `db-seed` | User types | `/bill-organizer:db-seed` |
| `test-pipeline` | User types | `/bill-organizer:test-pipeline` |
| `code-review` | User types | `/bill-organizer:code-review` |
| `extract-categorize-bill` | User types | `/bill-organizer:extract-categorize-bill` |
| `upload-cloudinary-storage` | User types | `/bill-organizer:upload-cloudinary-storage` |

---

## Commands — Quick Reference

```bash
# ─── Development ───────────────────────────────────

cd client && npm install         # Install frontend deps
cd client && npm run dev         # Vite dev server → :5173

cd server && npm install         # Install backend deps
cd server && npm run dev         # Express with --watch → :5000

cd server && node src/seed.js    # Seed database with 12 test bills

# ─── Skills (inside Claude Code) ───────────────────

/setup-env                       # Configure all .env vars
/db-seed                         # Seed test data
/code-review                     # Anti-pattern scan
/test-pipeline                   # End-to-end pipeline test
/extract-categorize-bill         # Standalone Cohere classification
/upload-cloudinary-storage       # Test Cloudinary upload only

# ─── Agents (inside Claude Code) ───────────────────

"Review my changes"              # → dispatches mern-reviewer
"Debug the upload pipeline"      # → dispatches pipeline-debugger
"Check the Mongoose schema"      # → dispatches backend-db-specialist
"Tune the OCR prompt"            # → dispatches ai-ocr-specialist

# ─── Self-Check ────────────────────────────────────

grep -rn "useNewUrlParser\|useUnifiedTopology" server/src/   # Mongoose check
grep -rn "cloudinary\.uploader\.upload" server/src/          # Cloudinary check
grep -rn "content\[0\]\.text" server/src/                   # Cohere check
```

---

## Workflow — How It All Fits Together

```
┌───────────── User Request ─────────────┐
│ "Upload this bill image"                │
└──────────────┬──────────────────────────┘
               ▼
┌───────────────────────────────────────────┐
│    Superpowers SDD — Phase Methodology    │
│  Context7 → resolve docs → implement      │
└──────┬────────────────────────┬────────────┘
       ▼                        ▼
┌────────────────┐    ┌────────────────────┐
│ Claude Code    │    │   Agent Dispatch   │
│ (primary dev)  │───▶│ mern-reviewer      │
│                │    │ pipeline-debugger  │
│ Skills:        │    │ backend-db-spec    │
│ /code-review   │    │ ai-ocr-spec        │
│ /test-pipeline │    └────────────────────┘
│ /db-seed       │              │
└────────────────┘              ▼
                      ┌────────────────────┐
                      │  External MCPs     │
                      │ Context7 (docs)    │
                      │ 21st.dev (UI)      │
                      │ MongoDB (DB)       │
                      │ Chrome (screens)   │
                      │ claude-mem (mem)   │
                      └────────────────────┘
```

---

## Git Workflow & Quality Gates

```
main ← feature branches

Every commit must pass:
  ✅ 1. Context7 docs resolved before new library
  ✅ 2. Anti-pattern grep returns nothing
  ✅ 3. No .env, API keys, or service accounts committed
  ✅ 4. try/catch on every async call
  ✅ 5. Bills scoped to userId (no data leaks)
  ✅ 6. Pipeline validation — reject amount=0 / Unknown Bill

Pre-commit checklist (./CLAUDE.md):
  grep -rn "useNewUrlParser\|upload(\|content\[0\]\.text" server/src/
  # All must return nothing
```

---

<!-- _class: lead dark -->

## Summary

<span class="tag-sm">Stack</span> MERN + Tesseract.js + Cohere + Cloudinary
<span class="tag-sm">Agents</span> 4 specialized subagents (reviewer, debugger, backend, OCR/AI)
<span class="tag-sm">Skills</span> 6 packaged workflows (setup, seed, test, review, extract, upload)
<span class="tag-sm">Methodology</span> Superpowers Spec-Driven Development (SDD)
<span class="tag-sm">MCP Tools</span> Context7 · 21st.dev · Chrome · MongoDB · claude-mem

---

<!-- _paginate: false -->

**Phyat Paing** — AI-Powered Bill Organizer

[github.com/youuu199/phyat-paing](https://github.com/youuu199/phyat-paing) · [phyat-paing.vercel.app](https://phyat-paing.vercel.app/)

Built with Claude Code · Superpowers · Context7 · 21st.dev
