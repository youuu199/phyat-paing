# Render Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the Smart Bill Organizer backend to Render while keeping the frontend on Vercel.

**Architecture:** Backend as a Render web service, frontend on Vercel with rewrites proxying `/api/*` to Render. MongoDB Atlas for database.

**Tech Stack:** Node.js, Express, Render, Vercel, MongoDB Atlas

## Global Constraints

- Render free tier: 512MB RAM, sleeps after 15min idle
- Tesseract.js language data must be pre-downloaded during build
- Frontend URL: `https://phyat-paing-gktvzhj8d-vimmms-projects.vercel.app`
- Backend URL: `https://phyat-paing.onrender.com`

---

### Task 1: Update render.yaml

**Files:**
- Modify: `render.yaml`

**Interfaces:**
- Consumes: None
- Produces: Updated render.yaml ready for Render Blueprint deployment

- [ ] **Step 1: Read current render.yaml**

Read the current `render.yaml` to understand the existing configuration.

- [ ] **Step 2: Update render.yaml with correct values**

Replace the contents of `render.yaml` with:

```yaml
services:
  - type: web
    name: bill-organizer-api
    runtime: node
    plan: free
    rootDir: server
    buildCommand: npm install && node --input-type=module -e "import('tesseract.js').then(m => m.createWorker('eng+mya'))"
    startCommand: node src/server.js
    envVars:
      - key: NODE_ENV
        value: production
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
        generateValue: true
      - key: FRONTEND_URL
        value: https://phyat-paing-gktvzhj8d-vimmms-projects.vercel.app
```

- [ ] **Step 3: Verify render.yaml syntax**

Run: `cat render.yaml`
Expected: Valid YAML with all environment variables defined

- [ ] **Step 4: Commit changes**

```bash
git add render.yaml
git commit -m "chore: update render.yaml for deployment"
```

---

### Task 2: Verify vercel.json Configuration

**Files:**
- Read: `client/vercel.json`

**Interfaces:**
- Consumes: None
- Produces: Verified vercel.json configuration

- [ ] **Step 1: Read vercel.json**

Read `client/vercel.json` to verify the rewrite rules.

- [ ] **Step 2: Verify rewrite destination**

Check that the rewrite destination points to `https://phyat-paing.onrender.com/api/$1`.

Current content should be:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://phyat-paing.onrender.com/api/$1"
    }
  ]
}
```

- [ ] **Step 3: Update if needed**

If the destination URL is different, update it to `https://phyat-paing.onrender.com/api/$1`.

- [ ] **Step 4: Commit changes (if modified)**

```bash
git add client/vercel.json
git commit -m "chore: update vercel.json rewrite destination"
```

---

### Task 3: Verify CORS Configuration

**Files:**
- Read: `server/src/app.js`

**Interfaces:**
- Consumes: None
- Produces: Verified CORS configuration

- [ ] **Step 1: Read app.js CORS configuration**

Read `server/src/app.js` and verify the CORS configuration at lines 10-16.

- [ ] **Step 2: Verify FRONTEND_URL usage**

Confirm that the CORS origin uses `process.env.FRONTEND_URL` in production mode.

Expected code:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app'
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
```

- [ ] **Step 3: No changes needed**

The CORS configuration is already correct. No code changes required.

---

### Task 4: Deploy to Render

**Files:**
- None (manual deployment via Render dashboard)

**Interfaces:**
- Consumes: Updated render.yaml
- Produces: Deployed backend service

- [ ] **Step 1: Push changes to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Log in to Render**

Go to https://dashboard.render.com and log in.

- [ ] **Step 3: Create new Web Service**

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select the repository containing the bill-organizer project

- [ ] **Step 4: Configure service settings**

1. **Name**: `bill-organizer-api`
2. **Region**: Choose closest to your users
3. **Branch**: `main`
4. **Root Directory**: `server`
5. **Runtime**: `Node`
6. **Build Command**: `npm install && node --input-type=module -e "import('tesseract.js').then(m => m.createWorker('eng+mya'))"`
7. **Start Command**: `node src/server.js`

- [ ] **Step 5: Set environment variables**

In the Render dashboard, go to "Environment" tab and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | (your MongoDB Atlas connection string) |
| `CLOUDINARY_CLOUD_NAME` | (your Cloudinary cloud name) |
| `CLOUDINARY_API_KEY` | (your Cloudinary API key) |
| `CLOUDINARY_API_SECRET` | (your Cloudinary API secret) |
| `COHERE_API_KEY` | (your Cohere API key) |
| `JWT_SECRET` | (click "Generate" for random secret) |
| `FRONTEND_URL` | `https://phyat-paing-gktvzhj8d-vimmms-projects.vercel.app` |

- [ ] **Step 6: Deploy service**

Click "Create Web Service" and wait for the build to complete.

- [ ] **Step 7: Note the backend URL**

After deployment, note the service URL (e.g., `https://phyat-paing.onrender.com`).

---

### Task 5: Test Backend Deployment

**Files:**
- None (manual testing)

**Interfaces:**
- Consumes: Deployed backend service
- Produces: Verified deployment

- [ ] **Step 1: Test health endpoint**

Run: `curl https://phyat-paing.onrender.com/api/health`
Expected: `{"status":"healthy","timestamp":"...","uptime":...,"environment":"production"}`

- [ ] **Step 2: Test CORS headers**

Run: `curl -I -X OPTIONS https://phyat-paing.onrender.com/api/health -H "Origin: https://phyat-paing-gktvzhj8d-vimmms-projects.vercel.app" -H "Access-Control-Request-Method: GET"`
Expected: Response includes `Access-Control-Allow-Origin: https://phyat-paing-gktvzhj8d-vimmms-projects.vercel.app`

- [ ] **Step 3: Test frontend proxy**

1. Open your Vercel frontend URL in a browser
2. Try to register a new account
3. Try to login
4. Verify no CORS errors in browser console

- [ ] **Step 4: Test file upload**

1. Login to the frontend
2. Upload a bill image
3. Verify the upload completes successfully
4. Verify the bill appears in the dashboard

---

### Task 6: Update Frontend API URL (if needed)

**Files:**
- Read: `client/src/components/AuthContext.tsx`
- Read: `client/vite.config.ts`

**Interfaces:**
- Consumes: Backend URL
- Produces: Updated frontend configuration (if needed)

- [ ] **Step 1: Check how API calls are made**

Read `client/src/components/AuthContext.tsx` to see how API calls are made.

- [ ] **Step 2: Verify relative paths are used**

The frontend should use relative paths like `/api/auth/me` instead of absolute URLs. This works because Vercel rewrites proxy `/api/*` to the backend.

- [ ] **Step 3: No changes needed (if using relative paths)**

If the frontend already uses relative paths, no changes are needed.

- [ ] **Step 4: Update if using absolute URLs (if needed)**

If the frontend uses absolute URLs like `http://localhost:5000/api/...`, update them to use relative paths or `import.meta.env.VITE_API_URL`.

---

## Self-Review Checklist

- [ ] render.yaml is valid YAML with correct build command
- [ ] vercel.json rewrite points to correct backend URL
- [ ] CORS configuration uses FRONTEND_URL env var
- [ ] All environment variables are documented
- [ ] Deployment steps are clear and actionable
- [ ] Testing steps verify the deployment works

---

## Success Criteria

- Backend health check returns 200: `GET /api/health`
- Frontend can register and login via proxy
- Bill upload pipeline works end-to-end
- CORS allows requests from Vercel frontend
