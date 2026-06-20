# Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the Smart Bill Organizer MERN application to production using Vercel (frontend), Render (backend), and MongoDB Atlas (database) with automated CI/CD via GitHub Actions.

**Architecture:** Monorepo split-deployment strategy where client/ deploys to Vercel's global CDN and server/ deploys to Render's Node.js environment. GitHub Actions triggers both deployments on push to main branch.

**Tech Stack:** Vercel, Render, MongoDB Atlas, GitHub Actions, Vite, Express, Node.js

## Global Constraints

- Frontend must build successfully with `npm run build` in client/ directory
- Backend must start with `node src/server.js` in server/ directory
- All secrets stored in GitHub Secrets, Vercel Environment Variables, or Render Environment Variables
- Never commit .env files, API keys, or service account keys to git
- Use `127.0.0.1` instead of `localhost` for MongoDB connections (avoids IPv6 issues)
- CORS must be configured to allow requests from Vercel domain only

---

## File Structure

```
pyat-paing/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions workflow
├── client/
│   ├── vercel.json                 # Vercel configuration
│   └── vite.config.ts              # Update for production API URL
├── server/
│   ├── render.yaml                 # Render configuration
│   └── src/
│       └── app.js                  # Update CORS for production
├── .gitignore                      # Update to exclude sensitive files
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-06-20-deployment-design.md
        └── plans/
            └── 2026-06-20-deployment-implementation.md
```

---

## Task 1: Security Cleanup

**Files:**
- Modify: `.gitignore`
- Delete: `server/vision-key.json`

**Interfaces:**
- Produces: Clean repository without sensitive files

- [ ] **Step 1: Check if vision-key.json is tracked by git**

Run: `cd /home/vim/videcode/pyat-paing && git ls-files server/vision-key.json`

Expected: If output shows the file, it's tracked and needs to be removed. If empty, it's already ignored.

- [ ] **Step 2: Remove vision-key.json from git tracking (if tracked)**

Run: `cd /home/vim/videcode/pyat-paing && git rm --cached server/vision-key.json`

Expected: File removed from git tracking but still exists on disk.

- [ ] **Step 3: Update .gitignore to exclude sensitive files**

Add to `.gitignore`:
```
# Environment variables
.env
.env.local
.env.*.local

# Service account keys
*-service-account.json
vision-key.json
*-key.json

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 4: Commit security cleanup**

Run: `cd /home/vim/videcode/pyat-paing && git add .gitignore && git commit -m "security: remove sensitive files from tracking and update .gitignore"`

---

## Task 2: Update Server for Production

**Files:**
- Modify: `server/src/app.js`
- Create: `server/render.yaml`

**Interfaces:**
- Consumes: Existing Express app configuration
- Produces: Production-ready server with CORS configured for Vercel domain

- [ ] **Step 1: Read current server/src/app.js**

Run: `cat /home/vim/videcode/pyat-paing/server/src/app.js`

Expected: See current CORS and middleware configuration.

- [ ] **Step 2: Update CORS configuration in server/src/app.js**

Find the CORS configuration and update it:

```javascript
import cors from 'cors';

// Update CORS to allow requests from Vercel domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

- [ ] **Step 3: Create render.yaml configuration**

Create `server/render.yaml`:
```yaml
services:
  - type: web
    name: bill-organizer-api
    runtime: node
    buildCommand: npm install
    startCommand: node src/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: FRONTEND_URL
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: COHERE_API_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
```

- [ ] **Step 4: Commit server updates**

Run: `cd /home/vim/videcode/pyat-paing && git add server/src/app.js server/render.yaml && git commit -m "feat: configure server for production deployment (CORS, render.yaml)"`

---

## Task 3: Update Client for Production

**Files:**
- Modify: `client/vite.config.ts`
- Create: `client/vercel.json`

**Interfaces:**
- Consumes: Existing Vite configuration
- Produces: Production-ready client with API URL configuration

- [ ] **Step 1: Read current client/vite.config.ts**

