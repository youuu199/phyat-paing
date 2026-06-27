# Scope — Dieter Rams Design Audit

**Date:** 2026-06-27
**Audited surface:** Mobile header bar + hamburger button + MobileNav slide-out drawer
**Breakpoint:** ≤640px (mobile only)

## What is being audited

| Component | Files |
|-----------|-------|
| Header bar | `client/src/App.tsx:66-127`, `client/src/App.css:7-123` |
| Hamburger button | `client/src/App.tsx:17-31`, `client/src/App.css:2536-2592` |
| MobileNav drawer | `client/src/components/MobileNav.tsx`, `client/src/App.css:2595-2730` (approx) |

## Primary user & task

Myanmar users managing their household bills. Primary task on this surface: **navigate between dashboard, analytics, profile, and settings on a phone**.

## Constraints

- Tech stack: React-TS + CSS custom properties (no Tailwind)
- Must work light + dark mode
- Must support Myanmar characters (brand name: ဖြတ်ပိုင်း)
- Touch targets ≥44px

## What we skip

- Desktop nav (hidden on mobile per `display: none`)
- Page content below the header
- Auth page (only appears when logged out)
