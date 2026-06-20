# Deployment Design: Smart Bill Organizer

**Date:** 2026-06-20  
**Status:** Draft  
**Approach:** PaaS (Vercel + Render + MongoDB Atlas)

---

## Overview

Deploy the Smart Bill Organizer MERN application using a monorepo split-deployment strategy with Vercel for the frontend, Render for the backend, and MongoDB Atlas for the database. GitHub Actions handles CI/CD for both platforms.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│  (pyat-paing - Monorepo)                                    │
│  ├── client/          # Vite React-TS                       │
│  └── server/          # Express backend                     │
└─────────────────────────────────────────────────────────────┘
                              │
                    Push to main branch
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│         Vercel                  │    │         Render                  │
│  (Frontend)                     │    │  (Backend)                      │
│  - Auto-detects Vite            │    │  - Node.js environment          │
│  - Builds client/               │    │  - Runs server/src/server.js    │
│  - Deploys to global CDN        │    │  - Exposes API on port 10000    │
│  - SSL included                 │    │  - SSL included                 │
└─────────────────────────────────┘    └─────────────────────────────────┘
         │                                         │
         ▼                                         ▼
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│  Vercel Environment Variables   │    │  Render Environment Variables   │
│  - VITE_API_URL (backend URL)   │    │  - MONGODB_URI (Atlas)          │
│                                 │    │  - CLOUDINARY_*                 │
│                                 │    │  - COHERE_API_KEY               │
│                                 │    │  - JWT_SECRET                   │
└─────────────────────────────────┘    └─────────────────────────────────┘
                                              │
                                              ▼
                                   ┌─────────────────────────────────┐
                                   │       MongoDB Atlas             │
                                   │  (Database)                     │
                                   │  - Free tier (512MB)            │
                                   │  - Automatic backups            │
                                   │  - Connection string in Render  │
                                   └─────────────────────────────────┘
```

---

## CI/CD Workflow

### GitHub Actions Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel + Render

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd client && npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: johnbeynon/render-deploy-action@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## Environment Variables & Secrets

### GitHub Secrets (for CI/CD)

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RENDER_API_KEY` | Render API key |
| `RENDER_SERVICE_ID` | Render service ID |

### Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

### Render Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PORT` | `10000` (Render default) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `COHERE_API_KEY` | Cohere API key |
| `JWT_SECRET` | Random 256-bit secret |

---

## Platform Configuration

### Vercel (`client/vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend.onrender.com/api/$1" }
  ]
}
```

### Render (`render.yaml`)

```yaml
services:
  - type: web
    name: bill-organizer-api
    runtime: node
    buildCommand: cd server && npm install
    startCommand: cd server && node src/server.js
    envVars:
      - key: NODE_ENV
        value: production
```

### Vite Config (`client/vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'  // Only for local dev
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000')
  }
})
```

---

## Deployment Steps

### 1. Prepare Repository

- Push code to GitHub
- Remove `vision-key.json` from git history (security concern)
- Ensure `.gitignore` includes all sensitive files

### 2. Set Up Vercel

1. Connect GitHub repo to Vercel
2. Configure root directory as `client/`
3. Add `VITE_API_URL` environment variable
4. Note project ID and org ID for GitHub Secrets

### 3. Set Up Render

1. Create new Web Service
2. Connect GitHub repo
3. Set root directory as `server/`
4. Add all environment variables (MongoDB, Cloudinary, Cohere, JWT)
5. Note service ID for GitHub Secrets

### 4. Configure GitHub Secrets

Add all 5 secrets to GitHub repository settings.

### 5. Trigger Deployment

Push to `main` branch to trigger automatic deployment.

---

## Verification Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Render URL (`/api/health` endpoint)
- [ ] File upload works (Cloudinary integration)
- [ ] OCR processes images (Tesseract.js)
- [ ] AI classification works (Cohere)
- [ ] Data persists in MongoDB Atlas
- [ ] Authentication flow works (JWT)
- [ ] Environment variables are correctly set
- [ ] SSL certificates are active
- [ ] CORS is configured for cross-origin requests

---

## Cost Estimate (Free Tiers)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel | Free | Personal projects |
| Render | Free | Cold starts, or $7/month for always-on |
| MongoDB Atlas | Free | 512MB storage |
| Cloudinary | Free | 25GB storage, 25K transformations |
| Cohere | Free | Limited API calls |

**Total estimated cost:** $0-7/month (depending on Render plan)

---

## Security Considerations

1. **Remove `vision-key.json`** from repository and add to `.gitignore`
2. **Rotate all API keys** if they were ever committed to git
3. **Use environment variables** for all secrets (never hardcode)
4. **Enable CORS** only for your Vercel domain in production
5. **Use HTTPS** for all API calls (both platforms provide SSL)

---

## Rollback Strategy

If deployment fails:

1. **Vercel:** Rollback to previous deployment via Vercel dashboard
2. **Render:** Rollback to previous deploy via Render dashboard
3. **Database:** MongoDB Atlas provides automatic backups
4. **Code:** Revert commit and push to trigger new deployment

---

## Next Steps

After design approval:

1. Create implementation plan using `writing-plans` skill
2. Set up platform accounts (Vercel, Render, MongoDB Atlas)
3. Configure environment variables
4. Set up GitHub Actions workflow
5. Test deployment end-to-end
