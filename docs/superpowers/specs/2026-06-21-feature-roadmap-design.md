# Feature Roadmap Design — Smart Bill Organizer

**Date:** 2026-06-21
**Status:** Approved
**Scope:** Analytics dashboard, smart bill management, product polish

---

## Overview

Three-phase feature roadmap to transform the bill organizer from a basic upload-and-view app into a comprehensive spending management tool.

**Build order:** Analytics → Bill Management → Product Polish

---

## Phase 1: Spending Analytics Dashboard

### Goal

Help users understand where their money goes with visual charts and budget alerts.

### Chart Library

**Recharts** — declarative React components, lightweight, perfect fit for pie/line charts.

```bash
cd client && npm install recharts
```

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `SpendingOverview` | `client/src/components/SpendingOverview.tsx` | Container card with category/trend tabs |
| `CategoryPieChart` | `client/src/components/CategoryPieChart.tsx` | Donut chart by category |
| `MonthlyTrendChart` | `client/src/components/MonthlyTrendChart.tsx` | Line chart of monthly totals |
| `BudgetAlerts` | `client/src/components/BudgetAlerts.tsx` | Progress bars with warning colors |

### New Backend Endpoint

**`GET /api/bills/trends?months=12`**

Returns monthly spending totals for the authenticated user:

```json
[
  { "year": 2026, "month": 1, "total": 45000, "count": 3 },
  { "year": 2026, "month": 2, "total": 32000, "count": 2 }
]
```

Implementation: MongoDB aggregation grouping by year+month, sorted newest first.

### Budget Feature

- User sets per-category spending limits in a settings panel
- Stored in **localStorage** (no backend changes needed for MVP)
- Dashboard shows progress bar under each category
- Warning color at >80%, danger at >100%

### Data Flow

```
/api/bills/stats (existing)  →  CategoryPieChart
/api/bills/trends (new)      →  MonthlyTrendChart
localStorage budgets          →  BudgetAlerts
```

### Dependencies

- `recharts` (chart library)

---

## Phase 2: Smart Bill Management

### Goal

Track due dates, recurring bills, and payment status.

### Schema Changes (Bill Model)

New optional fields:

```javascript
{
  dueDate: Date,              // When is this bill due?
  isRecurring: { type: Boolean, default: false },
  recurringInterval: String,  // 'monthly' | 'quarterly' | 'yearly'
  isPaid: { type: Boolean, default: false },
  paidAt: Date,               // When was it paid?
}
```

All fields optional — backward compatible with existing bills.

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `BillCalendar` | `client/src/components/BillCalendar.tsx` | Calendar grid showing bills by due date |
| `RecurringBadge` | `client/src/components/RecurringBadge.tsx` | Badge on bill cards |
| `PaymentToggle` | `client/src/components/PaymentToggle.tsx` | Checkbox to mark paid/unpaid |
| `UpcomingBills` | `client/src/components/UpcomingBills.tsx` | Widget showing next 5 due bills |
| `OverdueAlert` | `client/src/components/OverdueAlert.tsx` | Banner for overdue bills |

### New Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bills/:id/payment` | PATCH | Toggle paid/unpaid status |
| `/api/bills/upcoming` | GET | Bills due in next 7 days |
| `/api/bills/:id/recurring` | POST | Set recurring schedule |

### Recurring Bills

- User marks a bill as recurring (monthly/quarterly/yearly)
- Server-side cron check runs daily (or on startup)
- Auto-creates new bill copy with next month's due date
- Uses `node-cron` for scheduling

### Dependencies

- `node-cron` (server-side scheduling)
- `react-calendar` or custom calendar component

---

## Phase 3: Product Polish

### Goal

Make it feel like a real product — profile, settings, export, mobile-friendly.

### User Profile & Settings

**Profile page:**
- Email display, account created date
- Change password form

**Settings page:**
- Currency display (MMK default)
- Theme toggle (light/dark via CSS variables)
- Budget limits (Phase 1 integration)
- Settings stored in localStorage + optional User model fields

### Export

**`GET /api/bills/export?format=csv&year=2026&month=6`**

- **CSV:** title, amount, category, date, paid status
- **PDF:** Client-side generation using `html2canvas` + `jsPDF`

### Mobile Optimization

- Responsive grid: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
- Touch-friendly: swipe-to-delete on bill cards
- Bottom navigation bar on mobile
- Upload area full-width on small screens

### Family Sharing (Stretch)

- Invite family member by email
- Shared bill view (read-only for invited users)
- `sharedWith: [userId]` field on Bill model
- Separate "Shared Bills" tab in dashboard

### Dependencies

- `jspdf` + `html2canvas` (PDF export)
- No new backend deps for mobile (CSS-only responsive)

---

## Implementation Order

1. **Phase 1** — Analytics (recharts, trends endpoint, budget alerts)
2. **Phase 2** — Bill Management (schema changes, calendar, recurring)
3. **Phase 3** — Product Polish (profile, export, mobile, sharing)

Each phase is independently deployable and adds user-visible value.

---

## Tech Stack Additions

| Package | Phase | Purpose |
|---------|-------|---------|
| `recharts` | 1 | React chart components |
| `node-cron` | 2 | Server-side recurring bill scheduling |
| `react-calendar` | 2 | Calendar component (optional) |
| `jspdf` | 3 | PDF export |
| `html2canvas` | 3 | Capture dashboard for PDF |

---

## Out of Scope

- Multi-currency conversion
- Bank account integration
- Receipt line-item parsing
- Mobile native app (PWA consideration future)
