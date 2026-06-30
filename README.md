# 🧾 phyat-paing — Smart Bill Organizer

## 📖 Description

Phyat Paing (ဖြတ်ပိုင်း) is a full-stack MERN web app for managing utility bills. Upload a photo of any bill — electricity, water, internet, phone, or shopping receipt — and the app automatically extracts the data using OCR and AI, then displays it on a filterable dashboard with spending analytics.

**Built for Myanmar** — handles YESB electricity bills, YCDC water bills, MPT/Ooredoo phone bills, and more. OCR supports both Myanmar (Burmese) and English text, offline via Tesseract.js.

## ❓ The Problem

Managing household bills in Myanmar is tedious and error-prone:

- **Paper bills pile up** — electricity, water, internet, phone bills stack up with no central place to track them
- **Manual data entry** — typing bill amounts and details into spreadsheets is slow and mistakes are common
- **Myanmar language barrier** — most bill management apps only support English; Myanmar utility bills are in Burmese script
- **No spending visibility** — without tracking, it's hard to know where your money goes month-to-month
- **Missed payments** — forgetting due dates leads to late fees and service interruptions

## ✅ The Solution

Phyat Paing eliminates manual bill management with an automated pipeline:

1. **📸 Snap & Upload** — take a photo of any bill (JPEG, PNG, WebP, etc.)
2. **👁️ OCR Extraction** — Tesseract.js reads both Myanmar and English text, offline and free
3. **🤖 AI Classification** — Cohere Command A automatically categorizes the bill (Electricity, Water, Internet, Phone, Shopping, Other) and extracts the title and amount
4. **📊 Dashboard & Analytics** — view all bills in a filterable grid, track spending with donut and line charts, set budget alerts
5. **⏰ Bill Management** — set due dates, mark bills as paid/unpaid, set up recurring bills that auto-create monthly/quarterly/yearly
6. **📤 Export** — download bills as CSV or PDF for record-keeping

No API keys needed for OCR (runs offline). No subscription fees. Just upload and track.

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://phyat-paing.vercel.app/ |
| **Backend** | https://bill-organizer-api.onrender.com/ |

## 📸 Screenshots

### Auth

| Desktop | Mobile |
|---------|--------|
| ![Login](docs/images/auth.png) | ![Login Mobile](docs/images/auth-mobile.png) |
| Login & register with JWT httpOnly cookies | Mobile-responsive auth page |

### Dashboard

| Desktop | Mobile |
|---------|--------|
| ![Dashboard](docs/images/dashboard.png) | ![Dashboard Mobile](docs/images/dashboard-mobile.png) |
| Filterable bill grid with category tabs, search, and date sidebar | Mobile dashboard with hamburger menu |

### Upload & Analytics

| Upload | Analytics |
|--------|-----------|
| ![Upload](docs/images/upload.png) | ![Analytics](docs/images/analytics.png) |
| Drag-and-drop upload with OCR progress stages | Spending breakdown donut chart and monthly trend line |

## How It Works

```
📸 Upload bill image
  → ☁️ Cloudinary (image storage)
  → 👁️ Tesseract.js OCR (Myanmar + English text extraction, offline)
  → 🤖 Cohere Command A (structured JSON classification)
  → 🗄️ MongoDB (bill storage)
  → 📊 React Dashboard (filter, search, edit, delete)
  → 📈 Analytics (spending charts, budget alerts)
  → ⏰ Bill Management (due dates, recurring, payment tracking)
  → 📤 Export (CSV, PDF)
```

## Features

### Core
- 🔐 **User auth** — Register / login with JWT, httpOnly cookies, per-user bill isolation
- 📤 **Upload bills** — JPEG, PNG, WebP, GIF, BMP, TIFF images (10MB max)
- 👁️ **OCR** — Extracts text from Myanmar (Burmese) and English bills, offline via Tesseract.js
- 🤖 **AI classification** — Auto-detects category (Electricity, Water, Internet, Phone, Shopping, Other)
- 🛡️ **Validation** — Rejects unrecognized bills (no amount / unknown title) with descriptive alerts
- ⚡ **Concurrent uploads** — Worker pool handles multiple OCR jobs in parallel
- 📊 **Dashboard** — Responsive grid of bill cards with thumbnails
- 🔍 **Search & filter** — By title, category (7 tabs), and month/year sidebar
- ✏️ **Edit bills** — Correct AI-extracted title, amount, category, due date, and recurring settings
- 🗑️ **Delete** — Removes bill from MongoDB and Cloudinary (with confirmation)
- 📄 **Pagination** — Server-side pagination for large datasets
- 🌙 **Dark mode** — Toggle between light and dark themes (persisted in localStorage)
- 📱 **Responsive** — Mobile-first with hamburger menu and slide-out navigation

