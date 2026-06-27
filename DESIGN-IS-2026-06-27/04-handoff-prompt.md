# 04-handoff-prompt.md — `/make-plan` Handoff

Copy the fenced block below into a `/make-plan` call:

---

````
/make-plan Redesign the mobile header + hamburger + MobileNav drawer for Phyat Paing. Current design failed audit at 16/30 with critical gaps in principles #6 honest, #10 as little design as possible, and #8 thorough.

Verdict paragraph (quoted from 03-verdict.md):
> The mobile header + hamburger + MobileNav surface scored 16/30 with a critical load-bearing gap in honesty (#6 scored 1) and excessive duplication violating "as little design as possible" (#10 scored 1), plus missing states (#8 scored 1) — a refine pass cannot fix structural duplication and copy honesty without touching architecture.

Why redesign and not refine: Load-bearing principle #6 (honest) scored 1 due to an inflated "automatically" claim on multiple surfaces, and #10 (as little design as possible) scored 1 due to 6 duplicated interactive elements across desktop header and MobileNav — these require structural change, not cosmetic fixes.

Preserve from current design:
- Brand name "Phyat Paing (ဖြတ်ပိုင်း)" — App.tsx:72 (the Burmese script must appear identically in MobileNav)
- CSS design token system (11 spacing steps, 8 type steps, 14+ color tokens with dark mode) — index.css:1-274
- Dark mode support via [data-theme="dark"] + ThemeToggle — index.css:109, ThemeToggle.tsx
- prefers-reduced-motion blanket reduction — index.css:225-237
- CSS line-based hamburger-to-X animation concept (no framework dependency, clean) — App.css:2557-2577
- Slide-out drawer pattern (durable, no library) — App.css:2605-2641

Discard:
- Nav item duplication pattern — App.tsx:78-108 and MobileNav.tsx:79-103 copy the same 4 buttons verbatim. Caused failure on principle #10.
- "automatically" copy claim in subtitle and meta — App.tsx:74 and index.html:6. Caused failure on principle #6.
- Low-contrast muted text on close/logout buttons — App.css:2677 and App.css:78 use --color-text-muted (~3.3:1). Caused failure on principle #3.

Top 5 moves from the audit (verbatim):
1. #10 As little design as possible — Deduplicate navigation. The 4 nav items, ThemeToggle, and Logout are duplicated verbatim between desktop header and MobileNav drawer (01-evidence.md §1 repeated patterns). Use a shared nav config object rendered by both surfaces, eliminating 6 duplicated button instances.
2. #6 Honest — Remove the "automatically" claim from the subtitle (App.tsx:74) and meta description (index.html:6). Evidence: 01-evidence.md §3 flagged inflation. Replace with "Upload bills — we extract the details" which promises the action, not the outcome.
3. #8 Thorough — Add missing states. Hamburger button has no :disabled style (01-evidence.md §2). MobileNav drawer has no empty-state rendering, no loading indicator for the auto-focus, and no error boundary fallback. Add all three.
4. #3 Aesthetic — Fix contrast. --color-text-muted (#94a3b8 on #ffffff) yields ~3.3:1 — below WCAG AA 4.5:1 (01-evidence.md §2). Replace muted references in the header close/logout buttons with --color-text-secondary (#475569 ≈7:1) or bump the muted token itself.
5. #4 Understandable — Rename "Analytics" to "Insights" (01-evidence.md §3). Myanmar households managing utility bills see "Analytics" as technical; a plain label reduces the cognitive gap between expectation and what the page actually shows.

Redesign principles in priority order:
1. #6 Honest — Every user-facing string must describe actual behavior; no marketing inflation
2. #10 As little design as possible — No duplicate button/logic between desktop and mobile surfaces; shared nav config
3. #8 Thorough — Every interactive element handles all 6 states (empty/loading/error/success/focus/disabled) where applicable

Deliverables for the plan:
- New information architecture (shared nav config, single render path for nav items)
- New primary flow (low-fi, labeled, compared side-by-side to current duplication)
- States checklist (empty, loading, error, success, focus, disabled) per component
- Migration path for users currently on the old design (none needed — this is a refactor, not a feature flag)
- Cutover criteria (all 5 moves above verified, regression check on dark mode and reduced-motion)

Anti-patterns to guard against (specific to REDESIGN):
- Porting old structure under new styling — must restructure nav data flow, not just restyle
- Keeping both designs behind a flag indefinitely — this is a direct replacement, not an A/B test
- Redesigning to follow a trend rather than the principles above — the goal is deduplication + honesty, not a new visual framework
- Treating the Preserve list as optional — the token system, dark mode, prefers-reduced-motion, and hamburger animation concept must survive unchanged
````
