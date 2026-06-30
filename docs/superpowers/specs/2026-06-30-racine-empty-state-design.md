# Racine EmptyState Integration

**Date:** 2026-06-30
**Status:** Approved

## Overview

Replace all inline empty/error/prompt states with `EmptyState` from `@sproutsocial/racine`. Build a local wrapper that exports pre-configured variants, so no consumer page imports from Racine directly.

## Racine EmptyState API

```ts
// From @sproutsocial/seeds-react-empty-state
interface EmptyStateProps {
  media?: React.ReactNode;           // SVG or emoji
  headline: React.ReactNode;         // required — main heading
  subtext?: React.ReactNode;         // optional description
  primaryAction?: React.ReactElement; // optional CTA button
  secondaryAction?: React.ReactElement; // optional secondary
}
```

`primaryAction` expects a `ReactElement` (not `() => void`). We pass `<button>` elements directly.

## Component: `EmptyState.tsx` (wrapper)

**New file:** `client/src/components/EmptyState.tsx`

Four named exports, each a thin wrapper. Renders `<RacineEmptyState>` with pre-configured props:

```ts
import { EmptyState as RacineEmptyState } from '@sproutsocial/racine';

// 1. Dashboard — no bills at all
export function NoBillsState({ onUpload }: { onUpload: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={{ fontSize: '3rem' }}>🧾</span>}
      headline="No bills yet"
      subtext="Upload your first bill to get started"
      primaryAction={<button onClick={onUpload}>🚀 Upload a Bill</button>}
    />
  );
}

// 2. Dashboard — search returns no matches
export function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={{ fontSize: '3rem' }}>🔍</span>}
      headline={`No bills matching "${query}"`}
      subtext="Try a different search term"
      primaryAction={<button onClick={onClear}>✕ Clear Search</button>}
    />
  );
}

// 3. Analytics — no bills to chart
export function NoAnalyticsState({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={{ fontSize: '3rem' }}>📊</span>}
      headline="No data to display"
      subtext="Upload some bills to see spending analytics"
      primaryAction={<button onClick={onGoToDashboard}>📋 Go to Dashboard</button>}
    />
  );
}

// 4. Error / backend-down
export function ErrorEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <RacineEmptyState
      media={<span style={{ fontSize: '3rem' }}>⚠️</span>}
      headline="Unable to load content"
      subtext="Please check your connection and try again"
      primaryAction={<button onClick={onRetry}>🔄 Try Again</button>}
    />
  );
}
```

No separate CSS file — Racine handles styling internally. Emojis as media (lightweight, no SVG imports).

## Integrations

### 1. BillDashboard — replace inline empty states

**File:** `client/src/components/BillDashboard.tsx`

**Current state (lines 273-286):**
- Conditional `!loading && !error && filteredBills.length === 0` renders inline `<div>` with 📭
- One block covers both "no bills at all" and "search no match", differentiated by `searchQuery`

**New state:**
- Split into two conditions:
  - `bills.length === 0 && !searchQuery` → `<NoBillsState onUpload={scrollToUpload} />`
  - `filteredBills.length === 0 && searchQuery` → `<NoSearchResults query={searchQuery} onClear={clearSearch} />`

**Change:** Remove `dashboard__empty` block, add the two conditional EmptyStates. Import `NoBillsState, NoSearchResults` from `./EmptyState`. Add `scrollToUpload` and `clearSearch` helpers.

### 2. InsightsPage — gate on bill count

**File:** `client/src/components/InsightsPage.tsx`

**Current state:** Always renders chart grid via three `ErrorBoundary` wrappers.

**New state:**
- Add a `billCount` fetch (GET `/api/bills?limit=1` to check existence, or a new lightweight endpoint)
- If `billCount === 0` → `<NoAnalyticsState onGoToDashboard={navigateToDashboard} />`
- If `billCount > 0` → existing chart grid
- Loading state while fetching count → skeleton

**Simplest approach** (no new endpoint): fetch `/api/bills?limit=1`, check if response has any bills. Wrap in `useEffect`.

```tsx
export default function InsightsPage() {
  const [hasBills, setHasBills] = useState<boolean | null>(null);
  const { apiFetch } = useAuth();

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/bills?limit=1')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) setHasBills(!!(d?.bills?.length || d?.length)); })
      .catch(() => { if (!cancelled) setHasBills(false); });
    return () => { cancelled = true; };
  }, [apiFetch]);

  if (hasBills === null) return <div className="skeleton" style={{ height: 400 }} />;
  if (!hasBills) {
    return <NoAnalyticsState onGoToDashboard={() => window.location.href = '/'} />;
  }

  return (
    <div className="insights-page">
      {/* existing grid */}
    </div>
  );
}
```

### 3. BillUploader — add idle prompt state

**File:** `client/src/components/BillUploader.tsx`

**Current state:** Always renders upload area with "Upload & Process" button. No prompt state.

**Change:** The uploader UI already *is* a prompt — a labeled drop zone with instructions. We keep it as-is. No EmptyState needed here. The upload area is always interactive.

### 4. ErrorBoundary — use Racine EmptyState for default fallback

**File:** `client/src/components/ErrorBoundary.tsx`

**Current state:** Inline error UI with 💥, "Something went wrong", "Try Again", "Refresh Page", and error details.

**Change:** Replace the inline UI with `ErrorEmptyState`. Keep the "Refresh Page" as a secondary action. Keep the error details `<details>` block.

```tsx
// In render(), replace the default error UI:
return (
  <div className="error-boundary" role="alert">
    <ErrorEmptyState onRetry={this.handleReset} />
    {this.state.error && (
      <details className="error-boundary__details">
        <summary>Error details</summary>
        <pre className="error-boundary__stack">
          {this.state.error.message}
          {'\n\n'}
          {this.state.error.stack}
        </pre>
      </details>
    )}
  </div>
);
```

Keep the `fallback` prop override for custom uses (e.g., the chart wrappers in InsightsPage).

## Files Changed Summary

| File | Action | Lines |
|------|--------|-------|
| `client/src/components/EmptyState.tsx` | **Create** | ~60 |
| `client/src/components/BillDashboard.tsx` | Modify — replace empty state | lines 273-286 |
| `client/src/components/InsightsPage.tsx` | Modify — add bill count gate | ~25 added |
| `client/src/components/ErrorBoundary.tsx` | Modify — use ErrorEmptyState | lines 49-84 |
| `client/package.json` | Add `@sproutsocial/racine` | 1 line |

## What We DON'T Do

- No change to `BillUploader` — existing upload area is already a prompt
- No change to `Sidebar` empty state — sidebar-specific inline text is fine
- No new API endpoint — InsightsPage uses existing `/api/bills?limit=1`
- No separate CSS — Racine handles styling; snippets added inline for media sizing only
