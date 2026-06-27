# 01-evidence.md — Consolidated Evidence

**Audit:** Mobile header + hamburger + MobileNav drawer  
**Date:** 2026-06-27

---

## 1. Structural Evidence

**Interactive elements:** 14 instances, 9 unique roles
| Element | File:Line |
|---------|-----------|
| Skip-to-content link | App.tsx:63 |
| Brand h1 (clickable) | App.tsx:70 |
| Hamburger button | App.tsx:19 (def), 122 (render) |
| Dashboard nav-btn | App.tsx:78 |
| Analytics nav-btn | App.tsx:86 |
| Profile nav-btn | App.tsx:94 |
| Settings nav-btn | App.tsx:102 |
| Header ThemeToggle | App.tsx:111 |
| Header Logout | App.tsx:116 |
| MobileNav close button | MobileNav.tsx:68 |
| MobileNav Dashboard | MobileNav.tsx:79 |
| MobileNav Analytics | MobileNav.tsx:87 |
| MobileNav Profile | MobileNav.tsx:95 |
| MobileNav Settings | MobileNav.tsx:103 |
| MobileNav ThemeToggle | MobileNav.tsx:115 |
| MobileNav Logout | MobileNav.tsx:122 |

**Max nesting depth:** 7  
`header > .app-header__inner > .app-header__user > .app-header__nav > button > Icon`

**Repeated patterns:** 4
- Nav buttons (Dashboard/Analytics/Profile/Settings): duplicated across App.tsx:78-108 and MobileNav.tsx:79-103
- ThemeToggle: App.tsx:111 and MobileNav.tsx:115
- Logout button: App.tsx:116 and MobileNav.tsx:122
- User email display: App.tsx:112 and MobileNav.tsx:117

**Dead/unused:** 1
- `.mobile-nav-overlay` CSS class defined at App.css:2601, never referenced in JSX

## 2. Visual Evidence

**Spacing scale:** [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64] px — *index.css:14-24*, INFERRED

**Type scale:** [12, 14, 16, 18, 20, 24, 30, 36] px — *index.css:74-81*, INFERRED

**Distinct colors referenced in audited blocks:** 14  
(`--color-surface`, `--color-bg`, `--color-surface-hover`, `--color-border`, `--color-border-light`, `--color-text`, `--color-text-secondary`, `--color-text-muted`, `--color-accent`, `--color-accent-border`, `--color-info`, `--color-danger`, `--color-danger-light`, `#fff` hardcoded)

**Lowest contrast:** ~3.3:1 INFERRED  
`--color-text-muted` (#94a3b8) on `--color-surface` (#ffffff) — below WCAG AA 4.5:1. Used for close button (App.css:2677) and logout button (App.css:78).

**Hamburger states present:** focus only (App.css:2594)  
Missing: empty, loading, error, success, disabled

**MobileNav states present:** open, closed, focus-within  
Missing: empty (no items), loading, error

**Idle animations:** 0 active (2 transitions + 1 backdrop-filter declared, none running continuously)

## 3. Copy & Honesty Evidence

**User-facing strings:** 24 total across App.tsx, MobileNav.tsx, ThemeToggle.tsx, index.html

**Flagged inflations:** 1
- "data extracted automatically": App.tsx:74 + index.html:6 — implies zero-effort magic; OCR+AI pipeline requires user upload and can fail

**Flagged dark patterns:** 0

**Flagged jargon:**
- "Analytics": App.tsx:91, MobileNav.tsx:92 → "Spending Insights" more appropriate for bill-tracking users

**Label→behavior mismatches:** 0

**Brand inconsistency:**
- Header: "Phyat Paing (ဖြတ်ပိုင်း)" — App.tsx:72
- MobileNav: "Phyat Paing" (Burmese script omitted) — MobileNav.tsx:66

## 4. Weight & Friction Evidence

**Initial JS:** ~280 KB gzip ESTIMATED (React + react-dom + lucide-react + recharts + jspdf components)

**Network requests for primary view:** ~6 ESTIMATED (HTML + CSS + JS + /api/auth/me + /api/bills + /api/bills/months)

**TTI:** ~1200ms ESTIMATED (local dev; production ~600-800ms with gzip)

**Idle animations:** 1 — `backdrop-filter: blur(12px)` on `.app-header` (App.css:14), a GPU compositor operation

**Modals/badges on load:** 0

**Dark mode:** Yes — `[data-theme="dark"]` tokens at index.css:109, toggled via ThemeToggle

**prefers-reduced-motion:** Present — blanket reduction at index.css:225-237
