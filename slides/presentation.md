---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

# Who's my person?
Meet **Youuu199** — a developer in **Myanmar** drowning in paper utility bills.

**The Monthly Grind:** Photographing electricity (လျှပ်စစ်), water (ရေ), and internet bills, then manually typing the amounts into a spreadsheet. 

**The Roadblocks:**
* Mixed-language bills (Burmese + English) make standard copy-pasting impossible.
* Receipt ink fades; paper piles up.
* They need a centralized hub to snap, auto-extract, search, and track spending trends—with **zero manual data entry**.

---

# Their Problem
| Pain Point | The Harsh Reality |
|------|---------|
| 📸 **Snap → Type** | Photos sit in the camera roll, but numbers must still be typed. |
| 🇲🇲 **Myanmar Script** | `ကျသင့်ငွေ ၂၅၀၀၀` — Standard OCR fails on Burmese text. |
| 📦 **No Structure** | Expenses are scattered images, not searchable data. |
| 🔍 **No Search** | "March electricity bill?" = endless scrolling through photos. |
| ⏱️ **Time Sink** | 10 mins/bill × 4 bills/month × 12 months = hours wasted. |

Existing tracker apps expect manual input or clean English receipts. They fail completely on a YESB bill with **Myanmar script** and totals buried in messy number grids.

---

# What I Built
**phyat-paing** (ဖြတ်ပိုင်း — "bill/receipt" in Burmese)

**The Zero-Typing Pipeline:**
1. 📸 **Upload** → User snaps bill image
2. ☁️ **Cloudinary** → Secure cloud storage
3. 👁️ **Tesseract.js** → Offline OCR (Extracts Burmese + English)
4. 🤖 **Cohere Command R** → LLM parses Title, Amount, and Category
5. 🛡️ **Validation** → Rejects unrecognized/invalid bills
6. 🗄️ **MongoDB** → Saves to user's database
7. 📊 **React Dashboard** → Search, filter, and view spending stats

**Result:** Snap a photo, see the structured data. Done.

---

# How I Built It
**Tech Stack:** MERN (Vite + React-TS, Express + Mongoose)

| AI Tooling | Contribution to the Project |
|------|------------|
| 🔌 **MCP: Context7** | Resolved live docs for Cloudinary, Cohere, Tesseract, & Mongoose |
| 🔌 **MCP: 21st.dev** | Generated React component scaffolding (cards, sidebar, uploader) |
| 🎯 **Skill: test-pipeline** | E2E testing: Cloudinary → Tesseract → Cohere → MongoDB |
| 🎯 **Skill: code-review** | Grep-checked 13 anti-patterns before every single commit |
| 🎯 **Skill: extract...** | Standalone AI debug: Reprocessed raw text without re-uploading |
| 🤖 **Agent: ai-ocr** | Built a Tesseract scheduler pool (3 workers) to fix upload timeouts |
| 🤖 **Agent: debugger** | Isolated failures stage-by-stage across the 5-step pipeline |
| 🤖 **Agent: reviewer** | Caught critical bugs: memory leaks, missing `userId`, legacy APIs |

---

# Why It Matters
**For Myanmar Users:**
- The first open-source bill organizer to parse **Burmese script** (မြန်မာ) offline using Tesseract `eng+mya`.
- Customized categories for the local ecosystem: YESB, YCDC, MPT, Ooredoo.

**Technical Depth:**
- **Worker-Pool Concurrency:** Fixed the "second upload hangs" bug using `createScheduler()` with 3 workers.
- **Multi-Stage Validation:** Automated Cloudinary cleanup on AI rejection (zero orphaned files).
- **Graceful Degradation:** Auto-fallbacks to `mongodb-memory-server` if Atlas fails.

**The Agent Advantage:**
Agents ran adversarial grep checks across 46 files, catching data-leak bugs and runtime crashes that human eyes would have easily missed before shipping.

---

# Done Checklist
- [x] **Repo public** — [github.com/youuu199/phyat-paing](https://github.com/youuu199/phyat-paing)
- [x] **MCP used** — Context7 (Docs) + 21st.dev (UI Components)
- [x] **Skills used** — `test-pipeline`, `code-review`, `extract-categorize-bill`, `setup-env`
- [x] **Agents used** — `mern-reviewer`, `pipeline-debugger`, `ai-ocr-specialist`
- [x] **Report generated** — [View report.md](https://github.com/youuu199/phyat-paing/blob/main/slides/report.md)

**Live at:** `http://localhost:5173` *(Run `npm run dev` in both `server/` and `client/`)*