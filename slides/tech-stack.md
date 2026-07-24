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
  font-size:28px; line-height:1.4; padding:60px 72px; font-weight:400;
}
h1 { color:var(--accent); font-weight:900; font-size:2em; line-height:1.05; letter-spacing:-.02em; }
h2 { color:var(--ink); font-weight:700; font-size:1.35em; }
h3 { color:var(--muted); font-weight:700; font-size:1.1em; }
strong { color:var(--accent); }
a { color:var(--accent); text-decoration:none; }
ul { font-weight:600; }
code { background:var(--code); color:var(--accent); padding:.05em .3em; border-radius:5px; font-family:'JetBrains Mono',monospace; font-size:.85em; }
pre  { background:var(--code); border:1px solid #222; border-radius:10px; padding:.6em 1em; }
pre code { background:none; color:#fafafa; padding:0; font-size:.7em; line-height:1.5; }
table { font-size:.8em; border-collapse:collapse; width:100%; }
th { color:var(--accent); border-bottom:2px solid #333; padding:6px 10px; text-align:left; }
td { border-bottom:1px solid #222; padding:6px 10px; }
blockquote { border-left:5px solid var(--accent); color:var(--muted); padding:.3em .8em; margin:0; }
header,footer,section::after { color:#525252; font-size:.5em; }
section.cover { background:linear-gradient(135deg,#0a0a0a 0%, #1a1500 100%); }
section.cover h1 { font-size:3.2em; }
section.lead { background:#111; }
section.lead h1 { font-size:3em; }
section.lead h2 { font-size:1.6em; }
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

**Tech Stack · Agents · Skills · Methodology**

---

<!-- _class: lead -->

# The stack

| Layer | What | Why |
|---|---|---|
| **Frontend** | React 19 + TS + Vite | Fast HMR, lazy routes |
| **Styling** | Tailwind CSS v4 | Utility-first responsive |
| **Backend** | Express 5 | Async error handling built-in |
| **Database** | MongoDB + Mongoose 9 | Document store, aggregations |
| **OCR** | Tesseract.js (eng+mya) | Free, offline, in-process |
| **AI** | Cohere Command A | Structured JSON with schema |
| **Storage** | Cloudinary | CDN, auto-format, optimization |
| **Auth** | JWT + httpOnly cookies | XSS-safe (no JS access to token) |
| **Security** | Helmet, rate-limit, CORS | OWASP basics, prod-hardened |

---

# Why these choices

<div class="two-col">
<div>

### 🆓 Free / Offline

- **Tesseract.js** — no API costs, works fully offline
- **open.er-api.com** — live exchange rates, no key needed
- **MongoDB Atlas** — generous free tier

### 🔒 Security-First

- **httpOnly cookies** — can't steal token via JS
- **Helmet** + rate limiting + account lockout

</div>
<div>

### 🤖 AI Pipeline

- **Cohere Command A** — structured JSON with schema validation, cheaper than GPT-4
- **Cloudinary** — image optimization + CDN delivery

### 🏗️ Modern

- **Vite + React 19** — fast dev, lazy routes
- **Express 5** — latest, async-safe
- **Mongoose 9** — modern API, no deprecated opts

</div>
</div>

---

# Data flow

```
📸 Upload → ☁️ Cloudinary → 👁️ Tesseract → 🤖 Cohere → 🗄️ MongoDB
   multer      upload_stream   scheduler       V2 client    user-scoped
   memory      wrapped in      worker pool     response     bills only
   storage     p-retry         (3 workers)     Format.JSON
```

Every stage has retry logic. Each stage can be tested in isolation via skills.

---

<!-- _class: lead -->

# Agents

Four specialized subagents — dispatched by Claude Code when needed.

---

# Agent roster

| Agent | Model | Color | Focus |
|---|---|---|---|
| **mern-reviewer** | Sonnet | 🔴 | Anti-pattern detection (Mongoose, Cloudinary, Cohere, Tesseract) |
| **pipeline-debugger** | Sonnet | 🟡 | Stage-by-stage pipeline failure isolation |
| **backend-db-specialist** | Sonnet | 🔵 | Express routing, schemas, aggregations |
| **ai-ocr-specialist** | Sonnet | 🟢 | OCR tuning, Cohere prompts, Myanmar text |

**Architecture:** Each agent has scoped tools (Glob, Grep, Read, Bash, Context7), explicit model assignment, color identity, and a clear purpose description for automatic dispatch.

---

# Agent deep-dive — mern-reviewer

```
─── .claude/agents/mern-reviewer.md ───

model: sonnet     ← dedicated model
color: red        ← visible identity
tools: Glob, Grep, Read, Bash, Context7

behavior:
├── runs 13 grep patterns for known anti-patterns
├── checks all changed files against Allowed APIs
├── scores findings ≥ 80% confidence
└── never reports style — only verifiable bugs
```

**Sample output:**
```
🔴 server/src/utils/cloudinaryStorage.js:17
   upload() with Buffer → Use upload_stream() wrapped in Promise

🟡 server/src/controllers/billController.js:42
   Missing returnDocument:'after' on findByIdAndUpdate

🟢 Cohere: CohereClientV2 + responseFormat.jsonSchema ✅
🟢 Tesseract: createScheduler() with 3 workers ✅
```

---

# Agent deep-dive — pipeline-debugger

Isolates **which stage** of the upload pipeline failed — saves hours of manual debugging.

**Failure signature table:**

| Error | Stage | Cause |
|---|---|---|
| `req.file is undefined` | 1 — Multer | Config wrong |
| `upload_stream timeout` | 2 — Cloudinary | Buffer > 10MB or API down |
| No text extracted | 3 — Tesseract | Wrong language code or image quality |
| JSON parse error | 4 — Cohere | Thinking blocks in response — find `.type === 'text'` |
| `MongooseServerSelectionError` | 5 — MongoDB | DB unreachable |

Each failure → **root cause** → **exact fix** → **verification step**

---

<!-- _class: lead -->

# Skills

Six packaged workflows — one slash command each.

---

# Skill reference

| Command | What it does |
|---|---|
| `/setup-env` | Interactive .env config — walks through all 10+ vars |
| `/db-seed` | Seeds MongoDB with 12 realistic test bills |
| `/test-pipeline` | End-to-end test: upload → Cloudinary → Tesseract → Cohere → DB |
| `/code-review` | Grep-checks changed files for 13 anti-patterns |
| `/extract-categorize-bill` | Standalone Cohere classification — debug AI without full pipeline |
| `/upload-cloudinary-storage` | Test multer → Cloudinary in isolation |

All live inside `.claude/skills/<name>/SKILL.md` — trigger, prerequisites, usage, verification.

---

# Skill deep-dive — code-review

```
─── .claude/skills/code-review/SKILL.md ───

Trigger:  "review my code" or /code-review
What:     Scans all changed files for anti-patterns

Checklist: 13 grep patterns:
  - Mongoose deprecated options          → server/src/
  - Cloudinary upload() vs upload_stream → server/src/
  - CohereClient vs CohereClientV2       → server/src/
  - Missing userId filter on bills       → server/src/
  - Hardcoded Tesseract cache path       → server/src/
  - Cohere content[0].text (find by type)→ server/src/
  - ...and 7 more

Output:   File:line findings with exact fix code
```

```bash
# Run it:
/code-review
# → 🔴 server/src/utils/cloudinaryStorage.js:17 — upload() with Buffer
```

---

# Methodology — SDD

**Spec-Driven Development** (from Superpowers) — five structured phases:

```
Phase 0 — Tech Discovery
  » Exact package versions & Allowed APIs
  » Anti-patterns identified before writing code

Phase 1–4 — Incremental Feature Delivery
  » One slice per phase
  » Context7 docs before each new library
  » Anti-pattern grep before each commit

Phase 5 — Polish & Deploy
  » Live URL on Vercel
  » Production hardening (Helmet, rate limits, timeouts)
```

**Principle:** *Every library integration verified against live docs — not from memory.*

---

<!-- _class: lead -->

# AI toolchain

---

# MCP tools used

| Tool | Role |
|---|---|
| **Claude Code (Sonnet/Opus)** | Primary pair programmer — code, debug, architecture |
| **Superpowers SDD** | Phase methodology — Phase 0→5 structure |
| **Context7 MCP** | Live docs for Express 5, Mongoose 9, Cohere v2, Tesseract.js |
| **21st.dev MCP** | Generated & refined UI (uploader, cards, modals, theme toggle) |
| **Chrome DevTools MCP** | Screenshots at 1280×800, responsive tests, Lighthouse audits |
| **claude-mem MCP** | Persistent session memory across sessions |
| **GSD Framework** | Planning, review, verification workflow |
| **MongoDB MCP** | DB inspection — schema, indexes, aggregations |

---

# Triggers

**Automatic (agents dispatch by intent):**

| Agent | Trigger phrase |
|---|---|
| `mern-reviewer` | "review", "check for bugs", "audit" |
| `pipeline-debugger` | "upload failed", "pipeline broken", Cohere/Tesseract errors |
| `backend-db-specialist` | "schemas", "routes", "aggregations", "Mongoose" |
| `ai-ocr-specialist` | "OCR", "Cohere", "Myanmar text" |

**Manual (skills via slash command):**

`/setup-env` `/db-seed` `/test-pipeline` `/code-review` `/extract-categorize-bill` `/upload-cloudinary-storage`

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

# ─── Self-check before commit ──────────────
grep -rn "useNewUrlParser\|useUnifiedTopology" server/src/
grep -rn "cloudinary\.uploader\.upload" server/src/
grep -rn "content\[0\]\.text" server/src/
```

---

# Workflow — putting it together

```
User: "Upload this bill"
        │
        ▼
┌───────────────────────────────┐
│  SDD — Phase methodology      │
│  Context7 → docs → implement  │
└──────┬────────────────────────┘
       │
       ├──▶ Claude Code (dev)
       ├──▶ Agent dispatch
       │      ├─ mern-reviewer
       │      ├─ pipeline-debugger
       │      ├─ backend-db-specialist
       │      └─ ai-ocr-specialist
       │
       └──▶ External MCPs
              ├─ Context7 (docs)
              ├─ 21st.dev (UI)
              ├─ MongoDB (DB)
              ├─ Chrome (screenshots)
              └─ claude-mem (memory)
```

---

# Quality gates

```
main ← feature branches

Every commit must pass:
  ✅ Context7 docs resolved before new library
  ✅ Anti-pattern grep returns nothing
  ✅ No .env / API keys / service accounts
  ✅ try/catch on every async call
  ✅ All bills scoped to userId (no data leaks)
  ✅ Pipeline validation — reject amount=0 / Unknown Bill
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

Built with Claude Code · Superpowers · Context7 · 21st.dev
