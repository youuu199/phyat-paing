# User Authentication & Data Isolation — Implementation Plan

## Goal

Add user registration, login, and per-user data isolation. After auth, each user can only see and manage their own bills.

## Approach: JWT (stateless, no session store)

- **Auth method**: JWT (jsonwebtoken) — token sent as `Authorization: Bearer <token>`
- **Password hashing**: bcryptjs (pure JS, no native compilation needed)
- **Token storage**: localStorage on client, read into React Context on mount
- **Frontend routing**: Conditional rendering (no react-router) — if no token → show auth forms, if token → show dashboard

---

## Backend Changes

### 1. Install dependencies
```bash
cd server && npm install bcryptjs jsonwebtoken
```

### 2. Create User model — `server/src/models/User.js`
- `email`: String, required, unique, lowercase, trimmed
- `passwordHash`: String, required
- `timestamps: true`

### 3. Create auth middleware — `server/src/middleware/auth.js`
- Extract `Authorization: Bearer <token>` header
- Verify with `jwt.verify(token, JWT_SECRET)`
- Attach `req.userId` to request
- Return 401 on missing/invalid token

### 4. Create auth controller — `server/src/controllers/authController.js`
- `register` — validate email + password (min 6 chars), check duplicate, hash password, create User, return JWT
- `login` — find user by email, compare password, return JWT
- `getMe` — return current user info (email, createdAt) from `req.userId`

### 5. Create auth routes — `server/src/routes/authRoutes.js`
- `POST /api/auth/register` — public
- `POST /api/auth/login` — public
- `GET /api/auth/me` — protected (auth middleware)

### 6. Update Bill model — `server/src/models/Bill.js`
- Add `userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }`

### 7. Update bill controller — `server/src/controllers/billController.js`
- `createBill` — set `userId: req.userId` on created bill
- `getBills` — add `filter.userId = req.userId` to every query
- `getAvailableMonths` — add `{ $match: { userId: new mongoose.Types.ObjectId(req.userId) } }` to pipeline
- `getBillStats` — same, add `$match` with userId
- `deleteBill` — add `userId: req.userId` to findByIdAndDelete filter (so users can't delete others' bills)

### 8. Update bill routes — `server/src/routes/billRoutes.js`
- Apply `auth` middleware to ALL bill routes

### 9. Update app.js — `server/src/app.js`
- Mount auth routes: `app.use('/api/auth', authRoutes)`

### 10. Update server.js
- Remove the hardcoded seed data — seeding 12 placeholder bills without userId no longer works
- (Optional) remove `seedIfEmpty()` entirely, or keep it as a no-op

### 11. Update .env.example
- Add `JWT_SECRET=your-jwt-secret-here-change-in-production`

---

## Frontend Changes

### 1. Create AuthContext — `client/src/components/AuthContext.tsx`
- State: `token` (string|null), `user` ({email, createdAt}|null), `loading` (boolean)
- On mount: check localStorage for token, call `GET /api/auth/me` to validate
- `login(email, password)` — POST /api/auth/login, store token in localStorage, update state
- `register(email, password)` — POST /api/auth/register, store token, update state
- `logout()` — clear localStorage, reset state
- `apiFetch(path, options)` — wrapper around fetch that adds `Authorization: Bearer <token>` header
- Provide: `{ token, user, loading, login, register, logout, apiFetch }`

### 2. Create AuthPage — `client/src/components/AuthPage.tsx`
- Toggle between Login and Register forms
- Email + Password fields (Register adds Confirm Password)
- Validation: email format, password min 6 chars, passwords match
- Error display
- Submit button with loading state
- Clean, centered card layout matching the design system

### 3. Update App.tsx
- Wrap everything in `<AuthProvider>`
- If `loading` → show centered spinner
- If `!token` → show `<AuthPage />`
- If `token` → show `<AppHeader />` + `<BillDashboard />`
- Add logout button to header (using context)

### 4. Update BillDashboard.tsx
- Accept `apiFetch` from context instead of raw `fetch`
- Add user greeting + logout button in the summary row
- Pass `apiFetch` down or use context directly

### 5. Update BillCard.tsx
- Use `apiFetch` from context for delete call

### 6. Add auth CSS to App.css
- Auth page card, form inputs, toggle link styles
- Match existing design system tokens

---

## Verification
- [ ] `POST /api/auth/register` creates user and returns JWT
- [ ] `POST /api/auth/login` with valid credentials returns JWT
- [ ] `POST /api/auth/login` with wrong password returns 401
- [ ] `GET /api/bills` without token returns 401
- [ ] `GET /api/bills` with token returns only that user's bills
- [ ] User A cannot see or delete User B's bills
- [ ] Frontend: register → auto-login → see empty dashboard
- [ ] Frontend: upload bill → it appears and belongs to that user
- [ ] Frontend: logout → back to auth page → login → sees own bills
- [ ] Page refresh maintains session (token in localStorage)

---

## Anti-Pattern Checklist (auth-specific)
- [ ] JWT_SECRET is set in .env (not hardcoded)
- [ ] Passwords are hashed with bcryptjs (never stored in plaintext)
- [ ] Auth middleware rejects missing/invalid/expired tokens
- [ ] Bill queries always filter by `userId`
- [ ] DELETE checks userId ownership before deleting
- [ ] No seed data with placeholder user IDs
