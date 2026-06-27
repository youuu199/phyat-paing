# Roadmap: Smart Bill Organizer — v1.0 Language Switching

## Overview

Add English/Burmese UI language switching across the entire Bill Organizer app. The journey starts with building the i18n infrastructure (translation files, React Context, hooks), then adding a language toggle UI, translating all user-facing components in two batches, and finally polishing with date formatting and remaining components.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: i18n Infrastructure** - Build the translation system (files, context, hooks, date helper)
- [ ] **Phase 2: Language Toggle & Integration** - Add language toggle UI and wire it into the app
- [ ] **Phase 3: Core Component Translation** - Translate auth, dashboard, bill management, and category components
- [ ] **Phase 4: Analytics, Settings & Polish** - Translate analytics, profile, export, and remaining components

## Phase Details

### Phase 1: i18n Infrastructure
**Goal**: Translation system is built and importable — developer can call `t('auth.welcomeBack')` and get the right string
**Depends on**: Nothing (first phase)
**Requirements**: I18N-01, I18N-02, I18N-03, I18N-04, I18N-05
**Success Criteria** (what must be TRUE):
  1. English translation file exists with ~120 keys covering all UI domains (auth, categories, dashboard, bills, settings)
  2. Burmese translation file exists with matching keys and correct Myanmar translations
  3. `LanguageProvider` component provides `t()` function that returns correct string for current language
  4. `useTranslation()` hook returns `{ t, lang, setLang }` and throws if used outside provider
  5. `formatDate()` helper produces locale-aware dates (en-US for English, my-MM for Burmese) with Arabic numerals
**Plans:** 1 plan

Plans:
- [ ] 01-01-PLAN.md — Create Burmese translations and i18n infrastructure (LanguageContext, useTranslation, formatDate)

### Phase 2: Language Toggle & Integration
**Goal**: User can toggle between English and Burmese from the UI, preference persists across sessions
**Depends on**: Phase 1
**Requirements**: I18N-06, I18N-07, I18N-08, I18N-22, I18N-24
**Success Criteria** (what must be TRUE):
  1. Language toggle button appears in app header (EN/MM pill button)
  2. Settings page has a Language section with dropdown selector
  3. `App.tsx` wraps children with `LanguageProvider` and renders `LanguageToggle` in header
  4. `CATEGORY_LABELS` map exists in `types.ts` with English and Burmese display names for all 6 categories
  5. `document.documentElement.lang` updates to `'en'` or `'my'` when language changes
**Plans**: TBD

Plans:
- [ ] 02-01: Create LanguageToggle, update SettingsPage and App.tsx

### Phase 3: Core Component Translation
**Goal**: Core user-facing pages display all text in the selected language
**Depends on**: Phase 2
**Requirements**: I18N-09, I18N-10, I18N-11, I18N-12, I18N-13, I18N-14, I18N-19
**Success Criteria** (what must be TRUE):
  1. Auth page shows login/register form labels, placeholders, and error messages in selected language
  2. Dashboard header, search placeholder, and total count display in selected language
  3. Bill cards show Paid/Unpaid, Edit, Delete, Overdue labels in selected language
  4. Upload component shows upload stages and drop zone text in selected language
  5. Category tabs, sidebar filters, and toast messages display in selected language
**Plans**: TBD

Plans:
- [ ] 03-01: Translate auth, dashboard, bill cards, uploader, categories, sidebar, and toast

### Phase 4: Analytics, Settings & Polish
**Goal**: Every user-facing text in the app is translated — full bilingual coverage
**Depends on**: Phase 3
**Requirements**: I18N-15, I18N-16, I18N-17, I18N-18, I18N-20, I18N-21, I18N-23
**Success Criteria** (what must be TRUE):
  1. Spending overview shows budget labels, category names, and alert text in selected language
  2. Upcoming bills shows "Due in X days" and category labels in selected language
  3. Export button labels, profile page fields, recurring badge tooltip, and error boundary UI all display in selected language
  4. All `toLocaleDateString('en-US')` calls replaced with `formatDate()` helper — dates show in correct locale
  5. Toggling language updates the entire app with no hardcoded English text remaining
**Plans**: TBD

Plans:
- [ ] 04-01: Translate analytics, upcoming bills, export, profile, badges, error boundary, and date formatting

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. i18n Infrastructure | 0/1 | Not started | - |
| 2. Language Toggle & Integration | 0/1 | Not started | - |
| 3. Core Component Translation | 0/1 | Not started | - |
| 4. Analytics, Settings & Polish | 0/1 | Not started | - |