### Spending Analytics
- 📊 **Category pie chart** — Donut chart showing spending breakdown by category (Recharts)
- 📈 **Monthly trend chart** — Line chart showing spending over the last 12 months
- 💰 **Budget alerts** — Set per-category spending limits with progress bars (warning at 80%, danger at 100%)
- 📋 **Insights page** — Dedicated analytics view split from the main dashboard

### Bill Management
- 📅 **Due dates** — Set due dates on bills, shown on bill cards
- ⏰ **Upcoming bills** — Widget showing bills due in the next 7 days with overdue alerts
- 🔄 **Recurring bills** — Mark bills as monthly/quarterly/yearly; auto-creates new copies via daily cron
- ✅ **Payment tracking** — Toggle paid/unpaid status with visual indicators

### Polish
- 👤 **Profile page** — View email, member since date, change password
- ⚙️ **Settings page** — Display currency, budget limits, export tools
- 📄 **CSV export** — Download bills as CSV file
- 📑 **PDF export** — Capture dashboard as PDF (html2canvas + jsPDF)
- 🧭 **Navigation** — Header nav for Dashboard, Insights, Profile, Settings
- 🔔 **Toast notifications** — Feedback for all user actions
- 🇲🇲 **Myanmar language** — i18n infrastructure in place, Burmese translations in progress

### Security
- 🔒 **httpOnly cookies** — JWT tokens stored in httpOnly cookies (XSS-safe)
- 🛡️ **Rate limiting** — Auth endpoints (20/15min), upload endpoints (10/min)
- 🔐 **Account lockout** — Locks after 5 failed attempts for 15 minutes
- 🛡️ **Helmet** — Security headers (CSP, X-Frame-Options, HSTS)
- 🔑 **Strong passwords** — Minimum 8 characters with at least one number
- ✉️ **Email validation** — Proper email format validation
- 🚫 **CORS** — Strict origin validation in production
- 🧹 **Error sanitization** — Generic error messages in production

### Reliability
- 🔄 **Retry logic** — Cloudinary and Cohere API calls retry on failure (2 retries)
- ⏱️ **Request timeout** — 120s timeout prevents hung requests
- 🛑 **Graceful shutdown** — Closes DB connections and Tesseract workers on SIGTERM/SIGINT
- 🚫 **No silent fallback** — Production fails hard if MongoDB is unreachable
- 📍 **Proper cache path** — Tesseract uses temp directory (works on any machine)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB Atlas + Mongoose 9 |
| **Image Storage** | Cloudinary |
| **OCR** | Tesseract.js (offline, no API keys needed) |
| **AI Classification** | Cohere Command A |
| **Auth** | JWT (jsonwebtoken + bcryptjs) + httpOnly cookies |
| **File Upload** | Multer (memory storage) |
| **Charts** | Recharts (pie + line charts) |
| **PDF Export** | jsPDF + html2canvas |
| **Scheduling** | node-cron (recurring bills) |
| **Logging** | Pino (structured JSON in production) |
| **Security** | Helmet, express-rate-limit, cookie-parser |
| **Icons** | Lucide React |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas cluster (or local MongoDB, or auto-fallback to in-memory for development)
- Cloudinary account (free tier works)
- Cohere API key

### Setup

```bash
# Clone
git clone git@github.com:youuu199/phyat-paing.git
cd phyat-paing

# Install dependencies
cd client && npm install
cd ../server && npm install
cd ..

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your credentials
```

### Environment Variables (`server/.env`)

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/bill-organizer?retryWrites=true&w=majority
PORT=5000
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
COHERE_API_KEY=<your-cohere-api-key>
JWT_SECRET=<random-256-bit-secret>
FRONTEND_URL=http://localhost:5173
COHERE_MODEL=command-a-plus-05-2026
LOG_LEVEL=debug
```

### Run

```bash
# Backend (terminal 1)
cd server && npm run dev        # http://localhost:5000

# Frontend (terminal 2)
cd client && npm run dev        # http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the Express backend automatically.

### Demo Mode (no API keys needed)

