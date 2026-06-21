# 🧾 Smart Bill Organizer (phyat-paing)

A MERN web app that lets you upload images of utility bills and receipts — it extracts the data automatically using OCR and AI, then displays everything on a filterable dashboard.

## 🚀 Live Demo

- **Frontend:** https://phyat-paing.vercel.app/
- **Backend API:** https://bill-organizer-api.onrender.com/

## 📸 Screenshots

### Register
![Register](docs/images/register.png)
New users create an account here by providing an email and password. Passwords require at least 8 characters with one number. On submit, the backend hashes the password with bcryptjs and stores the user in MongoDB. Already have an account? Click the "Sign in" link at the bottom to switch to the login page.

### Login
![Auth](docs/images/auth.png)
Returning users sign in with their email and password. The backend verifies credentials and returns a JWT token stored as an httpOnly cookie. All bills are automatically scoped to the authenticated user. Accounts lock for 15 minutes after 5 failed login attempts.

### Dashboard
![Dashboard](docs/images/dashboard.png)
The main dashboard shows all your uploaded bills in a responsive card grid. Each card displays the bill's **title**, **amount**, **category** (color-coded: Electricity, Water, Internet, Phone, Shopping, Other), and a **thumbnail** of the original image. Filter bills by tapping a category tab at the top, by selecting a month/year from the left sidebar, or by using the search bar. Click the edit button to correct AI-extracted data, or the delete button (with confirmation) to remove a bill.

## How It Works

```
📸 Upload bill image
  → ☁️ Cloudinary (image storage)
  → 👁️ Tesseract.js OCR (Myanmar + English text extraction, offline)
  → 🤖 Cohere Command A (structured JSON classification)
  → 🗄️ MongoDB (bill storage, Atlas or in-memory fallback)
  → 📊 React Dashboard (filter, search, edit, delete)
```

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
| **Logging** | Pino (structured JSON in production) |
| **Security** | Helmet, express-rate-limit, cookie-parser |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login, returns JWT token (also sets httpOnly cookie) |
| `POST` | `/api/v1/auth/logout` | Logout, clears auth cookie |
| `GET` | `/api/v1/auth/me` | Get current user info |
| `POST` | `/api/v1/bills` | Upload bill image → full pipeline (Cloudinary → OCR → AI → MongoDB) |
| `GET` | `/api/v1/bills` | List bills (`?category=`, `?year=`, `?month=`, `?limit=`, `?skip=`) |
| `GET` | `/api/v1/bills/months` | Available year-month periods with bill counts |
| `GET` | `/api/v1/bills/stats` | Spending summary grouped by category |
| `PATCH` | `/api/v1/bills/:id` | Update bill title, amount, and/or category |
| `DELETE` | `/api/v1/bills/:id` | Delete a bill (removes from MongoDB and Cloudinary) |
| `POST` | `/api/v1/upload` | Upload image to Cloudinary only (auth required) |

> **Note:** Legacy `/api/auth`, `/api/bills`, `/api/upload` routes still work for backward compatibility.

## Project Structure