Run: `cat /home/vim/videcode/pyat-paing/client/vite.config.ts`

Expected: See current Vite configuration.

- [ ] **Step 2: Update vite.config.ts for production API URL**

Update `client/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'  // Only for local development
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:5000'
    )
  }
})
```

- [ ] **Step 3: Create vercel.json configuration**

Create `client/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://bill-organizer-api.onrender.com/api/$1"
    }
  ]
}
```

- [ ] **Step 4: Commit client updates**

Run: `cd /home/vim/videcode/pyat-paing && git add client/vite.config.ts client/vercel.json && git commit -m "feat: configure client for production deployment (Vite, vercel.json)"`

---

## Task 4: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, RENDER_API_KEY, RENDER_SERVICE_ID)
- Produces: Automated deployment on push to main

- [ ] **Step 1: Create .github/workflows directory**

Run: `mkdir -p /home/vim/videcode/pyat-paing/.github/workflows`

- [ ] **Step 2: Create deploy.yml workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel + Render

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: ./client

      - name: Build frontend
        run: npm run build
        working-directory: ./client

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    needs: deploy-frontend
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

- [ ] **Step 3: Commit GitHub Actions workflow**

Run: `cd /home/vim/videcode/pyat-paing && git add .github/workflows/deploy.yml && git commit -m "ci: add GitHub Actions workflow for Vercel + Render deployment"`

---

## Task 5: Update MongoDB Connection for Production

**Files:**
- Modify: `server/src/config/db.js`

**Interfaces:**
- Consumes: MONGODB_URI environment variable
- Produces: Production-ready MongoDB connection with proper error handling

- [ ] **Step 1: Read current server/src/config/db.js**

Run: `cat /home/vim/videcode/pyat-paing/server/src/config/db.js`

Expected: See current MongoDB connection configuration.

- [ ] **Step 2: Update MongoDB connection for production**

Update `server/src/config/db.js`:
```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bill-organizer');
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

- [ ] **Step 3: Commit MongoDB connection update**

Run: `cd /home/vim/videcode/pyat-paing && git add server/src/config/db.js && git commit -m "feat: update MongoDB connection for production with proper error handling"`

---

## Task 6: Create Health Check Endpoint

**Files:**
- Modify: `server/src/app.js`

**Interfaces:**
- Produces: GET /api/health endpoint for monitoring

- [ ] **Step 1: Add health check endpoint to server/src/app.js**

Add before the error handler:
```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
```

- [ ] **Step 2: Commit health check endpoint**

Run: `cd /home/vim/videcode/pyat-paing && git add server/src/app.js && git commit -m "feat: add health check endpoint for monitoring"`

---

## Task 7: Setup Documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces: Updated README with deployment instructions

- [ ] **Step 1: Add deployment section to README.md**

Add after the "Getting Started" section:
```markdown
## Deployment

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
   - Add your IP to the whitelist (or use 0.0.0.0/0 for all IPs)

