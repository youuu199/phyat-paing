# Render Deployment Blueprint

## Overview

Deploy the Smart Bill Organizer backend to Render while keeping the frontend on Vercel. The backend will be a web service running Express, and the frontend will proxy API requests to the backend via Vercel rewrites.

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  phyat-paing-gktvzhj8d-...vercel.app│
│  Vite React-TS                      │
└──────────────┬──────────────────────┘
               │ /api requests
               ▼
┌─────────────────────────────────────┐
│  Backend (Render)                   │
│  phyat-paing.onrender.com           │
│  Express + Tesseract + Cohere       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  bill-organizer cluster             │
└─────────────────────────────────────┘
```

## Components

### Backend (Render Web Service)

- **Runtime**: Node.js
- **Plan**: Free tier
- **Root directory**: `server/`
- **Build command**: `npm install && node --input-type=module -e "import('tesseract.js').then(m => m.createWorker('eng+mya'))"`
  - Pre-downloads Tesseract.js language data during build for faster cold starts
  - Uses ESM syntax since project has `"type": "module"`
- **Start command**: `node src/server.js`

#### Environment Variables

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Enables production CORS config |
| `MONGODB_URI` | User provides | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | User provides | Cloudinary credentials |
| `CLOUDINARY_API_KEY` | User provides | Cloudinary credentials |
| `CLOUDINARY_API_SECRET` | User provides | Cloudinary credentials |
| `COHERE_API_KEY` | User provides | Cohere AI API key |
| `JWT_SECRET` | Auto-generated | Render generates random 256-bit secret |
| `FRONTEND_URL` | `https://phyat-paing-gktvzhj8d-vimmms-projects.vercel.app` | CORS origin |

### Frontend (Vercel - Already Deployed)

- **URL**: `https://phyat-paing-gktvzhj8d-vimmms-projects.vercel.app`
- **Proxy**: Vercel rewrites `/api/*` to Render backend
- **vercel.json**: Already configured correctly

## CORS Configuration

Backend (`server/src/app.js:10-16`) already handles CORS:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
```

In production, `FRONTEND_URL` env var controls allowed origin.

## Tesseract.js Optimization

Language data (`eng+mya`) is pre-downloaded during build:

```bash
node --input-type=module -e "import('tesseract.js').then(m => m.createWorker('eng+mya'))"
```

This prevents slow cold starts on Render's free tier. Uses ESM syntax since the project has `"type": "module"`.

## No Code Changes Required

The existing codebase is already configured for this deployment:

1. **CORS**: Uses `FRONTEND_URL` env var for production
2. **API URLs**: Frontend uses relative paths (`/api/*`) which Vercel proxies
3. **vercel.json**: Already has rewrites pointing to Render backend

## Deployment Steps

1. Update `render.yaml` with correct values
2. Deploy to Render via Blueprint (sync from repo)
3. Set environment variables in Render dashboard
4. Update `vercel.json` if backend URL changes
5. Test API endpoints via health check

## Success Criteria

- Backend health check returns 200: `GET /api/health`
- Frontend can register and login via proxy
- Bill upload pipeline works end-to-end
- CORS allows requests from Vercel frontend

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Cold start delays (30-60s) | Pre-download Tesseract data at build time |
| Free tier sleep after 15min idle | Consider upgrading to paid tier if needed |
| Environment variables not set | Use Render dashboard to configure all env vars |

## Questions Answered

1. **Deployment architecture**: Separate services (frontend on Vercel, backend on Render)
2. **MongoDB**: Already have Atlas set up
3. **API keys**: Cloudinary and Cohere ready, JWT_SECRET auto-generated
4. **Domain**: Free .onrender.com domain
5. **Approach**: Static site + web service (separate deployments)
