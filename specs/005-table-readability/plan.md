# Implementation Plan: Table Readability Improvements

**Branch**: `005-table-readability` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-table-readability/spec.md`

## Summary

Improve data table readability across four tables (sleep, cycles, recovery, workouts) by: (1) moving units from cells to column headers, (2) converting durations to decimal hours, (3) adding a computed Duration column to cycles, (4) loading Geist Mono font for numeric cells with comma formatting and right-alignment, (5) adding subtle alternating row tints and hover highlights, (6) moderate row density and sticky headers, (7) fixing the body measurement API 502 error. All changes touch existing formatters, column definitions, the DataTable component, global CSS, and the Vercel API proxy.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: React 19, TanStack Table v8.21.3, TanStack Query v5, Tailwind CSS v4, Vite 7
**Storage**: localStorage (column preferences, OAuth tokens), IndexedDB via idb-keyval (query cache)
**Testing**: Vitest (unit/integration)
**Target Platform**: Browser (SPA deployed to Vercel)
**Project Type**: Web application (SPA + Vercel serverless API proxy)
**Performance Goals**: Instant table rendering with 30+ days of WHOOP data
**Constraints**: Client-side processing only for health data; API proxy for authenticated WHOOP API calls
**Scale/Scope**: Single user, 4 data tables, ~30–365 rows per table

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Post-Phase 1 re-check: All gates PASS. No new violations introduced by design artifacts.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Privacy-First | PASS | All changes are client-side formatting. API proxy fix addresses an existing endpoint, no new data transmission. |
| II. TDD | PASS | Tests will be written for formatter changes, new column, and API proxy fix before implementation. |
| III. Simplicity & YAGNI | PASS | All changes are directly requested. No new abstractions — modifying existing formatters and column defs. |
| IV. User-Friendly Design | PASS | Core goal is improving readability. No new concepts for users to learn. |
| V. Modern Frontend Practices | PASS | TypeScript strict mode, Geist Mono (modern font), Tailwind CSS patterns. |

**Pre-existing architecture note**: The project uses Vercel serverless functions as an API proxy (predates constitution). The body measurement fix addresses an existing proxy endpoint, not a new backend.

## Project Structure

### Documentation (this feature)

```text
specs/005-table-readability/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── data-table.tsx              # Table component (add zebra, hover, sticky, density)
│   ├── body-measurements.tsx       # Body card (units to labels)
│   └── tables/
│       ├── sleep-columns.tsx       # Update headers with units, formatter refs
│       ├── cycles-columns.tsx      # Update headers, add Duration column
│       ├── recovery-columns.tsx    # Update headers, fix skin temp formatter
│       └── workouts-columns.tsx    # Update headers, formatter refs
├── lib/
│   ├── formatters.ts              # Update formatDuration, add formatNumber
│   └── whoop-api.ts               # Body measurement error handling
├── index.css                       # Geist Mono font import, table styles
└── main.tsx                        # (no changes expected)

api/
└── whoop/
    └── index.ts                   # Fix body_measurement 502

tests/
├── formatters.test.ts             # Tests for updated formatters
├── cycles-columns.test.ts         # Test Duration column computation
└── api-proxy.test.ts              # Test body_measurement endpoint
```

**Structure Decision**: Existing web application structure with `src/` (frontend) and `api/` (Vercel serverless). No new directories needed — all changes modify existing files plus adding test files.

## Complexity Tracking

No constitution violations. No complexity tracking entries needed.