3. **Set up Vercel:**
   - Connect your GitHub repo to [Vercel](https://vercel.com)
   - Set root directory to `client/`
   - Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

4. **Set up Render:**
   - Create a new Web Service at [Render](https://render.com)
   - Connect your GitHub repo
   - Set root directory to `server/`
   - Add all environment variables from `server/.env.example`

5. **Configure GitHub Secrets:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_API_KEY`, `RENDER_SERVICE_ID`

6. **Push to main:**
   - GitHub Actions will automatically deploy to both platforms
   - Check the Actions tab for deployment status

### Environment Variables

See `server/.env.example` for all required environment variables.

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

### Monitoring

- **Health Check:** `GET https://your-backend.onrender.com/api/health`
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
```

- [ ] **Step 2: Commit README update**

Run: `cd /home/vim/videcode/pyat-paing && git add README.md && git commit -m "docs: add deployment instructions to README"`

---

## Task 8: Verify Local Build

**Files:**
- None (verification only)

**Interfaces:**
- Produces: Verified builds for both client and server

- [ ] **Step 1: Install client dependencies**

Run: `cd /home/vim/videcode/pyat-paing/client && npm install`

Expected: All dependencies installed successfully.

- [ ] **Step 2: Build client**

Run: `cd /home/vim/videcode/pyat-paing/client && npm run build`

Expected: Build completes successfully, `dist/` directory created.

- [ ] **Step 3: Install server dependencies**

Run: `cd /home/vim/videcode/pyat-paing/server && npm install`

Expected: All dependencies installed successfully.

- [ ] **Step 4: Test server starts (without connecting to external services)**

Run: `cd /home/vim/videcode/pyat-paing/server && timeout 5 node src/server.js || true`

Expected: Server starts without immediate errors (may fail to connect to MongoDB/Cloudinary, which is expected).

- [ ] **Step 5: Commit any fixes if needed**

If any issues were found and fixed:
Run: `cd /home/vim/videcode/pyat-paing && git add -A && git commit -m "fix: resolve build issues for deployment"`

---

## Task 9: Final Verification Checklist

**Files:**
- None (verification only)

**Interfaces:**
- Produces: Verified repository ready for deployment

- [ ] **Step 1: Check no sensitive files are tracked**

Run: `cd /home/vim/videcode/pyat-paing && git ls-files | grep -E '\.(env|key\.json|service-account)'`

Expected: No output (no sensitive files tracked).

- [ ] **Step 2: Verify .gitignore is comprehensive**

Run: `cat /home/vim/videcode/pyat-paing/.gitignore | grep -E '(node_modules|\.env|dist|\.key\.json)'`

Expected: Shows entries for node_modules, .env, dist, and key files.

- [ ] **Step 3: Check GitHub Actions workflow syntax**

Run: `cat /home/vim/videcode/pyat-paing/.github/workflows/deploy.yml | head -20`

Expected: Valid YAML with correct structure.

- [ ] **Step 4: Verify all configuration files exist**

Run: `ls -la /home/vim/videcode/pyat-paing/client/vercel.json /home/vim/videcode/pyat-paing/server/render.yaml /home/vim/videcode/pyat-paing/.github/workflows/deploy.yml`

Expected: All three files exist.

- [ ] **Step 5: Create deployment summary**

Create a summary of what was done:
```bash
echo "=== Deployment Setup Complete ==="
echo ""
echo "Files created/modified:"
echo "- .github/workflows/deploy.yml (GitHub Actions)"
echo "- client/vercel.json (Vercel config)"
echo "- client/vite.config.ts (updated for production)"
echo "- server/render.yaml (Render config)"
echo "- server/src/app.js (CORS + health check)"
echo "- server/src/config/db.js (MongoDB connection)"
echo "- .gitignore (security updates)"
echo "- README.md (deployment docs)"
echo ""
echo "Next steps:"
echo "1. Push to GitHub"
echo "2. Set up Vercel account and connect repo"
echo "3. Set up Render account and connect repo"
echo "4. Create MongoDB Atlas cluster"
echo "5. Configure GitHub Secrets"
echo "6. Push to main to trigger deployment"
```

---

## Self-Review

After writing the complete plan, I've checked:

**1. Spec coverage:** ✅ All requirements from the deployment design spec are covered:
- Vercel frontend deployment (Task 3)
- Render backend deployment (Task 2)
- MongoDB Atlas connection (Task 5)
- GitHub Actions CI/CD (Task 4)
- Security cleanup (Task 1)
- Health check endpoint (Task 6)
- Documentation (Task 7)
- Verification (Tasks 8-9)

**2. Placeholder scan:** ✅ No "TBD", "TODO", or incomplete sections found. All code blocks are complete.

**3. Type consistency:** ✅ Function names and configurations are consistent across tasks.

**4. Scope check:** ✅ Plan is focused on deployment only, no feature creep.

**5. Ambiguity check:** ✅ All steps are clear with exact commands and expected outputs.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-20-deployment-implementation.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
