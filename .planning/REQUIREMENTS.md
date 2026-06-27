# Requirements: Smart Bill Organizer

**Defined:** 2026-06-27
**Core Value:** Users can upload a bill image and get structured, searchable bill data automatically

## v1 Requirements

Requirements for language switching milestone. Each maps to roadmap phases.

### Translation System

- [ ] **I18N-01**: Create `i18n/en.json` with ~120 English translation keys
- [ ] **I18N-02**: Create `i18n/my.json` with ~120 Burmese translation keys
- [ ] **I18N-03**: Create `i18n/LanguageContext.tsx` with React Context provider and `t()` function
- [ ] **I18N-04**: Create `i18n/useTranslation.ts` convenience hook returning `{ t, lang, setLang }`
- [ ] **I18N-05**: Create `i18n/formatDate.ts` locale-aware date formatting helper

### UI Components

- [ ] **I18N-06**: Create `LanguageToggle.tsx` — compact pill button in header (EN/MM cycle)
- [ ] **I18N-07**: Add Language section to `SettingsPage.tsx` with dropdown selector
- [ ] **I18N-08**: Wrap `App.tsx` with `LanguageProvider` and add toggle to header

### Component Translation

- [ ] **I18N-09**: Translate `AuthPage.tsx` — login/register form labels, placeholders, errors
- [ ] **I18N-10**: Translate `BillDashboard.tsx` — headers, search placeholder, total count
- [ ] **I18N-11**: Translate `BillCard.tsx` — Paid/Unpaid, Edit, Delete, Overdue, date format
- [ ] **I18N-12**: Translate `BillUploader.tsx` — upload stages, drop zone text
- [ ] **I18N-13**: Translate `CategoryTabs.tsx` — use CATEGORY_LABELS for display
- [ ] **I18N-14**: Translate `Sidebar.tsx` — bills count, year/month labels
- [ ] **I18N-15**: Translate `SpendingOverview.tsx` — Budget, category labels, alert text
- [ ] **I18N-16**: Translate `UpcomingBills.tsx` — "Due in X days", category labels
- [ ] **I18N-17**: Translate `ExportButtons.tsx` — button labels only (not file content)
- [ ] **I18N-18**: Translate `ProfilePage.tsx` — Profile, Change Password, field labels
- [ ] **I18N-19**: Translate `Toast.tsx` — success/error messages
- [ ] **I18N-20**: Translate `RecurringBadge.tsx` — "Recurring" tooltip
- [ ] **I18N-21**: Translate `ErrorBoundary.tsx` — error fallback UI

### Integration

- [ ] **I18N-22**: Add `CATEGORY_LABELS` to `types.ts` — English/Burmese category display names
- [ ] **I18N-23**: Update all `toLocaleDateString('en-US')` calls to use `formatDate()` helper
- [ ] **I18N-24**: Update `document.documentElement.lang` on language change

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Additional Languages

- **I18N-25**: Add Chinese (Simplified) translations
- **I18N-26**: Add Thai translations
- **I18N-27**: Language detection from browser settings

### Advanced i18n

- **I18N-28**: Pluralization support (e.g., "1 bill" vs "2 bills")
- **I18N-29**: Right-to-left layout support
- **I18N-30**: Myanmar numeral system for amounts

## Out of Scope

| Feature | Reason |
|---------|--------|
| Myanmar numerals for amounts | Arabic numerals preferred for financial readability |
| RTL layout | Burmese script is left-to-right |
| Server-side language detection | Client-side localStorage is sufficient |
| Additional languages | Scope limited to English + Burmese for v1 |
| PDF/CSV content translation | Headers stay English for data portability |
| Tesseract OCR language switching | Already supports eng+mya, no change needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| I18N-01 | Phase 1 | Pending |
| I18N-02 | Phase 1 | Pending |
| I18N-03 | Phase 1 | Pending |
| I18N-04 | Phase 1 | Pending |
| I18N-05 | Phase 1 | Pending |
| I18N-06 | Phase 2 | Pending |
| I18N-07 | Phase 2 | Pending |
| I18N-08 | Phase 2 | Pending |
| I18N-09 | Phase 3 | Pending |
| I18N-10 | Phase 3 | Pending |
| I18N-11 | Phase 3 | Pending |
| I18N-12 | Phase 3 | Pending |
| I18N-13 | Phase 3 | Pending |
| I18N-14 | Phase 3 | Pending |
| I18N-15 | Phase 4 | Pending |
| I18N-16 | Phase 4 | Pending |
| I18N-17 | Phase 4 | Pending |
| I18N-18 | Phase 4 | Pending |
| I18N-19 | Phase 3 | Pending |
| I18N-20 | Phase 4 | Pending |
| I18N-21 | Phase 4 | Pending |
| I18N-22 | Phase 2 | Pending |
| I18N-23 | Phase 4 | Pending |
| I18N-24 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-27*
*Last updated: 2026-06-27 after roadmap creation*
