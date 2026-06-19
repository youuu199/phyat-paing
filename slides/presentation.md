---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

**Myint Zu** — a freelance accountant in Yangon, Myanmar.

She manages expenses for 3 small shops. Every supplier hands her a paper bill — electricity from YESB, water from YCDC, internet from MPT Fiber. All printed in Burmese. All photographed on her phone. All manually re-typed into Excel at the end of each month.

She owns a basic laptop. She is not a developer. She just wants the typing to stop.

---

<!-- slide 2 -->
# Their problem
<!-- 20s -->

Myint Zu spends **4 hours every month** re-typing bills.

| Step | Tool | Time |
|------|------|------|
| Collect bills | Paper + phone photos | — |
| Read each photo | Swipe through camera roll | 30 min |
| Type amount + date + category | Excel, manual | 2 hours |
| Calculate totals per category | Excel formulas | 30 min |
| Find a past bill | Scroll through months of photos | 15 min each |

OCR apps fail on **Burmese script** (`ကျသင့်ငွေ ၂၅၀၀၀`). Expense apps don't know YESB or YCDC. She has tried both. She gave up.

---

<!-- slide 3 -->
# What I built
<!-- 20s -->

**phyat-paing** (ဖြတ်ပိုင်း — "receipt" in Burmese)

A web app where Myint Zu snaps a bill once and the machine does the rest.

```
📸 Upload photo of bill
   → ☁️ Saved to Cloudinary
   → 👁️ Tesseract.js reads Burmese + English text (offline, free)
   → 🤖 Cohere AI extracts: title, amount, category
   → 🛡️ Validation rejects unrecognized images
   → 📊 Dashboard shows all bills, filterable by category and month
```

No typing. No Excel. No scrolling through camera roll.

---

<!-- slide 4 -->
# How I built it
<!-- 20s -->

**MERN stack** — React + Express + MongoDB

| Tool | What it did |
|------|------------|
| 🔌 **MCP: Context7** | Resolved live docs for every library — Cloudinary `upload_stream()`, Cohere `response_format.schema`, Tesseract `createScheduler()`, Mongoose 8.x |
| 🔌 **MCP: 21st.dev** | Generated React component scaffolding — BillCard, Sidebar, Uploader |
| 🎯 **Skill: test-pipeline** | End-to-end pipeline test — Cloudinary → Tesseract → Cohere → MongoDB |
| 🎯 **Skill: code-review** | Grep-checked 13 anti-patterns before every commit |
| 🎯 **Skill: extract-categorize-bill** | Standalone Cohere debug — reprocess rawText without re-uploading |
| 🤖 **Agent: ai-ocr-specialist** | Designed Tesseract scheduler pool (3 workers) — fixed second-upload timeout |
| 🤖 **Agent: pipeline-debugger** | Isolated failures across 5 pipeline stages |
| 🤖 **Agent: mern-reviewer** | Caught `upload()` on Buffer, missing `userId` filters, Cohere v1 client |

---

<!-- slide 5 -->
# Why it matters
<!-- 20s -->

**For Myint Zu:** 4 hours/month → 4 seconds per bill. That's ~50 hours saved per year.

**For Myanmar:** First open-source bill reader that handles Burmese script offline. No API key needed for OCR — Tesseract `eng+mya` runs entirely on-device after one language download. Categories are tuned to real Myanmar billers: YESB, MESC, YCDC, MPT Fiber, Ooredoo, Telenor.

**For the builder:** Three agents ran adversarial checks across 46 files before shipping — catching a data-leak bug (missing `userId` filter), a crash-on-upload anti-pattern (`upload()` on Buffer), and a concurrency deadlock (single Tesseract worker causing second-upload timeout). None of these would have been caught by `npm run dev`.

---

<!-- slide 6 -->
# Done checklist
<!-- 20s -->

- [x] **Repo public** — [github.com/youuu199/phyat-paing](https://github.com/youuu199/phyat-paing)
- [x] **MCP used** — Context7 (live docs) + 21st.dev (React components)
- [x] **Skills used** — `test-pipeline`, `code-review`, `extract-categorize-bill`, `setup-env`
- [x] **Agents used** — `mern-reviewer`, `pipeline-debugger`, `ai-ocr-specialist`
- [x] **report.md** — [github.com/youuu199/phyat-paing/blob/main/slides/report.md](https://github.com/youuu199/phyat-paing/blob/main/slides/report.md)

**4 commits.** **46 files.** **4,117 lines added.**

```
npm run dev → http://localhost:5173
```
