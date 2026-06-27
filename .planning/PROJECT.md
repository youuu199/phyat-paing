# Smart Bill Organizer

## What This Is

A MERN web app that lets users upload images of utility bills/receipts, extracts data via OCR (Tesseract.js) and AI classification (Cohere), and displays them on a filterable dashboard with spending analytics, bill management, and export tools.

## Core Value

Users can upload a bill image and get structured, searchable bill data automatically — no manual entry.

## Requirements

### Validated

- ✓ User auth — Register/login with JWT, httpOnly cookies, per-user bill isolation
- ✓ Upload bills — Image upload to Cloudinary with progress stages
- ✓ OCR extraction — Tesseract.js extracts Myanmar + English text from bill images
- ✓ AI classification — Cohere Command A auto-detects category (Electricity, Water, Internet, Phone, Shopping, Other)
- ✓ Validation — Rejects unrecognized bills (no amount / unknown title) with descriptive alerts
- ✓ Dashboard — Responsive grid of bill cards with thumbnails
- ✓ Search & filter — By title, category (7 tabs), and month/year (sidebar)
- ✓ Edit & delete — Correct AI-extracted data, remove bills (with Cloudinary cleanup)
- ✓ Pagination — Server-side pagination for large datasets
- ✓ Dark mode — Toggle with localStorage persistence
- ✓ Spending analytics — Category pie chart, monthly trend line chart, budget alerts
- ✓ Bill management — Due dates, recurring bills (monthly/quarterly/yearly), payment tracking
- ✓ Product polish — Profile page, settings page, CSV/PDF export, mobile navigation
- ✓ Security — Helmet, rate limiting, account lockout, CORS, error sanitization

### Active

- [ ] **I18N-01**: English/Burmese UI language switching
- [ ] **I18N-02**: Translation of all user-facing text (labels, buttons, categories, errors, placeholders)
- [ ] **I18N-03**: Language toggle in header and settings page
- [ ] **I18N-04**: Date formatting localized for Burmese (Myanmar locale, Arabic numerals)
- [ ] **I18N-05**: Category labels translated (Electricity, Water, Internet, Phone, Shopping, Other)

### Out of Scope

- Myanmar numeral system — Amounts stay Arabic for financial readability
- RTL layout — Burmese is LTR
- Server-side language detection — Client-side only
- Additional languages — English and Burmese only for now
- Translation of exported PDF/CSV content — Headers stay English
- Tesseract OCR language switching — Already supports eng+mya

## Context

- Design spec approved: `docs/superpowers/specs/2026-06-27-i18n-burmese-design.md`
- No backend changes needed — language preference is localStorage-only
- Categories remain English strings in MongoDB for backend compatibility
- Tesseract already uses `eng+mya` — no OCR changes needed
- ~120 translation keys needed across auth, categories, dashboard, bills, settings

## Constraints

- **Tech stack**: React + TypeScript + Vite (no new deps needed for i18n — custom Context solution)
- **Backend**: No API changes — categories stay English in MongoDB
- **Performance**: Translation lookups must be O(1) — flat key namespace with dot prefixes
- **Accessibility**: `document.documentElement.lang` must update on language change

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom i18n (no react-i18next) | Lightweight, no extra deps, flat key format sufficient | ✓ Good |
| localStorage for preference | No backend changes, per-device persistence | ✓ Good |
| Categories stay English in DB | Backend compatibility, no migration needed | ✓ Good |
| Arabic numerals for amounts | Financial readability across languages | ✓ Good |
| Flat key namespace with dots | Simple, fast lookups, organized by domain | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-27 after new milestone initialization*
