# Tasks: WHOOP Data Explorer

**Input**: Design documents from `/specs/001-whoop-data-explorer/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-proxy.md

**Tests**: TDD is NON-NEGOTIABLE per constitution. Test tasks are included for all user stories. Tests MUST be written and verified failing before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Project initialization, tooling, and configuration

- [x] T001 Initialize Vite + React + TypeScript project with `npm create vite@latest . -- --template react-ts` and configure TypeScript strict mode in tsconfig.json
- [x] T002 Initialize ShadCN/ui with `npx shadcn@latest init`, configure Tailwind v4, and add path aliases (`@/*`) in tsconfig.json and vite.config.ts
- [x] T003 [P] Install core dependencies: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `@tanstack/react-query-persist-client`, `@tanstack/react-table`, `react-router-dom`, `idb-keyval`, `@tanstack/query-async-storage-persister`
- [x] T004 [P] Configure Vitest in vite.config.ts with jsdom environment and add test script to package.json
- [x] T005 [P] Create vercel.json at project root with SPA rewrites (exclude `/api/*`) and install `@vercel/node` as devDependency
- [x] T006 [P] Create .env.local.example with `WHOOP_CLIENT_ID`, `WHOOP_CLIENT_SECRET`, `REDIRECT_URI`, `VITE_APP_URL` placeholders and add .env.local to .gitignore
- [x] T007 [P] Add ShadCN components: `npx shadcn@latest add button table tabs card badge select skeleton`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, utilities, and infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Define all TypeScript types (SleepRecord, Cycle, Recovery, Workout, UserSession, ScoreState, WhoopApiResponse) in src/lib/types.ts per data-model.md field definitions
- [x] T009 [P] Write unit tests for formatters (ms→duration, kJ→kcal, percentage, date formatting) in tests/unit/formatters.test.ts, then implement formatters in src/lib/formatters.ts (TDD)
- [x] T010 [P] Configure TanStack Query client with `experimental_createQueryPersister` backed by idb-keyval IndexedDB storage in src/lib/query-config.ts — set `staleTime: Infinity` for past weeks, `staleTime: 5min` for current week, `gcTime: 24h`
- [x] T011 Set up React Router v7 in SPA mode with route structure (/, /sleep, /cycles, /recovery, /workouts) in src/App.tsx — wrap with QueryClientProvider from query-config.ts
- [x] T012 [P] Create app shell layout component with header and content area in src/components/layout/app-shell.tsx

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Connect WHOOP Account (Priority: P1) MVP

**Goal**: User authenticates via WHOOP OAuth2 and the app fetches their last 7 days of data from all four collections progressively.

**Independent Test**: Complete OAuth flow and verify data from Sleep, Cycles, Recovery, and Workouts is loaded and visible.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Write unit tests for auth token storage, retrieval, expiry check, and clear-all-on-disconnect in tests/unit/auth.test.ts
- [x] T014 [P] [US1] Write unit tests for WHOOP API response-to-type mapping (snake_case→camelCase, null score handling for PENDING_SCORE/UNSCORABLE) in tests/unit/types.test.ts

### Implementation for User Story 1

- [x] T015 [US1] Implement OAuth token exchange serverless function in api/auth/callback.ts — accept POST `{ code }`, call WHOOP token endpoint with client_secret_post method, return `{ access_token, refresh_token, expires_in }` per contracts/api-proxy.md
- [x] T016 [P] [US1] Implement token refresh serverless function in api/auth/refresh.ts — accept POST `{ refresh_token }`, return rotated tokens per contracts/api-proxy.md
- [x] T017 [P] [US1] Implement catch-all WHOOP API proxy in api/whoop/[...path].ts — forward GET requests to `https://api.prod.whoop.com/developer/v2/{path}` with Authorization header, pass through query params and response, add CORS headers, no logging
- [x] T018 [US1] Implement auth token management in src/lib/auth.ts — store/retrieve tokens from localStorage, check expiry, auto-refresh before expiry, clear all local data on disconnect (localStorage + IndexedDB via idb-keyval `clear()`) per FR-016
- [x] T019 [US1] Implement WHOOP API client in src/lib/whoop-api.ts — functions to fetch each collection with date range params, handle cursor pagination (next_token→nextToken), map snake_case API responses to camelCase TypeScript types from src/lib/types.ts
- [x] T020 [US1] Implement useAuth hook in src/hooks/use-auth.ts — React context provider with login (redirect to WHOOP auth URL), handleCallback (exchange code for tokens), logout (clear all data), isAuthenticated, isLoading, user profile state
- [x] T021 [US1] Implement useWhoopData hook in src/hooks/use-whoop-data.ts — use `useQueries` with weekly time buckets per collection, progressive fetch (data appears as each bucket resolves), support date range switching (7/30/90 days), use `placeholderData: keepPreviousData` for smooth expansion
- [x] T022 [US1] Implement auth guard component in src/components/layout/auth-guard.tsx — redirect unauthenticated users to landing, show loading spinner during auth check, render children when authenticated
- [x] T023 [US1] Implement landing page in src/pages/landing.tsx — "Connect WHOOP" button, brief app description, privacy statement ("Your data never leaves your browser"), handle OAuth denied state with retry
- [x] T024 [US1] Wire up OAuth redirect flow in src/App.tsx — handle /callback route (extract code from URL, call handleCallback, redirect to /sleep on success), integrate auth guard on protected routes
- [x] T025 [US1] Implement disconnect button in app shell with full local data clearing — call auth.clearAll() which removes localStorage tokens AND IndexedDB cached data, redirect to landing page

**Checkpoint**: User can connect WHOOP account, see data loading confirmation, and disconnect. US1 is fully functional and testable independently.

---

## Phase 4: User Story 2 — Explore Data Summaries (Priority: P2)

**Goal**: User navigates between Sleep, Cycles, Recovery, and Workouts tabs. Each view shows a sortable data table with aggregate summary statistics above it.

**Independent Test**: Load sample data fixtures and verify each collection displays correct columns, sorting works, summary stats calculate correctly, and tab navigation switches views instantly.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T026 [P] [US2] Write integration test for sleep table rendering (correct columns, sort by date, summary stats) in tests/integration/sleep-table.test.tsx
- [x] T027 [P] [US2] Write integration test for cycles table rendering in tests/integration/cycles-table.test.tsx
- [x] T028 [P] [US2] Write integration test for recovery table rendering in tests/integration/recovery-table.test.tsx
- [x] T029 [P] [US2] Write integration test for workouts table rendering in tests/integration/workouts-table.test.tsx
- [x] T030 [P] [US2] Write integration test for date range selector switching (7→30→90 days, data retained on switch) in tests/integration/date-range.test.tsx

### Implementation for User Story 2

- [x] T031 [US2] Implement reusable DataTable component using TanStack Table v8 + ShadCN Table in src/components/data-table.tsx — sortable columns, most-recent-first default sort, loading skeleton state, empty state message
- [x] T032 [US2] Implement SummaryStats component in src/components/summary-stats.tsx — accepts array of `{ label, value, unit }` items, renders as a row of Card components, handles null/loading states
- [x] T033 [US2] Implement DateRangeSelector component in src/components/date-range-selector.tsx — three options (7 days, 30 days, 90 days) using ShadCN Select or segmented control, default to 7 days, emit selected range
- [x] T034 [US2] Implement nav tabs for collection switching using ShadCN Tabs in src/components/layout/nav-tabs.tsx — Sleep, Cycles, Recovery, Workouts tabs, integrate with React Router navigation
- [x] T035 [P] [US2] Define sleep table column definitions (Date, Duration, Efficiency, Performance, Deep, REM, Light, Awake, Disturbances, Resp. Rate) in src/components/tables/sleep-columns.tsx per data-model.md
- [x] T036 [P] [US2] Define cycles table column definitions (Date, Strain, Calories, Avg HR, Max HR) in src/components/tables/cycles-columns.tsx per data-model.md
- [x] T037 [P] [US2] Define recovery table column definitions (Date, Recovery, HRV, Resting HR, SpO2, Skin Temp) in src/components/tables/recovery-columns.tsx per data-model.md
- [x] T038 [P] [US2] Define workouts table column definitions (Date, Activity, Duration, Strain, Avg HR, Max HR, Calories, Distance) in src/components/tables/workouts-columns.tsx per data-model.md
- [x] T039 [P] [US2] Implement Sleep page — DateRangeSelector + SummaryStats (avg duration, efficiency, performance) + DataTable with sleep-columns, wire to useWhoopData('sleep') in src/pages/sleep.tsx
- [x] T040 [P] [US2] Implement Cycles page — SummaryStats (avg strain, avg calories, avg HR) + DataTable with cycles-columns in src/pages/cycles.tsx
- [x] T041 [P] [US2] Implement Recovery page — SummaryStats (avg recovery, avg HRV, avg resting HR) + DataTable with recovery-columns in src/pages/recovery.tsx
- [x] T042 [P] [US2] Implement Workouts page — SummaryStats (total workouts, avg strain, total calories) + DataTable with workouts-columns in src/pages/workouts.tsx
- [x] T043 [US2] Add empty state ("No data for this period"), loading skeleton, and error state with retry button to all four collection pages
- [x] T044 [US2] Integrate DateRangeSelector as shared control in app shell so range applies to all collection views simultaneously

**Checkpoint**: All four collection views display correctly with sortable tables, summary stats, and date range switching. US2 is fully functional and testable independently.

---

## Phase 5: User Story 3 — Download Data as Excel (Priority: P3)

**Goal**: User downloads their WHOOP data as an Excel file (.xlsx) with one sheet per collection.

**Independent Test**: Click export, open the generated file in a spreadsheet app, verify 4 sheets with correct column headers and data matching what's displayed in the tables.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T045 [P] [US3] Write integration test for Excel export — verify file generation with 4 sheets, correct headers per collection, data matches loaded records, single-collection export option in tests/integration/excel-export.test.tsx

### Implementation for User Story 3

- [x] T046 [US3] Implement useExcelExport hook in src/hooks/use-excel-export.ts — lazy-load SheetJS (`await import('xlsx')`), generate multi-sheet workbook from current data, support all-collections and single-collection modes, trigger browser download
- [x] T047 [US3] Add export button to app shell header (ShadCN Button) with dropdown: "Download All" and "Download [Current Collection]" options
- [x] T048 [US3] Add export progress indicator (ShadCN Skeleton or spinner) shown during file generation, disable button while generating

**Checkpoint**: Users can download their data as a properly formatted Excel file. US3 is fully functional and testable independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T049 [P] Responsive layout testing and fixes for mobile (375px+) — verify all tables scroll horizontally, nav tabs are accessible, buttons are tap-friendly
- [x] T050 [P] Verify WCAG 2.1 AA accessibility — keyboard navigation on tabs/tables, ARIA labels on interactive elements, focus management on route changes, color contrast
- [x] T051 [P] Add token auto-refresh before expiry — schedule refresh ~5 minutes before access_token expires using setTimeout in useAuth, handle refresh failure gracefully
- [x] T052 Run quickstart.md validation flow end-to-end — connect account, view all 4 collections, switch date ranges, export Excel, disconnect and verify data cleared

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — provides auth + data fetching for all other stories
- **US2 (Phase 4)**: Depends on US1 (needs auth context and useWhoopData hook)
- **US3 (Phase 5)**: Depends on US2 (needs loaded data to export; can start after US1 if export uses raw data)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **US2 (P2)**: Depends on US1 auth context and data hooks — BUT table/column components can be built in parallel with US1 using fixture data
- **US3 (P3)**: Depends on data being available (US1 at minimum) — Export hook can be built against fixtures in parallel

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Serverless functions before client-side auth (US1)
- Auth management before API client (US1)
- API client before data hooks (US1)
- Reusable components before page-level composition (US2)
- Column definitions before page assembly (US2)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T007)
- Foundational: T009, T010, T012 can run in parallel after T008
- US1 Tests: T013, T014 in parallel
- US1 Serverless: T016, T017 in parallel (after T015)
- US2 Tests: T026-T030 all in parallel
- US2 Column definitions: T035-T038 all in parallel
- US2 Pages: T039-T042 all in parallel (after T031-T034)
- Polish: T049, T050, T051 all in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all tests for US2 together:
Task: T026 "Integration test for sleep table" (tests/integration/sleep-table.test.tsx)
Task: T027 "Integration test for cycles table" (tests/integration/cycles-table.test.tsx)
Task: T028 "Integration test for recovery table" (tests/integration/recovery-table.test.tsx)
Task: T029 "Integration test for workouts table" (tests/integration/workouts-table.test.tsx)
Task: T030 "Integration test for date range" (tests/integration/date-range.test.tsx)

# Launch all column definitions together (after DataTable component):
Task: T035 "Sleep columns" (src/components/tables/sleep-columns.tsx)
Task: T036 "Cycles columns" (src/components/tables/cycles-columns.tsx)
Task: T037 "Recovery columns" (src/components/tables/recovery-columns.tsx)
Task: T038 "Workouts columns" (src/components/tables/workouts-columns.tsx)

# Launch all pages together (after columns):
Task: T039 "Sleep page" (src/pages/sleep.tsx)
Task: T040 "Cycles page" (src/pages/cycles.tsx)
Task: T041 "Recovery page" (src/pages/recovery.tsx)
Task: T042 "Workouts page" (src/pages/workouts.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — Connect WHOOP Account
4. **STOP and VALIDATE**: Authenticate, verify data loads from all 4 collections
5. Deploy to Vercel for smoke test

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 → Connect + fetch data → Deploy (MVP!)
3. Add US2 → Explore with tables + summary stats → Deploy
4. Add US3 → Excel download → Deploy
5. Polish → Responsive, a11y, auto-refresh → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Constitution TDD principle: verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All serverless functions in api/ use @vercel/node types
- SheetJS is lazy-loaded — only included in bundle on export action
