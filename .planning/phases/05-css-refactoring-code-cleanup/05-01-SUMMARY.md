---
phase: 05-css-refactoring-code-cleanup
plan: 01
subsystem: client/styles, server/models
tags: [css, refactoring, dark-mode, database-indexes, cleanup]
requires: []
provides: [per-component-css, css-custom-properties, dark-mode-tokens, bill-indexes]
affects: [client/src, server/src/models]
tech-stack:
  added: []
  patterns: [css-custom-properties, bem-naming, compound-indexes]
key-files:
  created:
    - client/src/components/AppHeader.css
    - client/src/components/AuthPage.css
    - client/src/components/BillDashboard.css
    - client/src/components/Sidebar.css
    - client/src/components/BillUploader.css
    - client/src/components/CategoryTabs.css
    - client/src/components/BillCard.css
    - client/src/components/Skeleton.css
    - client/src/components/Toast.css
    - client/src/components/ImageViewer.css
    - client/src/components/ErrorBoundary.css
    - client/src/components/BillEditModal.css
    - client/src/components/AnalyticsPage.css
    - client/src/components/UpcomingBills.css
    - client/src/components/SettingsPage.css
    - client/src/components/MobileNav.css
  modified:
    - client/src/App.tsx
    - client/src/index.css
    - client/src/components/BillCard.tsx
    - client/src/components/BillDashboard.tsx
    - client/src/components/BillEditModal.tsx
    - client/src/components/BillUploader.tsx
    - client/src/components/SpendingOverview.tsx
    - client/src/components/AuthPage.tsx
    - client/src/components/Sidebar.tsx
    - client/src/components/CategoryTabs.tsx
    - client/src/components/Toast.tsx
    - client/src/components/ErrorBoundary.tsx
    - client/src/components/AnalyticsPage.tsx
    - client/src/components/UpcomingBills.tsx
    - client/src/components/SettingsPage.tsx
    - client/src/components/ProfilePage.tsx
    - client/src/components/MobileNav.tsx
    - server/src/models/Bill.js
  deleted:
    - client/src/App.css
decisions:
  - "Use CSS custom properties (not CSS Modules) for dynamic values to maintain global scope"
  - "Distribute responsive overrides to component files that own the selectors"
  - "ProfilePage shares SettingsPage.css since they use the same page-container styles"
  - "BillCard imports ImageViewer.css since lightbox is rendered within BillCard component"
metrics:
  duration: ~15min
  completed: 2026-06-27
  tasks_completed: 2
  tasks_total: 2
  files_created: 16
  files_modified: 18
  files_deleted: 1
status: complete
---

# Phase 5 Plan 01: CSS Refactoring & Code Cleanup Summary

Split monolithic 2773-line App.css into 16 per-component CSS files, converted all inline styles to CSS classes/custom properties, added dark mode CSS tokens, and added compound database indexes to the Bill model.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Split App.css into per-component CSS files | 15d108f | 16 CSS files created, App.tsx modified, App.css deleted |
| 2 | Replace inline styles and fix dark mode colors | 31d5998 | 10 TSX files modified, 6 CSS files modified, index.css updated, Bill.js updated |

## Key Changes

### Task 1: CSS Split
- Deleted monolithic `client/src/App.css` (2773 lines)
- Created 16 per-component CSS files in `client/src/components/`
- Added CSS imports to each TSX component file
- Updated App.tsx to import AppHeader.css instead of App.css
- Distributed responsive media queries to owning component files

### Task 2: Inline Style Conversion & Dark Mode
- **BillCard.tsx**: Category color → `style={{ '--category-color': categoryColor }}`
- **BillDashboard.tsx**: Skeleton header → `className="skeleton-card__header"`, summary flush → `dashboard__summary--flush`, meta text → `dashboard__summary-meta`
- **BillEditModal.tsx**: Category button colors → `style={{ '--cat-color': CATEGORY_COLORS[cat] }}`
- **BillUploader.tsx**: File size hint → `className="uploader__hint"`
- **SpendingOverview.tsx**: Skeleton height → `className="skeleton--chart"`, budget alerts → CSS variables `--bar-color`, `--bar-pct`
- **App.tsx**: Title cursor → `className="app-title--clickable"`

### Dark Mode Token Cleanup
- Added tokens to `:root`: `--color-on-accent`
- Added tokens to `[data-theme="dark"]`: `--color-danger-dark`, `--color-danger-border-dark`, `--color-warning-dark`, `--color-on-accent`
- Replaced 9 hardcoded hex colors in UpcomingBills.css with CSS variables

### Database Indexes
- Added `billSchema.index({ userId: 1, createdAt: -1 })` for date-sorted queries
- Added `billSchema.index({ userId: 1, category: 1 })` for category-filtered queries

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all CSS content distributed without stubs.

## Threat Flags

None - CSS refactoring does not introduce new security surface.

## Self-Check: PASSED

- [x] 16 per-component CSS files exist in client/src/components/
- [x] App.css no longer exists at client/src/App.css
- [x] Each TSX component imports its own CSS file
- [x] App.tsx no longer has `import './App.css'`
- [x] `npx vite build` succeeds with zero errors
- [x] Zero static inline styles remain (all converted to CSS classes or CSS custom properties)
- [x] All 9 hardcoded hex colors in UpcomingBills.css replaced with CSS variables
- [x] New tokens exist in index.css (:root and [data-theme="dark"])
- [x] Bill.js has compound indexes {userId, createdAt} and {userId, category}
- [x] Pre-existing TypeScript errors (BudgetLimits unused, useContext unused) are unrelated to this refactoring
