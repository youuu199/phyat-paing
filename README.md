# 🧾 Smart Bill Organizer (phyat-paing)

A MERN web app that lets you upload images of utility bills and receipts — it extracts the data automatically using OCR and AI, then displays everything on a filterable dashboard.

## 🚀 Live Demo

- **Frontend:** https://phyat-paing.vercel.app/
- **Backend API:** https://bill-organizer-api.onrender.com/

## 📸 Screenshots

### Register
![Register](docs/images/register.png)
New users create an account here by providing a username, email, and password. On submit, the backend hashes the password with bcryptjs and stores the user in MongoDB. Already have an account? Click the "Sign in" link at the bottom to switch to the login page.

### Login
![Auth](docs/images/auth.png)
Returning users sign in with their email and password. The backend verifies credentials and returns a JWT token, which the frontend stores and attaches to all subsequent API requests via the `Authorization: Bearer <token>` header. All bills are automatically scoped to the authenticated user.

### Dashboard
![Dashboard](docs/images/dashboard.png)
The main dashboard shows all your uploaded bills in a responsive card grid. Each card displays the bill's **title**, **amount**, **category** (color-coded: Electricity, Water, Internet, Phone, Shopping, Other), and a **thumbnail** of the original image. Filter bills by tapping a category tab at the top or by selecting a month/year from the left sidebar. Click the trash icon on any card to delete it (removes from both MongoDB and Cloudinary).

## How It Works

```
📸 Upload bill image
  → ☁️ Cloudinary (image storage)
  → 👁️ Tesseract.js OCR (Myanmar + English text extraction, offline)
  → 🤖 Cohere Command A (structured JSON classification)
  → 🗄️ MongoDB (bill storage, Atlas or in-memory fallback)
  → 📊 React Dashboard (filter, sort, delete)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Backend** | Node.js + Express |
| **Database** | MongoDB Atlas + Mongoose (with mongodb-memory-server fallback) |
| **Image Storage** | Cloudinary |
| **OCR** | Tesseract.js (offline, no API keys needed) |
| **AI Classification** | Cohere Command A |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **File Upload** | Multer (memory storage) |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas cluster (or local MongoDB, or auto-fallback to in-memory)
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
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT token |
| `GET` | `/api/auth/me` | Get current user info |
| `POST` | `/api/bills` | Upload bill image → full pipeline (Cloudinary → OCR → AI → MongoDB) |
| `GET` | `/api/bills` | List bills (`?category=`, `?year=`, `?month=`) |
| `GET` | `/api/bills/months` | Available year-month periods with bill counts |
| `GET` | `/api/bills/stats` | Spending summary grouped by category |
| `DELETE` | `/api/bills/:id` | Delete a bill (removes from MongoDB and Cloudinary) |
| `POST` | `/api/upload` | Upload image to Cloudinary only |

## Project Structure

```
phyat-paing/
├── client/                          # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx                  # App shell
│   │   ├── components/
│   │   │   ├── AuthPage.tsx         # Login/register page
│   │   │   ├── AuthContext.tsx      # JWT token management + apiFetch
│   │   │   ├── BillUploader.tsx     # File input + upload button
│   │   │   ├── BillDashboard.tsx    # Main dashboard with state management
│   │   │   ├── BillCard.tsx         # Individual bill card
│   │   │   ├── CategoryTabs.tsx     # 7 category filter tabs
│   │   │   ├── Sidebar.tsx          # Month/year date filter sidebar
│   │   │   └── Toast.tsx            # Toast notification component
│   │   ├── App.css                  # All component styles
│   │   └── index.css                # CSS variables + global reset
│   └── vite.config.ts               # Vite config + /api proxy
├── server/                          # Express + Mongoose + Cloudinary + Tesseract + Cohere
│   ├── src/
│   │   ├── app.js                   # Express app with middleware + routes
│   │   ├── server.js                # Bootstrap: env → MongoDB → Cloudinary → listen
│   │   ├── models/
│   │   │   ├── Bill.js              # Mongoose bill schema
│   │   │   └── User.js              # Mongoose user schema
│   │   ├── controllers/
│   │   │   ├── billController.js    # CRUD + full upload pipeline
│   │   │   └── authController.js    # Register / login / me
│   │   ├── routes/
│   │   │   ├── billRoutes.js        # /api/bills routes
│   │   │   ├── authRoutes.js        # /api/auth routes
│   │   │   └── upload.js            # /api/upload routes
│   │   ├── middleware/
│   │   │   ├── upload.js            # Multer memoryStorage config
│   │   │   └── auth.js              # JWT verification middleware
│   │   ├── config/db.js             # MongoDB connection (Atlas + in-memory fallback)
│   │   └── utils/
│   │       ├── cloudinaryStorage.js # uploadToCloudinary / deleteFromCloudinary
│   │       ├── ocrService.js        # Tesseract.js scheduler pool (eng+mya)
│   │       └── cohereService.js     # Cohere structured JSON extraction
│   └── .env.example                 # Environment variables template
├── CLAUDE.md                        # AI assistant instructions + allowed APIs
├── .mcp.json.example                # MCP server configuration template
└── .gitignore
```

## Features

- 🔐 **User auth** — Register / login with JWT, per-user bill isolation
- 📤 **Upload bills** — JPEG, PNG, WebP, GIF, BMP, TIFF images
- 👁️ **OCR** — Extracts text from Myanmar (Burmese) and English bills, offline via Tesseract.js
- 🤖 **AI classification** — Auto-detects category (Electricity, Water, Internet, Phone, Shopping, Other)
- 🛡️ **Validation** — Rejects unrecognized bills (no amount / unknown title) with descriptive alerts
- ⚡ **Concurrent uploads** — Worker pool handles multiple OCR jobs in parallel
- 📊 **Dashboard** — Responsive grid of bill cards with thumbnails
- 🔍 **Filtering** — By category (7 tabs) and by month/year (right sidebar)
- 🗑️ **Delete** — Removes bill from MongoDB and Cloudinary
- 🌙 **Dark mode** — Auto-detected from system preference
- 📱 **Responsive** — Works on desktop and mobile

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
