# 03-verdict.md — Verdict

**Total score: 16/30 — REDESIGN**

> The mobile header + hamburger + MobileNav surface scored 16/30 with a critical load-bearing gap in honesty (#6 scored 1) and excessive duplication violating "as little design as possible" (#10 scored 1), plus missing states (#8 scored 1) — a refine pass cannot fix structural duplication and copy honesty without touching architecture.

## Top 5 highest-leverage moves

1. **#10 As little design as possible** — Deduplicate navigation. The 4 nav items, ThemeToggle, and Logout are duplicated verbatim between desktop header and MobileNav drawer (01-evidence.md §1 repeated patterns). Use a shared nav config object rendered by both surfaces, eliminating 6 duplicated button instances.

2. **#6 Honest** — Remove the "automatically" claim from the subtitle (App.tsx:74) and meta description (index.html:6). Evidence: 01-evidence.md §3 flagged inflation. Replace with "Upload bills — we extract the details" which promises the action, not the outcome.

3. **#8 Thorough** — Add missing states. Hamburger button has no `:disabled` style (01-evidence.md §2). MobileNav drawer has no empty-state rendering, no loading indicator for the auto-focus, and no error boundary fallback. Add all three.

4. **#3 Aesthetic** — Fix contrast. `--color-text-muted` (#94a3b8 on #ffffff) yields ~3.3:1 — below WCAG AA 4.5:1 (01-evidence.md §2). Replace muted references in the header close/logout buttons with `--color-text-secondary` (#475569 ≈7:1) or bump the muted token itself.

5. **#4 Understandable** — Rename "Analytics" to "Insights" (01-evidence.md §3). Myanmar households managing utility bills see "Analytics" as technical; a plain label reduces the cognitive gap between expectation and what the page actually shows.
