---
phase: 01-i18n-infrastructure
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - client/src/i18n/my.json
  - client/src/i18n/LanguageContext.tsx
  - client/src/i18n/useTranslation.ts
  - client/src/i18n/formatDate.ts
autonomous: true
requirements:
  - I18N-01
  - I18N-02
  - I18N-03
  - I18N-04
  - I18N-05
must_haves:
  truths:
    - "import enJson from './en.json' and import myJson from './my.json' both resolve without errors"
    - "LanguageProvider wraps children and exposes lang, setLang, t via context"
    - "useTranslation() returns { t, lang, setLang } and throws if used outside provider"
    - "t('auth.welcomeBack') returns 'Welcome Back' when lang='en' and 'ပြန်ကြိုဆိုပါတယ်' when lang='my'"
    - "formatDate('2026-01-15', 'en') returns a string containing 'January' and '15'"
    - "formatDate('2026-01-15', 'my') returns a string using my-MM locale"
    - "my.json has the exact same key set as en.json (no missing, no extra)"
  artifacts:
    - client/src/i18n/my.json
    - client/src/i18n/LanguageContext.tsx
    - client/src/i18n/useTranslation.ts
    - client/src/i18n/formatDate.ts
  key_links:
    - "LanguageContext.tsx imports from en.json and my.json"
    - "useTranslation.ts imports LangContext from LanguageContext.tsx"
    - "formatDate.ts is a standalone helper with no internal imports"
---

<objective>
Build the i18n infrastructure: Burmese translation file matching English keys, React Context provider with t() function, convenience hook, and locale-aware date formatter.

Purpose: All subsequent phases (LanguageToggle, component translation) depend on this infrastructure existing and working correctly.
Output: 4 files in `client/src/i18n/` — my.json, LanguageContext.tsx, useTranslation.ts, formatDate.ts
</objective>

<execution_context>
@.opencode/gsd-core/workflows/execute-plan.md
@.opencode/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@client/src/i18n/en.json
@client/src/types.ts
@docs/superpowers/specs/2026-06-27-i18n-burmese-design.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Burmese translation file and verify English keys</name>
  <files>client/src/i18n/my.json</files>

  <read_first>
    - client/src/i18n/en.json (source of truth for key structure — 155 keys across 17 domains)
    - docs/superpowers/specs/2026-06-27-i18n-burmese-design.md (Burmese translation examples in the "Burmese Translations" section)
  </read_first>

  <action>
Create `client/src/i18n/my.json` with Burmese translations for every key in `en.json`.

Requirements:
- Every key in en.json must have a corresponding key in my.json — zero missing keys, zero extra keys
- Use the exact key strings (no modification)
- Burmese translations must be linguistically accurate Myanmar text
- Keep `{{var}}` interpolation placeholders exactly as they appear in English (e.g. `{{count}}`, `{{days}}`, `{{category}}`)
- Use the examples from the design spec as reference: "auth.welcomeBack" → "ပြန်ကြိုဆိုပါတယ်", "categories.Electricity" → "လျှပ်စစ်", etc.
- The file must be valid JSON with the same structure as en.json (flat object, no nesting)

