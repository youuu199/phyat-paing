# Responsive Design — Mobile & Tablet Breakpoints

**Date:** 2026-07-17
**Status:** Approved
**Approach:** Mobile-first with Tailwind breakpoints

## Overview

Make the Phyat Paing web app responsive across three breakpoints: mobile (< 640px), tablet (640px–1024px), and desktop (> 1024px). Currently the app is desktop-only with a fixed 260px sidebar.

## Breakpoints

| Breakpoint | Width | Target | Sidebar | Navigation |
|------------|-------|--------|---------|------------|
| `sm` | < 640px | Mobile phones | Hidden | Bottom tab bar |
| `md` | 640px–1024px | Tablets | Collapsed (icons only, ~72px) | Sidebar icons |
| `lg` | > 1024px | Desktop | Full (260px, with labels) | Full sidebar |

## Navigation System

### Mobile Bottom Tab Bar (`MobileNav.tsx`)

Fixed at the bottom of the screen, 5 tabs:

1. **Dashboard** — Home icon
2. **Bills** — Receipt icon
3. **Upload** — Plus/upload icon (prominent center, slightly larger)
4. **Calendar** — Calendar icon
5. **More** — Menu icon → popover with Settings, Profile, Analytics, Logout

Specs:
- Height: 64px with `env(safe-area-inset-bottom)` for iPhone notch
- Active tab: primary color icon + label
- Inactive: muted gray
- Upload button: slightly raised/emphasized

### Tablet Collapsible Sidebar

- Width: 260px → 72px
- Labels hide, only icons show
- Hover/tap on icon shows tooltip with page name
- Profile section: avatar only (no name/email)
- Transition: smooth width animation (200ms)

### AppLayout Structure

```
Mobile:  <MobileNav /> + <main> (no sidebar)
Tablet:  <Sidebar collapsed /> + <main>
Desktop: <Sidebar full /> + <main>
```

## Page Layouts — Mobile (< 640px)

### Dashboard

- Header: title + search icon (expands on tap) + bell icon
- Upload Bill: floating action button (bottom-right)
- Metric cards: 2x2 grid (smaller padding)
- Category tabs: horizontal scrollable
- Bill list: full-width card layout
- Spending chart: moves below bill list

### Bills

- Header: title + filter icon + export icon
- Month navigation: simplified with arrows + label
- Table → card list: each bill shows all info vertically (title, category, amount, due date, status, actions inline)
- "New Bill": FAB or header icon

### Upload

- Drop zone: full width, shorter height
- Recent uploads: stacks below drop zone
- Tips: stacks below that

### Analytics

- Period selector: wraps to two lines if needed
- Metric cards: 2x2 grid
- Charts: stack vertically (Monthly Spending → Category Breakdown)
- Insights: stack vertically

### Calendar

- Month navigation: arrows + label + Today button (simplified)
- Calendar grid: smaller cells, dots only for days with bills (no chips)
- Tap day → modal with bills (same as current)
- Month summary + upcoming bills: stack below calendar

### Auth (Login/Register)

- Branding: compact, centered (icon + name + tagline)
- Form: full-width below branding
- Features list: hidden on mobile

## Page Layouts — Tablet (640px–1024px)

- Sidebar: collapsed (72px, icons only)
- Content: desktop-like layouts with tighter spacing
- Dashboard: 4 metric cards in row, card-style bills, narrower chart sidebar (280px)
- Bills: simplified table (Bill, Amount, Status, Actions) or card layout
- Analytics: 4 metric cards, side-by-side charts (300px + flex)
- Calendar: full grid with bill chips, narrower sidebar (240px)
- Settings/Profile: already partially responsive, ensure tabs are horizontal scrollable

## Touch Targets & Spacing

### Touch Target Minimums (Mobile)

| Element | Current | Mobile Minimum |
|---------|---------|----------------|
| Buttons | h-10 (40px) | h-11 (44px) |
| Form inputs | h-10 (40px) | h-12 (48px) |
| Bill row actions | 30x30px | 44x44px |
| Category tabs | h-[34px] | h-10 (40px) |
| Navigation links | py-2.5 | py-3 |
| Modal close buttons | w-8 h-8 | w-10 h-10 |

### Spacing Adjustments

- Page padding: `p-8` → `p-4` mobile, `p-6` tablet
- Section gaps: `gap-6` → `gap-4` mobile
- Card padding: `p-5` → `p-4` mobile
- Border radius: unchanged

### Modal Adjustments (Mobile)

- Full-width with `m-4` margin, `max-h-[90vh]`
- Form fields: full-width stacking

### Safe Area Support

- Bottom tab bar: `pb-safe` for iPhone notch
- Use `env(safe-area-inset-bottom)` in CSS

## Implementation Scope

### New Components

| Component | Purpose |
|-----------|---------|
| `MobileNav.tsx` | Bottom tab bar for mobile |
| `useBreakpoint.ts` | Hook: `mobile`, `tablet`, `desktop` |

### Files to Modify

| File | Changes |
|------|---------|
| `layouts/AppLayout.tsx` | Conditional sidebar/bottom-nav |
| `components/Sidebar.tsx` | Collapsible mode for tablet |
| `pages/DashboardPage.tsx` | Responsive metrics, search, FAB, chart |
| `pages/BillsPage.tsx` | Card list mobile, simplified table tablet |
| `pages/UploadPage.tsx` | Full-width drop zone, stacked layout |
| `pages/AnalyticsPage.tsx` | 2x2 metrics, stacked charts |
| `pages/CalendarPage.tsx` | Smaller cells, stacked sidebar |
| `pages/SettingsPage.tsx` | Minor responsive tweaks |
| `pages/ProfilePage.tsx` | Minor responsive tweaks |
| `components/AuthPage.tsx` | Stack branding + form |
| `index.css` | Sidebar animation, safe-area, touch adjustments |

### Implementation Order

1. Foundation — `useBreakpoint` hook, `MobileNav`, `AppLayout`
2. Sidebar — collapsible mode with animation
3. Auth Page — warm-up, simplest page
4. Dashboard — most complex, foundational
5. Bills Page — table → card transformation
6. Upload Page — straightforward stacking
7. Analytics Page — metric grid + chart stacking
8. Calendar Page — grid + sidebar adjustments
9. Settings/Profile — minor tweaks
10. Polish — safe areas, animations, testing

### What's NOT in Scope

- No new pages or features
- No backend changes
- No new dependencies
- No changes to data flow or state management
- No visual redesign (colors, fonts, icons unchanged)