```bash
cd server && node src/stub.js   # Mock backend with 6 demo bills
cd client && npm run dev        # http://localhost:5173
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login, returns JWT token (also sets httpOnly cookie) |
| `POST` | `/api/v1/auth/logout` | Logout, clears auth cookie |
| `GET` | `/api/v1/auth/me` | Get current user info |
| `PATCH` | `/api/v1/auth/change-password` | Change password (auth required) |

### Bills

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/bills` | Upload bill image → full pipeline (Cloudinary → OCR → AI → MongoDB) |
| `GET` | `/api/v1/bills` | List bills (`?category=`, `?year=`, `?month=`, `?limit=`, `?skip=`) |
| `GET` | `/api/v1/bills/months` | Available year-month periods with bill counts |
| `GET` | `/api/v1/bills/stats` | Spending summary grouped by category |
| `GET` | `/api/v1/bills/trends` | Monthly spending totals (`?months=12`) |
| `GET` | `/api/v1/bills/upcoming` | Bills due in the next 7 days |
| `GET` | `/api/v1/bills/export` | Export bills as CSV (`?year=`, `?month=`) |
| `PATCH` | `/api/v1/bills/:id` | Update bill (title, amount, category, dueDate, recurring) |
| `PATCH` | `/api/v1/bills/:id/payment` | Toggle paid/unpaid status |
| `POST` | `/api/v1/bills/:id/recurring` | Set recurring schedule (`monthly`, `quarterly`, `yearly`) |
| `DELETE` | `/api/v1/bills/:id` | Delete a bill (removes from MongoDB and Cloudinary) |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/v1/upload` | Upload image to Cloudinary only (auth required) |

> **Note:** Legacy `/api/auth`, `/api/bills`, `/api/upload` routes also work for backward compatibility.

## Myanmar Bills Support

| Category | Examples |
|----------|---------|
| ⚡ Electricity | YESB, MESC, Yangon Electricity (လျှပ်စစ်မီတာခ) |
| 💧 Water | YCDC, City Development (ရေခွန်) |
| 🌐 Internet | MPT Fiber, Ooredoo, MyTel |
| 📱 Phone | Telenor, Ooredoo, MPT top-up |
| 🛒 Shopping | CityMart, Junction, Myanmar Plaza |
| 📌 Other | Medical, transport, etc. |

## Project Structure

```
phyat-paing/
├── client/                          # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx                  # App shell with navigation + theme toggle
│   │   ├── types.ts                 # Shared TypeScript interfaces
│   │   ├── navigation.ts            # Nav items, brand name, tagline
│   │   ├── i18n/
│   │   │   └── en.json              # English translation strings
│   │   ├── components/
│   │   │   ├── AuthPage.tsx         # Login/register page
│   │   │   ├── AuthContext.tsx      # JWT token management + apiFetch
│   │   │   ├── BillUploader.tsx     # File input + upload with progress stages
│   │   │   ├── BillDashboard.tsx    # Main dashboard with filters + state
│   │   │   ├── BillCard.tsx         # Bill card (view, edit, delete, payment toggle)
│   │   │   ├── BillEditModal.tsx    # Modal for editing bill details + recurring
│   │   │   ├── CategoryTabs.tsx     # 7 category filter tabs
│   │   │   ├── Sidebar.tsx          # Month/year date filter sidebar
│   │   │   ├── InsightsPage.tsx     # Analytics page (charts + budgets)
│   │   │   ├── SpendingOverview.tsx # Donut chart + budget alerts
│   │   │   ├── MonthlyTrendChart.tsx# Monthly spending line chart
│   │   │   ├── UpcomingBills.tsx    # Bills due in next 7 days
│   │   │   ├── PaymentToggle.tsx    # Mark bills paid/unpaid
│   │   │   ├── RecurringBadge.tsx   # Recurring bill indicator
│   │   │   ├── ProfilePage.tsx      # User profile + change password
│   │   │   ├── SettingsPage.tsx     # Currency, budgets, export
│   │   │   ├── MobileNav.tsx        # Slide-out mobile navigation
│   │   │   ├── ThemeToggle.tsx      # Dark/light mode toggle
│   │   │   ├── ExportButtons.tsx    # CSV + PDF export
│   │   │   ├── Toast.tsx            # Toast notification component
│   │   │   └── ErrorBoundary.tsx    # React error boundary
│   │   ├── utils/
│   │   │   └── nav.ts               # Nav config (items, brand, tagline)
│   │   ├── App.css                  # All component styles
│   │   └── index.css                # CSS variables + global reset
│   └── vite.config.ts               # Vite config + /api proxy
├── server/                          # Express + Mongoose + Cloudinary + Tesseract + Cohere
│   ├── src/
│   │   ├── app.js                   # Express app with middleware + routes
│   │   ├── server.js                # Bootstrap: env → MongoDB → Express + shutdown
│   │   ├── models/
│   │   │   ├── Bill.js              # Mongoose bill schema (due dates, recurring, payment)
│   │   │   └── User.js              # Mongoose user schema (account lockout)
│   │   ├── controllers/
│   │   │   ├── billController.js    # CRUD + pipeline + trends + export + payment
│   │   │   └── authController.js    # Register / login / logout / me / change-password
│   │   ├── routes/
│   │   │   ├── billRoutes.js        # /api/v1/bills routes (rate limited)
│   │   │   ├── authRoutes.js        # /api/v1/auth routes (rate limited)
│   │   │   └── upload.js            # /api/v1/upload routes (auth + rate limited)
│   │   ├── middleware/
│   │   │   ├── upload.js            # Multer memoryStorage config
│   │   │   └── auth.js              # JWT verification (cookie + header)
│   │   ├── config/db.js             # MongoDB connection (production-safe)
│   │   └── utils/
│   │       ├── cloudinaryStorage.js # upload/delete with retry logic
│   │       ├── ocrService.js        # Tesseract.js scheduler pool (eng+mya)
│   │       ├── cohereService.js     # Cohere structured JSON extraction (cached client)
│   │       ├── recurringService.js  # Daily cron for recurring bill auto-creation
│   │       └── logger.js            # Pino structured logger
│   └── .env.example                 # Environment variables template
├── docs/
│   ├── images/
│   │   ├── auth.png                 # Login page (desktop)
│   │   ├── auth-mobile.png          # Login page (mobile)
│   │   ├── dashboard.png            # Dashboard (desktop)
│   │   ├── dashboard-mobile.png     # Dashboard (mobile)
│   │   ├── upload.png               # Upload page
│   │   └── analytics.png            # Analytics/insights page
│   └── superpowers/specs/           # Design docs + audit reports
├── CLAUDE.md                        # AI assistant instructions + allowed APIs
└── .gitignore
```

## Deployment

### Live Environment

| Service | Platform | Status |
|---------|----------|--------|
| **Frontend** | Vercel | ✅ Live |
| **Backend** | Render | ✅ Live |
| **Database** | MongoDB Atlas | ✅ Connected |
| **Images** | Cloudinary | ✅ Connected |

### Architecture

```
Frontend (Vercel) → Backend (Render) → MongoDB Atlas
     ↓                    ↓
  Static site        Express API
  /api/* proxy       Tesseract OCR
                     Cohere AI
                     Cloudinary
                     node-cron (recurring)
```

### Quick Deploy

1. **Fork/clone this repository**

2. **Set up MongoDB Atlas:**
   - Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
   - Get your connection string
   - Add Render IPs to the whitelist: `0.0.0.0/0` (or specific IPs)

3. **Set up Vercel:**
   - Connect your GitHub repo to [Vercel](https://vercel.com)
   - Set root directory to `client/`
   - The `vercel.json` auto-configures `/api/*` rewrites to the backend

4. **Set up Render:**
   - Create a new Web Service at [Render](https://render.com)
   - Connect your GitHub repo, set root directory to `server/`
   - Add environment variables (see table below)

5. **Push to main** — both Vercel and Render auto-deploy on push

### Environment Variables (Production)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/bill-organizer` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` |
| `COHERE_API_KEY` | Cohere API key | `your-cohere-key` |
| `JWT_SECRET` | JWT secret for auth | `random-256-bit-secret` |
| `FRONTEND_URL` | Vercel frontend URL (for CORS) | `https://phyat-paing.vercel.app` |
| `COHERE_MODEL` | Cohere model name (optional) | `command-a-plus-05-2026` |
| `LOG_LEVEL` | Log level (optional) | `info` |

### Health Check

```bash
curl https://bill-organizer-api.onrender.com/api/health
```

```json
{"status":"healthy","timestamp":"...","uptime":...,"environment":"production"}
```

## Audit Report

A comprehensive weakness audit was conducted on 2026-06-21. See `docs/superpowers/specs/2026-06-21-weakness-audit.md` for the full report.

- 🔴 Critical: 4/4 fixed
- 🟡 Medium: 6/6 fixed
- 🟢 Low: 9/12 fixed
- 🔵 Backlog: 8/11 fixed

**27 issues fixed across security, performance, code quality, UX, and architecture.**

## License

MIT