Domain coverage (all 17 domains from en.json):
- app.* (5 keys): app title, tagline, skip link, loading, brand
- nav.* (5 keys): navigation labels
- auth.* (16 keys): login/register form labels, placeholders, error messages
- bills.* (22 keys): bill management labels, status, actions, messages
- uploader.* (10 keys): upload component text
- categories.* (7 keys): category display names
- settings.* (10 keys): settings page labels
- sidebar.* (4 keys): date filter labels
- profile.* (12 keys): profile page labels and validation messages
- spending.* (6 keys): spending overview labels
- upcoming.* (4 keys): upcoming bills labels
- trend.* (2 keys): monthly trend chart labels
- export.* (7 keys): export button labels and messages
- modal.* (12 keys): bill edit modal labels
- recurring.* (3 keys): recurring interval labels
- error.* (5 keys): error boundary UI text
- hamburger.* (2 keys): mobile nav accessibility labels
  </action>

  <verify>
    <automated>node -e "const e=require('./client/src/i18n/en.json');const m=require('./client/src/i18n/my.json');const ek=Object.keys(e).sort();const mk=Object.keys(m).sort();const missing=ek.filter(k=>!m[k]);const extra=mk.filter(k=>!e[k]);if(missing.length)console.error('MISSING:',missing);if(extra.length)console.error('EXTRA:',extra);if(missing.length||extra.length)process.exit(1);console.log('OK:',ek.length,'keys match');"</automated>
  </verify>

  <acceptance_criteria>
    - `node -e "require('./client/src/i18n/my.json')"` exits 0 (valid JSON)
    - `Object.keys(require('./client/src/i18n/my.json')).length` equals `Object.keys(require('./client/src/i18n/en.json')).length` (same key count)
    - Every key in en.json exists in my.json (zero missing)
    - No keys exist in my.json that don't exist in en.json (zero extra)
    - `require('./client/src/i18n/my.json')['auth.welcomeBack']` equals "ပြန်ကြိုဆိုပါတယ်"
    - `require('./client/src/i18n/my.json')['categories.Electricity']` equals "လျှပ်စစ်"
    - `require('./client/src/i18n/my.json')['bills.count']` contains "{{count}}"
    - No Myanmar digits (U+1040–U+1049) appear in amount-related values — amounts stay Arabic numerals
  </acceptance_criteria>

  <done>
    my.json exists with 155 keys matching en.json exactly, valid JSON, linguistically accurate Burmese translations, interpolation placeholders preserved.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create i18n infrastructure — LanguageContext, useTranslation hook, formatDate helper</name>
  <files>
    client/src/i18n/LanguageContext.tsx,
    client/src/i18n/useTranslation.ts,
    client/src/i18n/formatDate.ts
  </files>

  <read_first>
    - client/src/i18n/en.json (imported by LanguageContext)
    - client/src/i18n/my.json (imported by LanguageContext — will exist after Task 1)
    - docs/superpowers/specs/2026-06-27-i18n-burmese-design.md (architecture: LanguageContext code, formatDate code, variable interpolation)
    - client/tsconfig.app.json (moduleResolution: bundler, verbatimModuleSyntax: true)
  </read_first>

  <action>
Create three files in `client/src/i18n/`:

**File 1: `client/src/i18n/LanguageContext.tsx`**

Create a React Context provider with the following design:
- Define type `Lang = 'en' | 'my'`
- Define interface `LangContextValue { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string }`
- Import en.json and my.json as default imports (bundler mode supports this)
- Store translations in `Record<Lang, Record<string, string>>` lookup
- Create context with `createContext<LangContextValue | null>(null)`
- `LanguageProvider` component:
  - Initialize `lang` state from `localStorage.getItem('bill-organizer-lang')`, defaulting to `'en'`
  - `setLang` function: updates state, persists to localStorage, sets `document.documentElement.lang`
  - `useEffect` to set `document.documentElement.lang` on mount and when lang changes
  - `t(key, vars?)` function: looks up `translations[lang][key]`, falls back to `translations.en[key]`, falls back to raw key; supports `{{var}}` interpolation via `vars` parameter
- Export `LanguageProvider` and `useTranslation` (re-export from the separate file for convenience)
- Note: `verbatimModuleSyntax: true` means use `import type` for type-only imports

**File 2: `client/src/i18n/useTranslation.ts`**

Create a convenience hook:
- Import `useContext` from React
- Import `LangContext` from `./LanguageContext` (the context object, not the provider)
- Export `useTranslation()` function that:
  - Calls `useContext(LangContext)`
  - Throws `new Error('useTranslation must be inside LanguageProvider')` if context is null
  - Returns the context value: `{ lang, setLang, t }`
- This is a thin wrapper — the actual logic lives in LanguageContext.tsx

**File 3: `client/src/i18n/formatDate.ts`**

