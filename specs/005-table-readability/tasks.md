# Tasks: Table Readability Improvements

**Input**: Design documents from `/specs/005-table-readability/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Included per constitution (TDD is NON-NEGOTIABLE).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and extend shared types needed by all stories

- [x] T001 Install `geist` npm package for Geist Mono font (`npm install geist`)
- [x] T002 Extend `ColumnMeta` type declaration to add `align: "left" | "right"` and `unit: string | undefined` fields in `src/lib/table-types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update shared formatters that all column definitions depend on. Tests first per TDD.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests

- [x] T003 Write failing tests for `formatDuration` returning decimal hours (e.g., 495000ms → "8.25", 0 → "0.00", null → "—") in `tests/formatters.test.ts`
- [x] T004 [P] Write failing tests for `formatMeters` returning value without " km" unit (e.g., 5200 → "5.20", null → "—") in `tests/formatters.test.ts`
- [x] T005 [P] Write failing test for new `formatNumber` with comma separators (e.g., 1234.5 with 2 places → "1,234.50", 500 → "500", null → "—") in `tests/formatters.test.ts`

### Implementation

- [x] T006 Update `formatDuration(ms)` in `src/lib/formatters.ts` to return decimal hours with 2 decimal places (ms / 3600000).toFixed(2) instead of "Xh YYm"
- [x] T007 Update `formatMeters(meters)` in `src/lib/formatters.ts` to return numeric value only (convert to km, no " km" suffix) — unit will move to column header
- [x] T008 Add `formatNumber(value, decimalPlaces)` in `src/lib/formatters.ts` using `Intl.NumberFormat("en-US")` for comma thousands separators, returning "—" for null
- [x] T009 Run `npm test` to verify all formatter tests pass (T003–T005 green)

**Checkpoint**: All formatters updated and tested. Column definition work can begin.

---

## Phase 3: User Story 1 — Clean Numeric Columns with Units in Headers (Priority: P1) 🎯 MVP

**Goal**: Move units from cell values to column headers across all four tables. Percentage columns keep "%" inline.

**Independent Test**: Load any table view → units appear only in column headers. Cells show raw numbers. "%" remains in percentage cells.

### Implementation for User Story 1

- [x] T010 [US1] Update DataTable component in `src/components/data-table.tsx` to render `column.columnDef.meta?.unit` in header text as "Header Name (unit)" format
- [x] T011 [P] [US1] Update all column definitions in `src/components/tables/sleep-columns.tsx`: add `meta.unit` for duration columns ("hrs"), and `meta.align: "right"` for all numeric columns. Remove any unit strings from cell formatters.
- [x] T012 [P] [US1] Update all column definitions in `src/components/tables/cycles-columns.tsx`: add `meta.unit` for calorie ("kcal"), heart rate ("bpm"), and strain columns. Add `meta.align: "right"` for numeric columns.
- [x] T013 [P] [US1] Update all column definitions in `src/components/tables/recovery-columns.tsx`: add `meta.unit` for skin temp ("°C"), HRV ("ms"), heart rate ("bpm"). Replace inline skin temp formatter (`"X.X°C"`) with shared `formatDecimal` (unit moves to header). Add `meta.align: "right"`.
- [x] T014 [P] [US1] Update all column definitions in `src/components/tables/workouts-columns.tsx`: add `meta.unit` for duration ("hrs"), distance ("km"), altitude ("m"), heart rate ("bpm"), calorie ("kcal"). Add `meta.align: "right"`.
- [x] T015 [US1] Update DataTable component in `src/components/data-table.tsx` to apply `text-right` class to cells when `column.columnDef.meta?.align === "right"`, and apply `text-right` to corresponding header cells.

**Checkpoint**: All four tables display units in headers only. Percentage columns unchanged. Cells show raw numeric values.

---

## Phase 4: User Story 2 — Consistent Duration Formatting in Hours (Priority: P1)

**Goal**: All duration columns display decimal hours. Cycles table gets a new computed Duration column.

**Independent Test**: Load each table → duration columns show decimal hours (e.g., "7.50"). Cycles table has "Duration (hrs)" column.

### Tests for User Story 2

- [x] T016 [US2] Write failing test for cycles Duration column accessor: given start="2026-03-01T22:00:00Z" and end="2026-03-02T06:30:00Z", expect 8.50; given end=null, expect null (triggers "—") in `tests/cycles-columns.test.ts`

### Implementation for User Story 2

- [x] T017 [US2] Add computed "Duration" column to `src/components/tables/cycles-columns.tsx` with `accessorFn` that calculates `(end - start)` in decimal hours, `meta.unit: "hrs"`, `meta.align: "right"`. Return null if `end` is missing.
- [x] T018 [US2] Run `npm test` to verify Duration column test passes (T016 green)

**Checkpoint**: Duration values are decimal hours across all tables. Cycles has computed Duration column.

---

## Phase 5: User Story 4 — Fix Body Measurement API Error (Priority: P1)

**Goal**: Body measurement API returns data successfully. Body measurement card shows units in labels not values.

**Independent Test**: Navigate to body measurement section → height, weight, max heart rate load without 502 error. Units appear in card labels.

### Tests for User Story 4

- [x] T019 [US4] Write failing test for body measurement API proxy handling `user/measurement/body` path correctly in `tests/api/body-measurement.test.ts` — mock upstream 200 response with valid body data, verify proxy returns 200

### Implementation for User Story 4

