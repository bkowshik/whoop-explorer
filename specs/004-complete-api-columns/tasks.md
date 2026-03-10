# Tasks: Complete API Columns in Data Tables

**Input**: Design documents from `/specs/004-complete-api-columns/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Included per constitution Principle II (TDD is NON-NEGOTIABLE).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Install new dependencies required by this feature

- [x] T001 Install @dnd-kit/core and @dnd-kit/sortable dependencies via `npm install @dnd-kit/core @dnd-kit/sortable`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared formatters, type updates, and persistence infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

- [x] T002 [P] Write failing tests for `formatDateTime` formatter (date+time output like "Mar 10, 10:30 PM") and `formatBoolean` formatter (true→"Yes", false→"No", null→"—") in tests/unit/formatters.test.ts
- [x] T003 [P] Write failing tests for column preference persistence: `saveColumnPreferences`, `loadColumnPreferences`, migration handling (unknown columns ignored, new columns get defaults) in tests/unit/column-preferences.test.ts
- [x] T004 [P] Write failing tests for updated API response mappers: verify `mapSleepResponse` maps `created_at`, `updated_at`, `sleep_consistency_percentage`, `total_no_data_time_milli`, and all 4 `sleep_needed` sub-fields; verify `mapCycleResponse` maps `created_at`, `updated_at`; verify `mapRecoveryResponse` maps `created_at`, `updated_at`, `user_calibrating`; verify `mapWorkoutResponse` maps `created_at`, `updated_at`, `percent_recorded`, `altitude_gain_meter`, `altitude_change_meter`, and all 6 `zone_durations` sub-fields in tests/unit/whoop-api.test.ts

### Implementation for Foundational

- [x] T005 [P] Implement `formatDateTime` and `formatBoolean` formatters in src/lib/formatters.ts
- [x] T006 [P] Create column preference persistence module with `saveColumnPreferences(tableName, prefs)` and `loadColumnPreferences(tableName, defaults)` functions in src/lib/column-preferences.ts
- [x] T007 Add new fields to `SleepRecord` interface: `createdAt`, `updatedAt`, `totalNoDataMs`, `sleepConsistencyPct`, `sleepNeededBaselineMs`, `sleepNeededDebtMs`, `sleepNeededStrainMs`, `sleepNeededNapMs` in src/lib/types.ts
- [x] T008 Add new fields to `Cycle` interface: `createdAt`, `updatedAt` in src/lib/types.ts (depends on T007 — same file)
- [x] T009 Add new fields to `Recovery` interface: `createdAt`, `updatedAt`, `userCalibrating` in src/lib/types.ts (depends on T008 — same file)
- [x] T010 Add new fields to `Workout` interface: `createdAt`, `updatedAt`, `percentRecorded`, `altitudeGainMeters`, `altitudeChangeMeters`, `zoneZeroMs`, `zoneOneMs`, `zoneTwoMs`, `zoneThreeMs`, `zoneFourMs`, `zoneFiveMs` in src/lib/types.ts (depends on T009 — same file)
- [x] T011 Add new `BodyMeasurement` interface: `heightMeter`, `weightKilogram`, `maxHeartRate` in src/lib/types.ts (depends on T010 — same file)
- [x] T012 Update `mapSleepResponse` to map all new sleep fields (createdAt, updatedAt, totalNoDataMs, sleepConsistencyPct, sleepNeeded breakdown) in src/lib/whoop-api.ts (depends on T007)
- [x] T013 Update `mapCycleResponse` to map createdAt and updatedAt in src/lib/whoop-api.ts (depends on T008, T012 — same file)
- [x] T014 Update `mapRecoveryResponse` to map createdAt, updatedAt, and userCalibrating in src/lib/whoop-api.ts (depends on T009, T013 — same file)
- [x] T015 Update `mapWorkoutResponse` to map createdAt, updatedAt, percentRecorded, altitudeGainMeters, altitudeChangeMeters, and all 6 zone duration fields from `score.zone_durations` in src/lib/whoop-api.ts (depends on T010, T014 — same file)
- [x] T016 Verify all foundational tests pass: run `npm test` and confirm T002, T003, T004 tests are green

**Checkpoint**: Foundational infrastructure ready — all types, mappers, formatters, and persistence in place. User story implementation can begin.

---

## Phase 3: User Story 1 - Show Full Start/End Times Across All Tables (Priority: P1) 🎯 MVP

**Goal**: Update the Date column to show date+time and add End Time columns to sleep and cycles tables.

**Independent Test**: Load any table and verify start times show time of day and end times appear as new columns.

### Tests for User Story 1

- [x] T017 [P] [US1] Write failing tests verifying sleep column definitions include `end` column using `formatDateTime`, and that `start` column uses `formatDateTime` instead of `formatDate` in tests/unit/sleep-columns.test.ts
- [x] T018 [P] [US1] Write failing tests verifying cycles column definitions include `end` column using `formatDateTime`, and that `start` column uses `formatDateTime` in tests/unit/cycles-columns.test.ts
- [x] T019 [P] [US1] Write failing test verifying workouts `start` column uses `formatDateTime` in tests/unit/workouts-columns.test.ts

### Implementation for User Story 1

- [x] T020 [P] [US1] Update sleep column definitions: change `start` column to use `formatDateTime`, add `end` column with `formatDateTime` in src/components/tables/sleep-columns.tsx
- [x] T021 [P] [US1] Update cycles column definitions: change `start` column to use `formatDateTime`, add `end` column with `formatDateTime` in src/components/tables/cycles-columns.tsx
- [x] T022 [P] [US1] Update workouts column definitions: change `start` column to use `formatDateTime` in src/components/tables/workouts-columns.tsx
- [x] T023 [US1] Verify US1 tests pass: run `npm test` and confirm T017, T018, T019 tests are green

**Checkpoint**: All tables show full date+time for start, sleep and cycles show end time. US1 complete.

---

## Phase 4: User Story 2 - View Missing Sleep Columns (Priority: P1)

**Goal**: Add all missing sleep fields to the sleep table: sleep cycle count, nap indicator, consistency %, no-data time, and 4 sleep-needed breakdown columns.

**Independent Test**: Load sleep table and verify 8 new columns appear with correctly formatted values.

### Tests for User Story 2

- [x] T024 [US2] Write failing tests verifying sleep column definitions include columns for `sleepCycleCount`, `isNap` (using formatBoolean), `sleepConsistencyPct`, `totalNoDataMs`, `sleepNeededBaselineMs`, `sleepNeededDebtMs`, `sleepNeededStrainMs`, `sleepNeededNapMs`, plus hidden-by-default columns for `id`, `cycleId`, `timezoneOffset`, `scoreState`, `createdAt`, `updatedAt` in tests/unit/sleep-columns.test.ts

### Implementation for User Story 2

- [x] T025 [US2] Add all new and previously-missing columns to sleep column definitions: `sleepCycleCount` (formatInteger), `isNap` (formatBoolean), `sleepConsistencyPct` (formatPercentage), `totalNoDataMs` (formatDuration), `sleepNeededBaselineMs` (formatDuration), `sleepNeededDebtMs` (formatDuration), `sleepNeededStrainMs` (formatDuration), `sleepNeededNapMs` (formatDuration), plus hidden-by-default columns for `id`, `cycleId`, `timezoneOffset`, `scoreState`, `createdAt` (formatDateTime), `updatedAt` (formatDateTime). Set `meta.defaultVisible` on ALL columns in this file (true for data columns, false for metadata/ID columns) in src/components/tables/sleep-columns.tsx
- [x] T026 [US2] Update existing `types.test.ts` to add validation tests for new SleepRecord fields in tests/unit/types.test.ts
- [x] T027 [US2] Verify US2 tests pass: run `npm test` and confirm T024, T026 tests are green

**Checkpoint**: Sleep table shows all WHOOP API v2 sleep fields. US2 complete.

---

## Phase 5: User Story 3 - View Missing Workout Columns (Priority: P1)

**Goal**: Add altitude gain, altitude change, percent recorded, and HR zone durations (zones 0-5) to the workouts table.

**Independent Test**: Load workouts table and verify new columns for altitude, zones, and percent recorded appear.

### Tests for User Story 3

- [x] T028 [US3] Write failing tests verifying workout column definitions include columns for `percentRecorded`, `altitudeGainMeters`, `altitudeChangeMeters`, `zoneZeroMs` through `zoneFiveMs`, plus hidden-by-default columns for `id`, `timezoneOffset`, `scoreState`, `createdAt`, `updatedAt` in tests/unit/workouts-columns.test.ts

### Implementation for User Story 3

- [x] T029 [US3] Add all new and previously-missing columns to workout column definitions: `percentRecorded` (formatPercentage), `altitudeGainMeters` (formatMeters), `altitudeChangeMeters` (formatMeters), `zoneZeroMs` through `zoneFiveMs` (formatDuration each), plus hidden-by-default columns for `id`, `timezoneOffset`, `scoreState`, `createdAt` (formatDateTime), `updatedAt` (formatDateTime). Set `meta.defaultVisible` on ALL columns in this file (true for data columns, false for metadata/ID columns) in src/components/tables/workouts-columns.tsx
- [x] T030 [US3] Update existing `types.test.ts` to add validation tests for new Workout fields in tests/unit/types.test.ts
- [x] T031 [US3] Verify US3 tests pass: run `npm test` and confirm T028, T030 tests are green

**Checkpoint**: Workouts table shows all WHOOP API v2 workout fields including zones and altitude. US3 complete.

---

## Phase 6: User Story 5 - Column Visibility Toggle (Priority: P1)

**Goal**: Add a "Columns" dropdown to every table with checkmarks for visibility toggle, drag-to-reorder, and persistent preferences.

**Independent Test**: Click Columns dropdown on any table, toggle columns on/off, reorder via drag, reload page, verify preferences persist.

### Tests for User Story 5

- [x] T032 [P] [US5] Write failing tests for ColumnToggle component: renders all columns with checkmarks, toggling a checkbox updates visibility, drag-to-reorder updates order, hidden-by-default columns appear unchecked in tests/unit/column-toggle.test.tsx
- [x] T033 [P] [US5] Write failing tests for updated DataTable: accepts columnVisibility and columnOrder state, renders Columns dropdown button, integrates with column-preferences persistence in tests/unit/data-table.test.tsx

### Implementation for User Story 5

- [x] T034 [US5] Create ColumnToggle component using Radix Popover + @dnd-kit/sortable: checkbox list of all columns with drag handles, toggles visibility via `onColumnVisibilityChange`, reorders via `onColumnOrderChange` in src/components/column-toggle.tsx
- [x] T035 [US5] Update DataTable component to accept `tableId` prop, manage `columnVisibility` and `columnOrder` state via TanStack Table, load/save preferences using column-preferences.ts, render ColumnToggle above the table in src/components/data-table.tsx
- [x] T036 [US5] Update all 4 page components to pass `tableId` prop to DataTable (e.g., `tableId="sleep"`) for preference persistence in src/pages/sleep.tsx, src/pages/cycles.tsx, src/pages/recovery.tsx, src/pages/workouts.tsx
- [x] T037 [US5] Verify US5 tests pass: run `npm test` and confirm T032, T033 tests are green

**Checkpoint**: All tables have a working Columns dropdown with visibility toggle, drag reorder, and persistent preferences. US5 complete.

---

## Phase 7: User Story 4 - Surface Cycle Relationships Across Tables (Priority: P2)

**Goal**: Show which cycle each sleep and recovery record belongs to by resolving cycle IDs to human-readable cycle dates.

**Independent Test**: Load sleep table and verify Cycle column shows the cycle's start date; load recovery table and verify Cycle ID is replaced with a date.

### Tests for User Story 4

- [x] T038 [US4] Write failing tests: sleep page fetches cycle data and passes cycle lookup map to DataTable via TanStack Table `meta`; sleep column `cycleDate` accessor resolves cycleId to date using meta; recovery column resolves cycleId to date; fallback to raw ID when cycle not found in tests/unit/cycle-resolution.test.ts

### Implementation for User Story 4

- [x] T039 [US4] Add `cycleDate` column to sleep column definitions that uses TanStack Table `meta.cycleLookup` to resolve `cycleId` to a formatted date string, with raw cycleId as fallback in src/components/tables/sleep-columns.tsx
- [x] T040 [US4] Update recovery column definitions: replace raw `cycleId` column with a `cycleDate` column that resolves via `meta.cycleLookup`, with raw cycleId as fallback; add hidden-by-default columns for `sleepId`, `scoreState`, `createdAt`, `updatedAt`; add `userCalibrating` column using formatBoolean. Set `meta.defaultVisible` on ALL columns in this file (true for data columns, false for metadata/ID columns) in src/components/tables/recovery-columns.tsx
- [x] T041 [US4] Update cycles column definitions to add hidden-by-default columns for `id`, `timezoneOffset`, `scoreState`, `createdAt`, `updatedAt`. Set `meta.defaultVisible` on ALL columns in this file (true for data columns, false for metadata/ID columns) in src/components/tables/cycles-columns.tsx
- [x] T042 [US4] Update sleep page to additionally fetch cycles for the same date range, build a `Map<number, string>` (cycleId → formatted start date), and pass it as `meta.cycleLookup` to DataTable in src/pages/sleep.tsx
- [x] T043 [US4] Update recovery page to additionally fetch cycles for the same date range, build cycle lookup map, and pass as `meta.cycleLookup` to DataTable in src/pages/recovery.tsx
- [x] T044 [US4] Verify US4 tests pass: run `npm test` and confirm T038 tests are green

**Checkpoint**: Sleep and recovery tables show human-readable cycle dates. Recovery table also shows userCalibrating and hidden metadata columns. US4 complete.

---

## Phase 8: User Story 6 - View Body Measurements (Priority: P2)

**Goal**: Fetch and display body measurements (height, weight, max HR) in a dedicated card.

**Independent Test**: Navigate to body measurements section and verify 3 values display with correct units.

### Tests for User Story 6

- [x] T045 [P] [US6] Write failing tests for `fetchBodyMeasurement` function: makes GET to correct endpoint, maps response to BodyMeasurement type, handles null/error responses in tests/unit/whoop-api.test.ts
- [x] T046 [P] [US6] Write failing tests for BodyMeasurements component: renders height in meters, weight in kg, max HR in bpm; shows dash for null values in tests/unit/body-measurements.test.tsx

### Implementation for User Story 6

- [x] T047 [US6] Add `user/measurement/body` to ALLOWED_PATHS in api/whoop/index.ts
- [x] T048 [US6] Add `fetchBodyMeasurement` function (non-paginated, single GET with mapper) and a `useBodyMeasurement` hook using TanStack Query's `useQuery` to call it in src/lib/whoop-api.ts
- [x] T049 [US6] Create BodyMeasurements card component displaying height (m), weight (kg), and max HR (bpm) using existing Card UI component, with loading and null-value handling in src/components/body-measurements.tsx
- [x] T050 [US6] Create a new Body page at src/pages/body.tsx that renders the BodyMeasurements component using the `useBodyMeasurement` hook, and add a "Body" nav tab to src/components/layout/nav-tabs.tsx and a route in src/App.tsx
- [x] T051 [US6] Update proxy allowlist test to include `user/measurement/body` path in tests/api/proxy-allowlist.test.ts
- [x] T052 [US6] Verify US6 tests pass: run `npm test` and confirm T045, T046, T051 tests are green

**Checkpoint**: Body measurements card displays user's physical profile data. US6 complete.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all stories

- [x] T053 Write automated tests verifying null handling across all new formatters: `formatDateTime(null)` → "—", `formatBoolean(null)` → "—", `formatDuration(null)` → "—", `formatPercentage(null)` → "—", `formatMeters(null)` → "—", `formatInteger(null)` → "—" in tests/unit/formatters.test.ts
- [x] T054 Run full test suite (`npm test`) and verify all tests pass
- [x] T055 Run linter (`npm run lint`) and fix any issues
- [x] T056 Verify column visibility defaults are correct: metadata/ID columns hidden, data columns visible across all 4 tables
- [x] T057 Run quickstart.md validation: verify the documented setup steps work for a fresh checkout of this branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start after foundational complete
- **US2 (Phase 4)**: Depends on US1 — both modify sleep-columns.tsx; US1 must complete first
- **US3 (Phase 5)**: Depends on US1 — both modify workouts-columns.tsx; US1 must complete first
- **US5 (Phase 6)**: Depends on US2 and US3 — needs all columns to exist with `meta.defaultVisible` set
- **US4 (Phase 7)**: Depends on Phase 2 — can run in parallel with US1 (different files: recovery-columns.tsx, cycles-columns.tsx + page files)
- **US6 (Phase 8)**: Depends on Phase 2 — fully independent of all other stories
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Start/End Times)**: Independent — only needs foundational formatters
- **US2 (Sleep Columns)**: Depends on US1 — shares sleep-columns.tsx; must sequence after US1
- **US3 (Workout Columns)**: Depends on US1 — shares workouts-columns.tsx; must sequence after US1
- **US5 (Column Toggle)**: Depends on US2 and US3 — needs all columns with `meta.defaultVisible` to exist
- **US4 (Cycle Relationships)**: Independent of US1-US3 — modifies recovery-columns.tsx, cycles-columns.tsx, and page files that US1-US3 don't touch
- **US6 (Body Measurements)**: Fully independent — different endpoint, different component, different page

### Parallel Opportunities

Within Phase 2 (Foundational):
- T002, T003, T004 can all run in parallel (different test files)
- T005 and T006 can run in parallel (different source files)
- T007-T011 are sequential (same file: types.ts)
- T012-T015 are sequential (same file: whoop-api.ts)

After Phase 2:
- US1 starts first (modifies sleep-columns.tsx, cycles-columns.tsx, workouts-columns.tsx)
- US4 can run in parallel with US1 (different files: recovery-columns.tsx + page files)
- US6 can run in parallel with anything (completely independent)
- US2 and US3 can run in parallel with each other AFTER US1 completes (US2 touches sleep-columns.tsx, US3 touches workouts-columns.tsx — no overlap between them)
- US5 runs after US2 and US3 complete

---

## Parallel Example: After Foundational Phase

```bash
# Wave 1 (immediately after Phase 2):
# US1 + US4 + US6 can run simultaneously (no file overlaps)

