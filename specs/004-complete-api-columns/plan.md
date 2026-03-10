# Implementation Plan: Complete API Columns in Data Tables

**Branch**: `004-complete-api-columns` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-complete-api-columns/spec.md`

## Summary

Add all missing WHOOP API v2 fields to every data table (sleep, cycles, recovery, workouts), introduce a body measurements display, and build a column visibility/reorder system with persistent preferences. Currently, many API fields are unmapped (sleep needed breakdown, sleep consistency, workout altitude/zones, recovery calibrating flag, metadata timestamps) and existing date columns drop the time component. The column control UI gives users full customization over which columns are visible and their order.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: React 19, TanStack Table v8.21.3, TanStack Query v5, Vite 7, Tailwind CSS v4, Radix UI, lucide-react, idb-keyval
**Storage**: localStorage (OAuth tokens, column preferences), IndexedDB via idb-keyval (query cache)
**Testing**: Vitest 4 + @testing-library/react 16 + jsdom + fake-indexeddb
**Target Platform**: Browser only (static hosting on Vercel, no SSR)
**Project Type**: Single-page web application (client-side only)
**Performance Goals**: Tables render instantly with column toggle; no perceptible lag on reorder
**Constraints**: No server-side processing (constitution: Privacy-First). All data stays in browser.
**Scale/Scope**: 4 existing tables + 1 new body measurement card, ~26 new functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Privacy-First (Client-Side Only) | PASS | All changes are client-side. Column preferences stored in localStorage. Body measurement data fetched directly from WHOOP API via existing proxy. |
| II. Test-Driven Development | PASS | TDD workflow will be followed. Tests for formatters, mappers, column configs, and persistence. |
| III. Simplicity & YAGNI | PASS | No new abstractions beyond what's needed. TanStack Table has built-in column visibility and ordering APIs — we use those directly rather than building custom state management. |
| IV. User-Friendly Design | PASS | Column dropdown is self-explanatory. Hidden columns are discoverable. Drag-to-reorder is intuitive. |
| V. Modern Frontend Practices | PASS | TypeScript strict mode, no `any` types, accessible column toggle (keyboard navigable). |

**Gate result: PASS** — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-complete-api-columns/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: developer onboarding
└── tasks.md             # Phase 2: implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types.ts                    # UPDATED: Add missing fields to all interfaces + new BodyMeasurement
│   ├── whoop-api.ts                # UPDATED: Update mappers + add fetchBodyMeasurement
│   ├── formatters.ts               # UPDATED: Add formatDateTime, formatBoolean formatters
│   └── column-preferences.ts       # NEW: localStorage persistence for column visibility/order
├── components/
│   ├── data-table.tsx              # UPDATED: Add column visibility, ordering, and Columns dropdown
│   ├── column-toggle.tsx           # NEW: Columns dropdown with checkmarks and drag-to-reorder
│   ├── body-measurements.tsx       # NEW: Card component for body measurement display
│   └── tables/
│       ├── sleep-columns.tsx       # UPDATED: Add all missing columns with visibility defaults
│       ├── cycles-columns.tsx      # UPDATED: Add end time, metadata columns
│       ├── recovery-columns.tsx    # UPDATED: Add calibrating, cycle date, metadata columns
│       └── workouts-columns.tsx    # UPDATED: Add altitude, zones, percent recorded, metadata
├── hooks/
│   └── use-whoop-data.ts          # UNCHANGED (body measurement uses its own useQuery hook in whoop-api.ts)
└── pages/
    ├── sleep.tsx                   # UPDATED: Wire up new columns
    ├── cycles.tsx                  # UPDATED: Wire up new columns
    ├── recovery.tsx                # UPDATED: Wire up new columns + cycle lookup
    └── workouts.tsx                # UPDATED: Wire up new columns

api/
└── whoop/
    └── index.ts                   # UPDATED: Add body_measurement to ALLOWED_PATHS

tests/
└── unit/
    ├── formatters.test.ts         # UPDATED: Tests for new formatters
    ├── types.test.ts              # UPDATED: Tests for new type fields
    ├── whoop-api.test.ts          # NEW: Tests for updated mappers
    ├── column-preferences.test.ts # NEW: Tests for persistence logic
    └── column-toggle.test.tsx     # NEW: Tests for column toggle component
```

**Structure Decision**: Follows existing single-project structure. No new directories needed. Column toggle is a new component because it encapsulates drag-to-reorder + checkbox list UI. Column preferences is a new lib module because it manages localStorage serialization separately from auth.

## Complexity Tracking

No constitution violations — table not needed.
