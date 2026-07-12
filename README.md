# 🧾 Pyat Paing (ဖြတ်ပိုင်း) — AI-Powered Bill Organizer

## 📖 Description

Pyat Paing (ဖြတ်ပိုင်း) is a full-stack MERN web app for managing utility bills. Upload a photo of any bill — electricity, water, internet, phone, or shopping receipt — and the app automatically extracts the data using OCR and AI, converts currencies in real-time, and displays everything on a filterable dashboard with spending analytics.

**Built for Myanmar** — handles YESB electricity bills, YCDC water bills, MPT/Ooredoo phone bills, and more. OCR supports both Myanmar (Burmese) and English text, offline via Tesseract.js. Bills in any currency (USD, EUR, GBP, JPY, THB) are auto-detected and converted to MMK for storage, then displayed in your preferred currency using live exchange rates.

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

| Page | Preview |
|------|---------|
| **Login** | ![Login](slides/screenshots/01-login.png) |
| **Dashboard** | ![Dashboard](slides/screenshots/02-dashboard.png) |
| **Bills** | ![Bills](slides/screenshots/03-bills.png) |
| **Upload** | ![Upload](slides/screenshots/04-upload.png) |
| **Analytics** | ![Analytics](slides/screenshots/05-analytics.png) |
| **Calendar** | ![Calendar](slides/screenshots/06-calendar.png) |
| **Settings** | ![Settings](slides/screenshots/07-settings.png) |
| **Profile** | ![Profile](slides/screenshots/08-profile.png) |

> Presentation slides available at `slides/presentation.md` (Marp format)

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
- 📤 **Upload bills** — JPEG, PNG, WebP images (10MB max), background uploads continue when navigating away
- 👁️ **OCR** — Extracts text from Myanmar (Burmese) and English bills, offline via Tesseract.js
- 🤖 **AI classification** — Auto-detects category (Electricity, Water, Internet, Phone, Shopping, Other) + currency
- 💱 **Real-time currency** — Auto-detects bill currency (USD, EUR, GBP, JPY, THB, MMK), converts to MMK for storage, displays in user's selected currency with live rates from open.er-api.com
- 🛡️ **Validation** — Rejects unrecognized bills (no amount / unknown title) with descriptive alerts
- ⚡ **Concurrent uploads** — Worker pool handles multiple OCR jobs in parallel
- 📊 **Dashboard** — Overview with total bills, spending, unpaid count, upcoming bills, category breakdown
- 🔍 **Search & filter** — By title, category (7 tabs), and month navigation
- ✏️ **Edit bills** — Update title, amount, category, due date, recurring settings, and replace bill image
- 🗑️ **Delete** — Removes bill from MongoDB and Cloudinary (with confirmation)
- 📅 **Month navigation** — Browse bills month-by-month with prev/next arrows and dropdown
- 🌙 **Dark mode** — Light / Dark / System theme (applies instantly, saved to backend)
- 📱 **Responsive** — Mobile-first with sidebar navigation

### Spending Analytics
- 📊 **Category pie chart** — Donut chart showing spending breakdown by category (Recharts)
- 📈 **Monthly trend chart** — Bar chart showing spending over time
- 💰 **Budget alerts** — Monthly limit + per-category limits with danger (over) and warning (80%+) alerts on dashboard
- 📋 **Period filters** — Week / Month / Quarter / Year with trend comparison and dynamic insights

### Calendar
- 📅 **Interactive calendar** — Bills shown as chips on due dates
- 📋 **Day details** — Click any day to see bills and toggle payment
- 📊 **Month stats** — Total amount, paid/unpaid/overdue counts
- ⏰ **Upcoming bills** — Next 30 days sidebar

### Profile & Settings
- 👤 **Profile** — Display name, avatar upload (Cloudinary), account stats (total bills, paid, spent)
- 🔑 **Change password** — With validation (8 chars + 1 number)
- 💱 **Currency selector** — Choose from 6 currencies (MMK, USD, EUR, GBP, JPY, THB)
- 🎨 **Theme** — Light / Dark / System (applies instantly)
- 💰 **Budget alerts** — Toggle on/off, monthly limit, per-category limits
- 📄 **CSV export** — Download all bills as spreadsheet

### Background Uploads
- ⚡ **Fire-and-forget** — Uploads continue when navigating away from upload page
- 📊 **Progress indicator** — Floating bottom-right shows active uploads with dismiss buttons
- 🔔 **Toast notifications** — Success/error alerts on completion
- 📁 **Multi-file** — Upload multiple bills in parallel

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
| **Charts** | Recharts (pie + bar charts) |
| **Scheduling** | node-cron (recurring bills) |
| **Logging** | Pino (structured JSON in production) |
| **Security** | Helmet, express-rate-limit, cookie-parser |
| **Icons** | Lucide React |
| **Currency** | open.er-api.com (live rates, no API key needed) |

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

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users/me` | Full profile + settings |
| `PATCH` | `/api/v1/users/profile` | Update display name |
| `PATCH` | `/api/v1/users/avatar` | Upload avatar image |
| `DELETE` | `/api/v1/users/avatar` | Remove avatar |
| `PATCH` | `/api/v1/users/password` | Change password |
| `PATCH` | `/api/v1/users/settings` | Currency, theme, budget alerts |
| `GET` | `/api/v1/users/stats` | Account statistics (bills, paid, spent) |
| `GET` | `/api/v1/users/rates` | Live exchange rates |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/v1/upload` | Upload image to Cloudinary only (auth required) |

