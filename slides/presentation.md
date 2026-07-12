---
marp: true
paginate: true
transition: fade
size: 16:9
title: Pyat Paing — AI-Powered Bill Organizer
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
  strong { color: var(--primary); }
  a { color: var(--primary); text-decoration: none; }
  table { font-size: 22px; border-collapse: collapse; }
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
  .tag {
    display: inline-block; background: var(--primary); color: var(--paper);
    font-size: 16px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; padding: 4px 12px; border-radius: 999px;
  }
  .muted { color: var(--ink-soft); }
  section.dark { background: #211D1A; color: #F3ECDC; }
  section.dark h1, section.dark h2, section.dark h3 { color: #F3ECDC; }
  section.dark strong { color: #818CF8; }
  section.dark a { color: #818CF8; }
  footer, header { color: var(--ink-soft); }
  section::after { color: var(--ink-soft); }
  img { border-radius: 10px; box-shadow: 0 8px 30px rgba(43,38,34,.18); }
---

<!-- _class: lead -->
<!-- _paginate: false -->

<span class="tag">MERN Stack Project</span>

# Pyat Paing

### AI-Powered Bill Organizer for Myanmar

<span class="muted">Upload bills → OCR → AI Classification → Dashboard → Analytics</span>

---

## The Problem

Managing household bills in Myanmar is painful:

- 📄 **Paper bills pile up** — electricity, water, internet, phone bills stack up
- ⌨️ **Manual data entry** — typing amounts into spreadsheets is slow and error-prone
- 🇲🇲 **Myanmar language barrier** — most apps only support English
- 💸 **No spending visibility** — hard to know where your money goes
- ⏰ **Missed payments** — forgotten due dates = late fees

---

## The Solution

**Pyat Paing** automates the entire bill management workflow:

1. 📸 **Snap & Upload** — take a photo of any bill
2. 👁️ **OCR Extraction** — reads Myanmar + English text (offline, free)
3. 🤖 **AI Classification** — auto-detects title, amount, category, currency
4. 💱 **Currency Conversion** — converts to MMK with live exchange rates
5. 📊 **Dashboard** — filterable grid with spending analytics
6. ⏰ **Bill Management** — due dates, recurring, payment tracking

---

## How It Works

```
📸 Upload bill image
  → ☁️ Cloudinary (image storage)
  → 👁️ Tesseract.js OCR (Myanmar + English, offline)
  → 🤖 Cohere Command A (structured JSON + currency detection)
  → 💱 Currency Conversion (live rates from open.er-api.com)
  → 🗄️ MongoDB (bill storage in MMK)
  → 📊 React Dashboard (filter, search, edit, analytics)
```

---

<!-- _class: lead -->

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB Atlas + Mongoose 9 |
| **OCR** | Tesseract.js (offline, no API keys) |
| **AI** | Cohere Command A |
| **Storage** | Cloudinary |
| **Charts** | Recharts |
| **Styling** | Tailwind CSS v4 |
| **Auth** | JWT + httpOnly cookies |

---

## Live Demo — Login & Auth

![w:640](screenshots/01-login.png)

- JWT httpOnly cookies (XSS-safe)
- Account lockout after 5 failed attempts
- Rate limiting on auth endpoints

---

## Live Demo — Dashboard

![w:640](screenshots/02-dashboard.png)

- Total bills, spending, unpaid count at a glance
- Budget alerts (warning at 80%, danger at 100%)
- Upcoming bills with overdue indicators

---

## Live Demo — Bills Page

![w:640](screenshots/03-bills.png)

- Month-by-month navigation
- Category filter tabs
- Edit bills with image replacement
- Toggle paid/unpaid status

---

## Live Demo — Upload

![w:640](screenshots/04-upload.png)

- Drag & drop or browse files
- Background uploads continue when navigating away
- Progress indicator with dismiss buttons

---

## Live Demo — Analytics

![w:640](screenshots/05-analytics.png)

- Period filters: Week / Month / Quarter / Year
- Monthly spending bar chart
- Category breakdown with percentages
- Dynamic insights

---

## Live Demo — Calendar

![w:640](screenshots/06-calendar.png)

- Bills shown as chips on due dates
- Click any day to see details + toggle payment
- Month stats sidebar

---

## Live Demo — Settings

![w:640](screenshots/07-settings.png)

- 6 currencies: MMK, USD, EUR, GBP, JPY, THB
- Light / Dark / System theme (applies instantly)
- Budget alerts with per-category limits
- CSV export

---

## Live Demo — Profile

![w:640](screenshots/08-profile.png)

- Avatar upload (Cloudinary)
- Display name
- Account statistics
- Change password

---

## Currency Conversion Pipeline

All bills stored in **MMK** as base currency:

| Step | What Happens |
|------|-------------|
| 1. Upload | User uploads a bill (e.g., $145.67 USD) |
| 2. OCR | Tesseract extracts text from image |
| 3. AI | Cohere detects currency from symbols/text |
| 4. Convert | Backend: $145.67 × 2,103 = **306,408 MMK** |
| 5. Store | MongoDB: `amount: 306408`, `originalCurrency: "USD"` |
| 6. Display | Frontend converts back to user's currency |

**Live rates** from open.er-api.com, cached for 1 hour.

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| 🔒 **Auth** | JWT in httpOnly cookies + Bearer token |
| 🛡️ **Rate limiting** | Auth: 20/15min, Upload: 10/min |
| 🔐 **Account lockout** | 5 failed attempts → 15min lock |
| 🛡️ **Helmet** | CSP, HSTS, X-Frame-Options |
| 🔑 **Password** | bcryptjs hash, min 8 chars + 1 number |
| 🚫 **CORS** | Strict origin in production |
| 🧹 **Error sanitization** | Generic messages in production |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Vite)                  │
│  React 19 · TypeScript · Tailwind · Recharts     │
│  Lazy-loaded pages · Background uploads           │
└──────────────────────┬──────────────────────────┘
                       │ /api/*
┌──────────────────────▼──────────────────────────┐
│                Backend (Express 5)                │
│  JWT Auth · Multer · Rate Limiting · Pino Logger │
├──────────────────────────────────────────────────┤
│  Pipeline: Cloudinary → Tesseract → Cohere → MMK │
└────┬──────────┬──────────┬──────────┬───────────┘
     │          │          │          │
  Cloudinary  Tesseract  Cohere    MongoDB
  (images)    (OCR)      (AI)     (Atlas)
```

---

<!-- _class: dark -->

## Key Features Summary

- 📸 **Smart Upload** — drag & drop, background processing, multi-file
- 👁️ **Dual OCR** — Myanmar + English text extraction (offline)
- 🤖 **AI Classification** — auto category + currency detection
- 💱 **Live Currency** — 6 currencies with real-time rates
- 📊 **Analytics** — period filters, charts, budget alerts
- 📅 **Calendar** — interactive view with day details
- 🎨 **Themes** — Light / Dark / System (instant apply)
- 👤 **Profile** — avatar, display name, account stats
- 🔒 **Security** — JWT, rate limiting, account lockout

---

<!-- _class: dark -->
<!-- _paginate: false -->

## Get Started

**GitHub:** [github.com/youuu199/pyat-paing](https://github.com/youuu199/pyat-paing)

```bash
git clone https://github.com/youuu199/pyat-paing.git
cd pyat-paing

# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev
```

### Upload. Track. Save Money. 💰
