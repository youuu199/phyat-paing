---
marp: true
theme: default
paginate: true
auto-advance: 20
backgroundColor: #0A0A0A
color: #FFFFFF
style: |
  section {
    font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
    padding: 40px 60px;
  }
  h1 { color: #88A2FF; font-size: 2.4em; margin-bottom: 0.3em; }
  h2 { color: #E3FC87; font-size: 1.8em; margin-bottom: 0.4em; }
  h3 { color: #C0E0FF; }
  strong { color: #FFB2F7; }
  ul { font-size: 1.2em; line-height: 1.8; }
  li { margin-bottom: 0.3em; }
  a { color: #AB9DFF; }
  .small { font-size: 0.85em; color: #999; }
  .tag { display: inline-block; background: #253A82; color: #C0E0FF; padding: 2px 12px; border-radius: 20px; font-size: 0.8em; margin: 4px; }
---

<!-- _class: lead -->

# PHYAT-PAING
## Smart Bill Organizer for Myanmar

**"ဒီဘေလ်ကို ဓာတ်ပုံရိုက်လိုက်"**

*Just snap the bill.*

<div class="small">Youuu199 · June 2026</div>

---

<!-- _header: "The Person" -->

## 👤 Who's My Person?

<br>

- **Myint Zu** — freelance accountant, Yangon, 3 shops
- **Every month** — collects paper bills from YESB, YCDC, MPT Fiber
- **Every bill** — printed in Burmese, photographed on phone, manually re-typed into Excel
- **4 hours/month** lost to data entry
- Tried OCR apps → **fail on Burmese script** (`ကျသင့်ငွေ ၂၅၀၀၀`)
- Tried expense apps → **don't know YESB or YCDC**

<br>

<div class="small">She owns a basic laptop. She is not a developer. She just wants the typing to stop.</div>

---

<!-- _header: "The Problem" -->

## 📄 Every Month, Same Grind

<br>

| Step | Tool | Time |
|------|------|------|
| 📸 Collect bills | Paper + phone photos | — |
| 🔍 Read each photo | Swipe through camera roll | 30 min |
| ⌨️ Type amount + date + category | Excel, manual | 2 hours |
| 📊 Calculate totals per category | Excel formulas | 30 min |
| 🔎 Find a past bill | Scroll months of photos | 15 min each |

<br>

> **Burmese OCR fails. Myanmar billers unknown. No local solution exists.**

---

<!-- _header: "The Solution" -->

## 🤖 What I Built

<br>

1. **📸 Upload a bill** — JPEG, PNG, WebP, any phone photo
2. **☁️ Stored on Cloudinary** — secure, auto-optimized
3. **👁️ Tesseract.js OCR** — reads Burmese + English, **offline, free**
4. **🧠 Cohere AI** — extracts title, amount, category
5. **🛡️ Validation** — rejects unrecognized images instantly
6. **📊 Dashboard** — filter by category, month, see spending stats

<br>

> *Snap a YESB electricity bill → "March Electricity · 25,000 MMK · Electricity" appears on dashboard. Zero typing.*

---

<!-- _header: "How I Built It" -->

## ⚙️ Tools & Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vite + React 19 + TypeScript |
| **Backend** | Node.js + Express 4 |
| **Database** | MongoDB Atlas + Mongoose 8 (in-memory fallback) |
| **OCR** | Tesseract.js `eng+mya` — scheduler worker pool (3 workers) |
| **AI Engine** | Cohere Command A — structured JSON extraction |
| **Images** | Cloudinary — `upload_stream()` from Buffer |
| **Auth** | JWT + bcrypt — per-user bill isolation |

<div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
<span class="tag">MCP: Context7</span>
<span class="tag">MCP: 21st.dev</span>
<span class="tag">Skill: test-pipeline</span>
<span class="tag">Skill: code-review</span>
<span class="tag">Agent: mern-reviewer</span>
<span class="tag">Agent: pipeline-debugger</span>
<span class="tag">Agent: ai-ocr-specialist</span>
</div>

---

<!-- _header: "Why It Matters" -->

## 💡 Impact

<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px;">

<div>

### 👤 For Myint Zu
- **4 hours/month → 4 seconds per bill**
- ~50 hours saved per year
- No more Excel. No more camera roll scrolling.

### 🇲🇲 For Myanmar
- First open-source bill reader for **Burmese script**
- Tesseract `eng+mya` — offline, no API key needed
- Categories tuned to YESB, MESC, YCDC, MPT Fiber, Ooredoo

</div>

<div>

### 🛠️ For the Builder
- **3 agents** caught bugs humans miss:
  - Missing `userId` filter → data leak
  - `upload()` on Buffer → crash
  - Single Tesseract worker → timeout
- **Worker pool** fixed second-upload hang
- **Pipeline validation** prevents garbage bills

</div>

</div>

---

<!-- _class: lead -->

# 🚀 Try It Live

<br>

### 🔗 **github.com/youuu199/phyat-paing**

<br>

```bash
git clone git@github.com:youuu199/phyat-paing.git
cd server && npm run dev    # http://localhost:5000
cd client && npm run dev    # http://localhost:5173
```

<br>

<div style="display:flex;gap:10px;justify-content:center;margin-top:30px;">
<span class="tag">React 19</span>
<span class="tag">Express</span>
<span class="tag">Tesseract.js</span>
<span class="tag">Cohere AI</span>
<span class="tag">Cloudinary</span>
<span class="tag">MongoDB</span>
<span class="tag">Myanmar 🇲🇲</span>
</div>

<br>

## ✨ ကျေးဇူးတင်ပါတယ် — Thank You!