# Agent A: US1 (Start/End Times)
Task: T020 sleep-columns.tsx, T021 cycles-columns.tsx, T022 workouts-columns.tsx

# Agent B: US4 (Cycle Relationships) — different files
Task: T039 sleep-columns.tsx (adds cycleDate column — no conflict with T020's start/end changes)
Task: T040 recovery-columns.tsx, T041 cycles-columns.tsx
# ⚠️ NOTE: T041 and T021 both modify cycles-columns.tsx — sequence T021 before T041

# Agent C: US6 (Body Measurements) — fully independent
Task: T047-T052 can all proceed without waiting

# Wave 2 (after US1 completes):
# US2 + US3 can run in parallel (different files)

# Agent A: US2 (Sleep Columns) — sleep-columns.tsx
# Agent B: US3 (Workout Columns) — workouts-columns.tsx

# Wave 3 (after US2 + US3 complete):
# US5 (Column Toggle) — reads meta.defaultVisible from all column files
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (install @dnd-kit)
2. Complete Phase 2: Foundational (types, mappers, formatters, persistence)
3. Complete Phase 3: US1 (start/end times)
4. **STOP and VALIDATE**: All tables show date+time, sleep/cycles show end time
5. Deploy/demo if ready

### Recommended Sequence (Single Developer)

1. Phase 1: Setup → Phase 2: Foundational
2. Phase 3: US1 (start/end times) — quick win, touches all tables
3. Phase 4: US2 (sleep columns) — biggest data addition
4. Phase 5: US3 (workout columns) — second biggest data addition
5. Phase 6: US5 (column toggle) — UX control for all the new columns
6. Phase 7: US4 (cycle relationships) — cross-entity resolution
7. Phase 8: US6 (body measurements) — standalone card
8. Phase 9: Polish

### Incremental Delivery

Each phase checkpoint delivers independently testable value:
- After US1: Users see full timestamps
- After US2: Users see all sleep data
- After US3: Users see all workout data
- After US5: Users can customize table layout
- After US4: Users understand data relationships
- After US6: Users see body profile data

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- TDD enforced per constitution: tests first, verify they fail, then implement
- US1 MUST complete before US2/US3 start (shared files: sleep-columns.tsx, workouts-columns.tsx)
- `meta.defaultVisible` is set inline in each column file as columns are added (US2/T025, US3/T029, US4/T040-T041) — no separate sweep task
- Commit after each task or logical group