- [x] T020 [US4] Debug and fix `user/measurement/body` path handling in `api/whoop/index.ts` — use `decodedPath` instead of `apiPath` for upstream URL construction to handle URL-encoded slashes.
- [x] T021 [P] [US4] Update `src/components/body-measurements.tsx` to move units from value strings to card labels: "Height (m)" with value "1.83", "Weight (kg)" with value "84.5", "Max Heart Rate (bpm)" with value "195"
- [x] T022 [US4] Run `npm test` to verify API proxy test passes (T019 green)

**Checkpoint**: Body measurement API works. Card displays units in labels.

---

## Phase 6: User Story 3 — Monospace Font with Numeric Alignment (Priority: P2)

**Goal**: Numeric table cells use Geist Mono font with comma separators and right-alignment for vertical scanning.

**Independent Test**: Load any table → numeric cells render in monospace font, large numbers have commas, decimal points align vertically.

### Implementation for User Story 3

- [x] T023 [US3] Import Geist Mono font CSS in `src/index.css` (e.g., `@import "geist/font/mono"`) and configure as a custom font family in Tailwind theme (`--font-mono: "Geist Mono", ui-monospace, monospace`)
- [x] T024 [US3] Apply Geist Mono font to numeric table cells in `src/components/data-table.tsx` — add `font-mono tabular-nums` classes to `<td>` elements that have `meta.align: "right"` (numeric columns)
- [x] T025 [US3] Update `formatInteger` in `src/lib/formatters.ts` to use `Intl.NumberFormat("en-US")` for comma separators on values ≥ 1000
- [x] T026 [US3] Verify visual alignment by running `npm run dev` and checking all four tables — decimal points should align vertically within each column

**Checkpoint**: All numeric cells use Geist Mono, commas in large numbers, right-aligned with tabular figures.

---

## Phase 7: User Story 5 — Visual Row Differentiation (Priority: P2)

**Goal**: Tables have subtle alternating row tints, hover highlights, moderate density, and sticky headers.

**Independent Test**: Load any table → alternating row background visible, hover highlights row, headers stay pinned while scrolling.

### Implementation for User Story 5

- [x] T027 [US5] Add subtle alternating row background tint in `src/components/data-table.tsx` using `even:bg-muted/30` on `<tr>` elements
- [x] T028 [US5] Add hover highlight on table rows in `src/components/data-table.tsx` using `hover:bg-muted/60` class on `<tr>` elements (more prominent than the alternating tint)
- [x] T029 [US5] Apply moderate row density in `src/components/data-table.tsx` by setting `py-2 px-3` on `<td>` elements
- [x] T030 [US5] Make table headers sticky in `src/components/data-table.tsx` by adding `sticky top-0 z-10 bg-background` to `<thead>` with `max-h-[70vh] overflow-auto` on container

**Checkpoint**: All four tables have zebra rows, hover, moderate density, and sticky headers.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [x] T031 Run `npm test` to verify all tests pass across all stories (99/99 pass)
- [x] T032 Run `npm run lint` — no new lint errors (4 pre-existing errors in unmodified files)
- [ ] T033 Visual verification: load each of the 4 table pages + body measurement page, confirm all acceptance scenarios from spec.md are met
- [ ] T034 Verify edge cases: null values show "—", 0ms duration shows "0.00", in-progress cycle shows "—" for duration, Geist Mono fallback works if font blocked

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — BLOCKS US2 (duration columns need unit headers)
- **US2 (Phase 4)**: Depends on Phase 3 (column meta infrastructure)
- **US4 (Phase 5)**: Depends on Phase 2 only — can run in PARALLEL with US1/US2
- **US3 (Phase 6)**: Depends on Phase 3 (needs meta.align on columns)
- **US5 (Phase 7)**: Depends on Phase 3 (DataTable changes build on Phase 3 work)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundational only. First story — establishes column meta infrastructure.
- **US2 (P1)**: Depends on US1 (needs meta.unit on cycles columns). Formatter change is in Foundational.
- **US4 (P1)**: Independent of other stories. Can start after Foundational, in parallel with US1.
- **US3 (P2)**: Depends on US1 (needs meta.align to know which cells get monospace).
- **US5 (P2)**: Depends on US1 (DataTable modifications build on US1 header/align changes).

### Parallel Opportunities

- **Phase 2**: T003, T004, T005 (formatter tests) can run in parallel
- **Phase 3**: T011, T012, T013, T014 (column definition updates) can run in parallel
- **Phase 5**: T020 and T021 (API fix and component update) can run in parallel
- **US4 can run in parallel with US1/US2** (independent code paths)

---

## Parallel Example: Phase 3 (US1)

```bash
# After T010 (DataTable meta.unit rendering) is complete:
# Launch all column definition updates in parallel:
Task: T011 "Update sleep-columns.tsx with meta.unit and meta.align"
Task: T012 "Update cycles-columns.tsx with meta.unit and meta.align"
Task: T013 "Update recovery-columns.tsx with meta.unit and meta.align"
Task: T014 "Update workouts-columns.tsx with meta.unit and meta.align"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US4)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational formatters (T003–T009)
3. Complete Phase 3: US1 — Units in headers (T010–T015)
4. Complete Phase 4: US2 — Duration formatting (T016–T018)
5. Complete Phase 5: US4 — Fix body API (T019–T022)
6. **STOP and VALIDATE**: All P1 stories functional
7. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → formatters ready
2. Add US1 → units in headers → Deploy (visual improvement immediately visible)
3. Add US2 → duration formatting → Deploy (data consistency)
4. Add US4 → body API fix → Deploy (bug fix)
5. Add US3 → monospace font → Deploy (typography polish)
6. Add US5 → zebra rows + sticky headers → Deploy (final polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD enforced per constitution: write tests first, verify they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US4 (body API fix) is independent and can be done at any point after Phase 2
