# 02-scorecard.md — Dieter Rams Principle Scores

**Total: 16 / 30**

---

### 1. Good design is innovative — Score: 1/3
**Evidence:** CSS-only three-line hamburger-to-X animation; slide-out drawer. Both are well-established patterns (Stripe, Bootstrap, countless libraries).  
**Justification:** Imitates competitors with minor variation — the CSS-only approach is clean but introduces no new navigation paradigm.

### 2. Good design makes a product useful — Score: 2/3
**Evidence:** 4 nav items serve the primary task (navigate dashboard/analytics/profile/settings). Brand h1 clickable for home (01-evidence.md §1).  
**Justification:** Primary task completes, but the duplication of nav + ThemeToggle + Logout across desktop and mobile surfaces adds maintenance burden without helping the user.

### 3. Good design is aesthetic — Score: 2/3
**Evidence:** Spacing scale 11 steps, type scale 8 steps, 14 colors from a token system. `--color-text-muted` contrast ~3.3:1 on surface — below WCAG AA (01-evidence.md §2). Brand name missing Burmese script in MobileNav (01-evidence.md §3).  
**Justification:** One jarring violation (contrast below 4.5:1) plus one brand inconsistency — two minor issues, not a broken system.

### 4. Good design makes a product understandable — Score: 2/3
**Evidence:** "Analytics" flagged as technical jargon for bill-tracking users (01-evidence.md §3). Remaining nav labels are standard.  
**Justification:** 1 control would need explanation to a first-time user unfamiliar with analytics dashboards.

### 5. Good design is unobtrusive — Score: 2/3
**Evidence:** Sticky header with subtle backdrop-filter blur; slide drawer covers content only when open. Nav chrome is visible but recedes when not in use (01-evidence.md §2 — no idle animations).  
**Justification:** Chrome is visible (persistent top bar) but quiet — not decorative, not competing with content.

### 6. Good design is honest — Score: 1/3
**Evidence:** "data extracted automatically" at App.tsx:74 and index.html:6 (01-evidence.md §3). The pipeline requires user upload, runs OCR+AI, and can fail or require manual correction — "automatically" overpromises.  
**Justification:** 2 instances of the same inflation across subtitle and meta description — exceeds the "≤1 minor inflation" threshold for a 2.

### 7. Good design is long-lasting — Score: 2/3
**Evidence:** CSS line-based hamburger (no framework dependency), slide-out drawer (durable mobile pattern), token-driven design system. Subtle gradient on title via `background-clip: text` (01-evidence.md §2).  
**Justification:** 1 dated marker — `background-clip` gradient text is a 2020s trend that may read as period-specific. Everything else is timeless.

### 8. Good design is thorough down to the last detail — Score: 1/3
**Evidence:** Hamburger: only `:focus-visible` present out of 6 states. MobileNav: open/closed/focus-within present, but empty/loading/error missing (01-evidence.md §2).  
**Justification:** 2–3 meaningful states missing across the combined surface (disabled on hamburger, empty + error on MobileNav).

### 9. Good design is environmentally friendly — Score: 2/3
**Evidence:** ~280 KB initial JS (under 500 KB), dark mode honored, prefers-reduced-motion respected, 0 autoplay (01-evidence.md §4). One idle GPU effect: `backdrop-filter: blur(12px)`.  
**Justification:** Under 500 KB with motion gated — the threshold for a 3 is <100 KB, which React apps rarely meet; this is solid for the stack.

### 10. Good design is as little design as possible — Score: 1/3
**Evidence:** 4 nav items duplicated across App.tsx:78-108 and MobileNav.tsx:79-103. ThemeToggle duplicated at App.tsx:111 and MobileNav.tsx:115. Logout duplicated at App.tsx:116 and MobileNav.tsx:122. Dead CSS class `.mobile-nav-overlay` at App.css:2601. 8 nav button instances for 4 navigation targets (01-evidence.md §1).  
**Justification:** 3–5 removable elements — the MobileNav could reuse or share the header's nav data structure; the close button is a separate element when the hamburger could toggle.