```
phyat-paing/
├── client/                          # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx                  # App shell with ErrorBoundary
│   │   ├── types.ts                 # Shared TypeScript interfaces
│   │   ├── components/
│   │   │   ├── AuthPage.tsx         # Login/register page
│   │   │   ├── AuthContext.tsx      # JWT token management + apiFetch
│   │   │   ├── BillUploader.tsx     # File input + upload with progress stages
│   │   │   ├── BillDashboard.tsx    # Main dashboard with state, search, filters
│   │   │   ├── BillCard.tsx         # Individual bill card (view, edit, delete)
│   │   │   ├── BillEditModal.tsx    # Modal for editing bill details
│   │   │   ├── CategoryTabs.tsx     # 7 category filter tabs
│   │   │   ├── Sidebar.tsx          # Month/year date filter sidebar
│   │   │   ├── Toast.tsx            # Toast notification component
│   │   │   └── ErrorBoundary.tsx    # React error boundary
│   │   ├── App.css                  # All component styles
│   │   └── index.css                # CSS variables + global reset
│   └── vite.config.ts               # Vite config + /api proxy
├── server/                          # Express + Mongoose + Cloudinary + Tesseract + Cohere
│   ├── src/
│   │   ├── app.js                   # Express app with middleware + routes
│   │   ├── server.js                # Bootstrap: env → MongoDB → Express + graceful shutdown
│   │   ├── models/
│   │   │   ├── Bill.js              # Mongoose bill schema
│   │   │   └── User.js              # Mongoose user schema (with account lockout)
│   │   ├── controllers/
│   │   │   ├── billController.js    # CRUD + full upload pipeline + pagination
│   │   │   └── authController.js    # Register / login / logout / me
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
│   │       └── logger.js            # Pino structured logger
│   └── .env.example                 # Environment variables template
├── docs/
│   ├── images/                      # Screenshots
│   └── superpowers/specs/           # Design docs + audit reports
├── CLAUDE.md                        # AI assistant instructions + allowed APIs
├── .mcp.json.example                # MCP server configuration template
└── .gitignore
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
- 🔍 **Search** — Filter bills by title
- 🔍 **Filtering** — By category (7 tabs) and by month/year (sidebar)
- ✏️ **Edit bills** — Correct AI-extracted title, amount, and category
- 🗑️ **Delete** — Removes bill from MongoDB and Cloudinary (with confirmation)
- 📄 **Pagination** — Server-side pagination for large datasets
- 🌙 **Dark mode** — Auto-detected from system preference
- 📱 **Responsive** — Works on desktop and mobile

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

### Developer Experience
- 📝 **Structured logging** — Pino JSON logs in production, pretty-printed in dev
- 💥 **Error boundary** — React error boundary catches rendering crashes
- 🤖 **Configurable AI model** — `COHERE_MODEL` env var
- 🔌 **API versioning** — `/api/v1/` prefix with backward compatibility
- 📡 **Backend-down detection** — Helpful messages for Render cold starts

## Bills Support

| Category | Myanmar Examples |
|----------|-----------------|
| ⚡ Electricity | YESB, MESC, Yangon Electricity (လျှပ်စစ်မီတာခ) |
| 💧 Water | YCDC, City Development (ရေခွန်) |
| 🌐 Internet | MPT Fiber, Ooredoo, MyTel |
| 📱 Phone | Telenor, Ooredoo, MPT top-up |
| 🛒 Shopping | CityMart, Junction, Myanmar Plaza |
| 📌 Other | Medical, transport, etc. |

## Deployment

### Live Environment

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://phyat-paing.vercel.app/ | ✅ Live |
| **Backend** | https://bill-organizer-api.onrender.com/ | ✅ Live |
| **Database** | MongoDB Atlas | ✅ Connected |

### Health Check

```bash
curl https://bill-organizer-api.onrender.com/api/health
```

Expected response:
```json
{"status":"healthy","timestamp":"...","uptime":...,"environment":"production"}
```

### Architecture

```
Frontend (Vercel) → Backend (Render) → MongoDB Atlas
     ↓                    ↓
  Static site        Express API
  /api/* proxy       Tesseract OCR
                     Cohere AI
                     Cloudinary
```

### Prerequisites

- GitHub account
- Vercel account (free tier)
- Render account (free tier)
- MongoDB Atlas account (free tier)

### Quick Deploy

1. **Fork/clone this repository**

2. **Set up MongoDB Atlas:**
   - Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
   - Get your connection string
   - Add Render IPs to the whitelist:
     - `0.0.0.0/0` (allows all IPs)
     - Or specific Render IPs: `34.64.0.0/10`, `35.192.0.0/12`, `34.66.0.0/16`

3. **Set up Vercel:**
   - Connect your GitHub repo to [Vercel](https://vercel.com)
   - Set root directory to `client/`
   - The `vercel.json` will auto-configure `/api/*` rewrites to the backend

4. **Set up Render:**
   - Create a new Web Service at [Render](https://render.com)
   - Connect your GitHub repo
   - Set root directory to `server/`
   - Add environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://...
     CLOUDINARY_CLOUD_NAME=...
     CLOUDINARY_API_KEY=...
     CLOUDINARY_API_SECRET=...
     COHERE_API_KEY=...
     JWT_SECRET=(auto-generate)
     FRONTEND_URL=https://phyat-paing.vercel.app
     ```

5. **Push to main:**
   - Render auto-deploys on push
   - Vercel auto-deploys on push

### Environment Variables

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

### Manual Deployment

#### Frontend (Vercel)
```bash
cd client
npm run build
vercel --prod
```

#### Backend (Render)
- Push to main branch
- Render auto-deploys on push

### Dashboards

- **Vercel:** https://vercel.com/dashboard
- **Render:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com

## Audit Report

A comprehensive weakness audit was conducted on 2026-06-21. See `docs/superpowers/specs/2026-06-21-weakness-audit.md` for the full report.

**Summary:**
- 🔴 Critical: 4/4 fixed
- 🟡 Medium: 6/6 fixed
- 🟢 Low: 9/12 fixed
- 🔵 Backlog: 8/11 fixed

**Total: 27 issues fixed across security, performance, code quality, UX, and architecture.**

## License

MIT