Create a standalone date formatting helper:
- Export `formatDate(date: Date | string, lang: 'en' | 'my', style?: 'short' | 'full'): string`
- Convert string input to Date object
- Map lang to locale: `'en'` → `'en-US'`, `'my'` → `'my-MM'`
- If `style === 'short'`: use `{ month: 'short', day: 'numeric' }`
- If `style === 'full'` (default): use `{ year: 'numeric', month: 'long', day: 'numeric' }`
- Use `toLocaleDateString(locale, options)` — no `numberingSystem` option (the design spec mentions it but it's not widely supported; default behavior is fine)
- No external dependencies — pure function

  </action>

  <verify>
    <automated>cd /home/vim/videcode/pyat-paing/client && npx tsc --noEmit --pretty 2>&1 | head -50</automated>
  </verify>

  <acceptance_criteria>
    - `npx tsc --noEmit` exits 0 (no TypeScript errors in the three new files)
    - `client/src/i18n/LanguageContext.tsx` exports `LanguageProvider` (named export)
    - `client/src/i18n/LanguageContext.tsx` exports `LangContext` (named export — the raw context for useTranslation)
    - `client/src/i18n/LanguageContext.tsx` defines `Lang` type as `'en' | 'my'`
    - `client/src/i18n/useTranslation.ts` exports `useTranslation` (named export)
    - `client/src/i18n/useTranslation.ts` imports `LangContext` from `./LanguageContext`
    - `client/src/i18n/useTranslation.ts` throws error if context is null
    - `client/src/i18n/formatDate.ts` exports `formatDate` (named export)
    - `client/src/i18n/formatDate.ts` accepts `Date | string` as first parameter
    - `client/src/i18n/formatDate.ts` accepts `'en' | 'my'` as second parameter
    - `client/src/i18n/formatDate.ts` accepts optional `'short' | 'full'` as third parameter
    - `LanguageContext.tsx` reads from localStorage key `'bill-organizer-lang'`
    - `LanguageContext.tsx` sets `document.documentElement.lang` via useEffect
    - `t()` function falls back to English key, then raw key string
    - `t()` supports `{{var}}` interpolation via vars parameter
  </acceptance_criteria>

  <done>
    Three infrastructure files exist and compile cleanly: LanguageContext.tsx provides provider with t() and localStorage persistence, useTranslation.ts wraps context as convenience hook, formatDate.ts produces locale-aware date strings. All files have no TypeScript errors.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| localStorage → LanguageContext | User-controlled storage; must handle missing/corrupt values gracefully |
| Translation key lookup | Missing keys should fall back to English, not crash |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-01-01 | Tampering | localStorage | low | accept | Language preference only affects UI display; corrupted value falls back to 'en' |
| T-01-02 | Information Disclosure | Translation keys | low | accept | Translation files contain only UI strings, no sensitive data |
| T-01-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package installs in this phase — all files are hand-written TypeScript and JSON |
</threat_model>

<verification>
Phase 1 verification — all must pass:

1. `node -e "require('./client/src/i18n/my.json')"` exits 0 (valid JSON)
2. `Object.keys(require('./client/src/i18n/en.json')).length === Object.keys(require('./client/src/i18n/my.json')).length` (key count match)
3. `cd client && npx tsc --noEmit` exits 0 (TypeScript compiles)
4. `node -e "const m=require('./client/src/i18n/my.json');console.log(m['auth.welcomeBack'])"` outputs Burmese text
5. All 5 requirement IDs (I18N-01 through I18N-05) have corresponding files/exports
</verification>

<success_criteria>
- `client/src/i18n/my.json` exists with 155 keys matching en.json exactly
- `client/src/i18n/LanguageContext.tsx` exports LanguageProvider with t(), localStorage persistence, and document.documentElement.lang sync
- `client/src/i18n/useTranslation.ts` exports useTranslation hook returning { t, lang, setLang }
- `client/src/i18n/formatDate.ts` exports formatDate producing locale-aware date strings
- `npx tsc --noEmit` passes with zero errors
- No new npm packages installed
</success_criteria>

<output>
Create `.planning/phases/01-i18n-infrastructure/01-01-SUMMARY.md` when done
</output>
