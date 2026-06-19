---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

**Youuu199** — a developer in **Myanmar** drowning in paper utility bills.

Every month: photograph an electricity bill (လျှပ်စစ်), a water receipt (ရေ), an internet invoice… then manually type amounts into a spreadsheet. Mixed-language bills (Burmese + English) make copy-paste impossible. Receipt ink fades. Paper piles up.

They want one place to snap, auto-extract, search, and see spending trends — no manual data entry.

---

<!-- slide 2 -->
# Their problem
<!-- 20s -->

| Pain | Reality |
|------|---------|
| 📸 **Snap → Type** | Photo of bill exists, but numbers must be re-typed manually |
| 🇲🇲 **Myanmar script** | `ကျသင့်ငွေ ၂၅၀၀၀` — OCR fails on Burmese, no off-the-shelf tool handles it |
| 📦 **No structure** | Amounts scattered across camera roll, not a database |
| 🔍 **No search** | "How much did I spend on electricity in March?" → scroll through photos |
| ⏱️ **Time sink** | 5–10 minutes per bill × 4+ bills/month × 12 months = hours lost |

Existing expense-tracker apps expect manual input or English receipts. They don't understand a YESB bill with **Myanmar script** and a total buried in a grid of numbers.

---

<!-- slide 3 -->
# What I built
<!-- 20s -->

**phyat-paing** (ဖြတ်ပိုင်း — "bill/receipt" in Burmese)

```
📸 Upload bill image
  → ☁️ Cloudinary (image stored)
  → 👁️ Tesseract.js OCR (Burmese + English, offline)
  → 🤖 Cohere Command A (extracts title, amount, category)
  → 🛡️ Validation (rejects unrecognized bills)
  → 🗄️ MongoDB (per-user storage)
  → 📊 React Dashboard (filter, search, stats)
```

**User flow:** Register → snap a bill → see it appear on a filterable dashboard with category, month, and total-spend summary. Zero manual typing.

---

<!-- slide 4 -->
# How I built it
<!-- 20s -->

**MERN stack** — Vite + React-TS frontend, Express + Mongoose backend

| Tool | What it did |
|------|------------|
| 🔌 **MCP: Context7** | Resolved live docs for Cloudinary `upload_stream()`, Cohere `response_format.schema`, Tesseract `createScheduler()`, Mongoose 8.x connect |
| 🔌 **MCP: 21st.dev** | Generated React component scaffolding — bill cards, sidebar, uploader |
| 🎯 **Skill: test-pipeline** | End-to-end pipeline test: Cloudinary → Tesseract → Cohere → MongoDB |
| 🎯 **Skill: code-review** | Grep-checked 13 anti-patterns before every commit |
| 🎯 **Skill: extract-categorize-bill** | Standalone Cohere debug — reprocess rawText without re-uploading |
| 🤖 **Agent: ai-ocr-specialist** | Designed Tesseract scheduler pool (3 workers) — fixed second-upload timeout |
| 🤖 **Agent: pipeline-debugger** | Isolated 5-stage pipeline failures stage-by-stage |
| 🤖 **Agent: mern-reviewer** | Caught: `upload()` on Buffer, missing `userId` filters, Cohere v1 client |

---

<!-- slide 5 -->
# Why it matters
<!-- 20s -->

**For Myanmar users:**
- First open-source bill organizer that reads **Burmese script** (မြန်မာ) offline via Tesseract `eng+mya`
- No API keys needed for OCR — works entirely offline after first language-data download
- Categories tuned to Myanmar utility ecosystem: YESB, MESC, YCDC, MPT Fiber, Ooredoo, Telenor

**Technical depth:**
- **Worker-pool concurrency** solved the "second upload hangs" bug — `createScheduler()` with 3 workers instead of single `createWorker()`
- **Multi-stage validation** — Cloudinary image cleaned up on AI rejection (no orphaned files)
- **Graceful degradation** — MongoDB Atlas unreachable → auto-fallback to `mongodb-memory-server`

**Why an agent helped build this better:**
Agents ran adversarial grep checks across 46 changed files that a human would miss — caught Cohere v1 client, missing `userId` filters (data-leak bug), and `upload()` on Buffer (crash-at-runtime) before they shipped.

---

<!-- slide 6 -->
# Done checklist
<!-- 20s -->

- [x] **Repo public** — [github.com/youuu199/phyat-paing](https://github.com/youuu199/phyat-paing)
- [x] **MCP used** — Context7 (Cloudinary, Cohere, Tesseract, Mongoose docs) + 21st.dev (React components)
- [x] **Skills used** — `test-pipeline`, `code-review`, `extract-categorize-bill`, `setup-env`
- [x] **Agents used** — `mern-reviewer`, `pipeline-debugger`, `ai-ocr-specialist`
- [x] **report.md in team repo** — [link](https://github.com/youuu199/phyat-paing/blob/main/slides/report.md)

**Live at:** `http://localhost:5173` ← `npm run dev` in both `server/` and `client/`
