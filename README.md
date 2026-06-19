# 🧾 Smart Bill Organizer (phyat-paing)

A MERN web app that lets you upload images of utility bills and receipts — it extracts the data automatically using OCR and AI, then displays everything on a filterable dashboard.

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