> **Note:** Legacy `/api/auth`, `/api/bills`, `/api/upload`, `/api/users` routes also work for backward compatibility.

## Myanmar Bills Support

| Category | Examples |
|----------|---------|
| ⚡ Electricity | YESB, MESC, Yangon Electricity (လျှပ်စစ်မီတာခ) |
| 💧 Water | YCDC, City Development (ရေခွန်) |
| 🌐 Internet | MPT Fiber, Ooredoo, MyTel |
| 📱 Phone | Telenor, Ooredoo, MPT top-up |
| 🛒 Shopping | CityMart, Junction, Myanmar Plaza |
| 📌 Other | Medical, transport, etc. |

## Currency Conversion

All bills are stored in **MMK (Myanmar Kyat)** as the base currency.

### Pipeline
1. OCR extracts text → amount (e.g., `$145.67`)
2. Cohere AI detects currency from bill text (symbols, company names, language)
3. Backend converts to MMK using live rates (`1 USD ≈ 2,103 MMK`)
4. Stored in MongoDB with `amount` (MMK), `originalCurrency`, `originalAmount`
5. Frontend converts MMK to user's selected currency for display

### Supported Currencies
| Currency | Code | Symbol | Example Rate |
|----------|------|--------|-------------|
| Myanmar Kyat | MMK | K | 1 K = 1 MMK |
| US Dollar | USD | $ | 1 $ ≈ 2,103 MMK |
| Euro | EUR | € | 1 € ≈ 2,402 MMK |
| British Pound | GBP | £ | 1 £ ≈ 2,820 MMK |
| Japanese Yen | JPY | ¥ | 1 ¥ ≈ 13 MMK |
| Thai Baht | THB | ฿ | 1 ฿ ≈ 63 MMK |

### Rate Source
Live rates from [open.er-api.com](https://open.er-api.com) (free, no API key required). Rates are cached for 1 hour. Falls back to hardcoded rates if the API is unavailable.

## Project Structure

```
pyat-paing/
├── client/                          # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx                  # Routes, theme, lazy loading, upload indicator
│   │   ├── types.ts                 # Shared TypeScript interfaces
│   │   ├── hooks/
│   │   │   ├── useCurrency.ts       # Live currency conversion hook
│   │   │   └── useTheme.ts          # Global theme store (localStorage + backend)
│   │   ├── utils/
│   │   │   ├── currency.ts          # Currency formatting & conversion
│   │   │   └── nav.ts               # Navigation config
│   │   ├── components/
│   │   │   ├── AuthContext.tsx       # JWT auth, apiFetch
│   │   │   ├── AuthPage.tsx         # Login/register
│   │   │   ├── UploadContext.tsx     # Background upload state + events
│   │   │   ├── Sidebar.tsx          # Navigation + profile + avatar
│   │   │   ├── Toast.tsx            # Toast notifications
│   │   │   └── ErrorBoundary.tsx    # React error boundary
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx        # Sidebar + outlet
│   │   └── pages/
│   │       ├── DashboardPage.tsx     # Overview + metrics + budget alerts
│   │       ├── BillsPage.tsx         # Bill list + month navigation + edit
│   │       ├── UploadPage.tsx        # Drag & drop + recent uploads
│   │       ├── AnalyticsPage.tsx     # Charts + insights + period filters
│   │       ├── CalendarPage.tsx      # Interactive calendar + day details
│   │       ├── SettingsPage.tsx      # Currency, theme, budget, export
│   │       └── ProfilePage.tsx       # Avatar, name, password, stats
│   └── vite.config.ts               # Vite config + /api proxy + code splitting
├── server/                          # Express + Mongoose + Cloudinary + Tesseract + Cohere
│   ├── src/
│   │   ├── app.js                   # Express app with middleware + routes
│   │   ├── server.js                # Bootstrap: env → MongoDB → Express + shutdown
│   │   ├── models/
│   │   │   ├── Bill.js              # Bill schema (currency, amount, recurring, payment)
│   │   │   └── User.js              # User schema (profile, settings, budget alerts)
│   │   ├── controllers/
│   │   │   ├── billController.js    # CRUD + pipeline + currency conversion
│   │   │   ├── authController.js    # Register / login / logout / change-password
│   │   │   └── userController.js    # Profile / settings / avatar / rates
│   │   ├── routes/
│   │   │   ├── billRoutes.js        # /api/v1/bills (rate limited)
│   │   │   ├── authRoutes.js        # /api/v1/auth (rate limited)
│   │   │   ├── userRoutes.js        # /api/v1/users (auth required)
│   │   │   └── upload.js            # /api/v1/upload (Cloudinary only)
│   │   ├── middleware/
│   │   │   ├── upload.js            # Multer memoryStorage config
│   │   │   └── auth.js              # JWT verification (cookie + header)
│   │   └── utils/
│   │       ├── cloudinaryStorage.js # upload/delete with retry
│   │       ├── ocrService.js        # Tesseract.js scheduler pool (eng+mya)
│   │       ├── cohereService.js     # AI classification + currency detection
│   │       ├── currencyConversion.js # Live rates + MMK conversion
│   │       ├── recurringService.js  # Daily cron for recurring bills
│   │       └── logger.js            # Pino structured logger
│   └── .env.example                 # Environment variables template
├── slides/
│   ├── presentation.md              # Marp presentation slides
│   └── screenshots/                 # Playwright screenshots
├── CLAUDE.md                        # AI assistant instructions
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
