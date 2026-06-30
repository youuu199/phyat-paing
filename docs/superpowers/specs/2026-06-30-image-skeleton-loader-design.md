# Image Skeleton Loader — BillCard

**Date:** 2026-06-30
**Status:** Approved

## Overview

Add a shimmer skeleton placeholder to `BillCard` that displays while the Cloudinary bill image is loading. Once loaded, the skeleton fades out and the image fades in with a 200ms opacity transition. On image load failure, the existing 🧾 fallback is shown (no skeleton).

## User-Facing Behavior

- Each bill card shows a shimmer placeholder in the image area on mount
- When the image finishes loading, skeleton fades out → image fades in
- If the image fails to load, skeleton hides → 🧾 emoji fallback appears
- No layout shift — skeleton has same height (200px) as the real image

## State Machine

```
card mounts → [imgLoaded=false, imgError=false] → shows skeleton
                       │
              ┌────────┼────────┐
              ▼                 ▼
       image onLoad       image onError
              │                 │
              ▼                 ▼
    [imgLoaded=true,    [imgError=true,
     imgError=false]     imgLoaded=true] ← also hides skeleton
              │                 │
              ▼                 ▼
         real image       🧾 fallback
```

## Implementation

### File: `client/src/components/BillCard.tsx`

1. Add `imgLoaded` state:

```tsx
const [imgLoaded, setImgLoaded] = useState(false);
```

2. Replace the image area in the JSX (lines 68-91) with 3 conditional blocks:

```tsx
<div className="bill-card__image-wrap">
  {/* Loading: shimmer placeholder */}
  {!imgLoaded && !imgError && (
    <div className="skeleton bill-card__image-skeleton" aria-label="Loading image" />
  )}

  {/* Image (renders for preload, hidden via opacity until onLoad) */}
  <img
    className={`bill-card__image${imgLoaded ? ' bill-card__image--visible' : ''}`}
    src={bill.imageUrl}
    alt={`Scanned image of ${bill.title}`}
    loading="lazy"
    onLoad={() => setImgLoaded(true)}
    onError={() => {
      setImgError(true);
      setImgLoaded(true);
    }}
    onClick={() => setViewing(true)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setViewing(true);
      }
    }}
    tabIndex={0}
    role="button"
    title="Click to view full image"
    style={{ opacity: imgLoaded && !imgError ? 1 : 0, transition: 'opacity 200ms ease-in' }}
  />

  {/* Error: existing fallback */}
  {imgError && (
    <div className="bill-card__image-fallback" aria-hidden="true">
      🧾
    </div>
  )}
</div>
```

### File: `client/src/App.css`

Add one CSS rule after `.skeleton-card__image`:

```css
.bill-card__image-skeleton {
  width: 100%;
  height: 200px;
}
```

Reuses the existing `.skeleton` shimmer animation (already defined at lines 986-1001).

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Browser-cached image | `onLoad` fires immediately on mount — skeleton appears for ≤1 frame |
| Image fails to load | `onError` sets `imgError=true` + `imgLoaded=true` → hide skeleton, show 🧾 |
| Very slow connection | Skeleton shimmers indefinitely until image loads |
| Image viewer modal | Unaffected — only triggers when `imgLoaded` is true (same as before) |

## What We DON'T Need

- No `useEffect` — `onLoad`/`onError` callbacks are sufficient
- No new keyframes — reuses existing `.skeleton` shimmer
- No layout shift handling — skeleton matches real image height (200px)
- No changes to `BillDashboard` — its loading skeleton is separate and already works
