# Implementation Plan: WHOOP Data Explorer

**Branch**: `001-whoop-data-explorer` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-whoop-data-explorer/spec.md`

## Summary

Build a privacy-first, client-side web application that
authenticates with the WHOOP v2 API via OAuth2, fetches health
data (Sleep, Cycles, Recovery, Workouts), displays it in sortable
data tables with summary statistics, and allows Excel export.
All health data processing happens in the browser. A minimal
Vercel serverless proxy handles OAuth token exchange and API
forwarding (no health data stored server-side).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 18+, TanStack Query v5,
TanStack Table v8, ShadCN/ui (Radix + Tailwind v4),
React Router v7, SheetJS (xlsx)
**Storage**: IndexedDB (via idb-keyval) for query cache
persistence; localStorage for auth tokens
**Testing**: Vitest (unit/integration)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari,
Edge — latest 2 versions), desktop (1024px+) and mobile (375px+)
**Project Type**: Single-page web application (SPA) + Vercel
serverless functions (API proxy)
**Performance Goals**: <3s initial load, <1s view switch,
<60s connect-to-data, <10s Excel export (30 days)
**Constraints**: Client-side only health data processing,
Vercel static hosting + serverless, max 25 records per WHOOP
API page, 100 req/min rate limit
**Scale/Scope**: Single user, personal health data, 4 collection
views, 7/30/90 day date ranges

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after
Phase 1 design.*

### I. Privacy-First (Client-Side Only)

- **PASS**: All health data processing in browser.
- **NOTE**: WHOOP API does not document CORS support and requires
  `client_secret` server-side. A stateless Vercel serverless
  proxy forwards API responses without logging or storing data.
  Health data transits the proxy ephemerally but is never
  persisted. See research.md R4 for full rationale.
- OAuth tokens stored in browser localStorage only.
- Disconnect clears all local data (FR-016).
- No analytics or telemetry.

### II. Test-Driven Development

- **PASS**: Vitest for unit and integration tests.
- TDD cycle enforced: tests first, verify failure, implement.
- Test data uses fixtures (no real WHOOP API calls in tests).

### III. Simplicity & YAGNI

- **PASS**: Minimal dependency set, each justified.
- No state management library (TanStack Query for server state,
  React context for auth).
- No component library beyond ShadCN (copied source, not dep).
- SheetJS lazy-loaded (not in initial bundle).
- Tabular views only — no charts/visualizations this iteration.

### IV. User-Friendly Design

- **PASS**: ShadCN provides accessible Radix-based components.
- Tabs for collection navigation.
- Progressive loading — data appears as it arrives.
- Plain-language error messages with recovery actions.
- Responsive layout (desktop + mobile).

### V. Modern Frontend Practices

- **PASS**: TypeScript strict, no `any`.
- Component-based architecture via React + ShadCN.
- WCAG 2.1 AA via Radix UI accessibility primitives.
- Tailwind v4 for styling.

### Post-Design Re-check

All five principles verified after Phase 1 design. No
violations. The API proxy architecture (R4) is the only area
requiring careful implementation to maintain privacy guarantees.

## Project Structure

### Documentation (this feature)

```text
specs/001-whoop-data-explorer/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-proxy.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit.tasks output (not yet created)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/              # ShadCN components (Tabs, Table, Button, etc.)
│   ├── tables/          # Collection-specific table column definitions
│   │   ├── sleep-columns.tsx
│   │   ├── cycles-columns.tsx
│   │   ├── recovery-columns.tsx
│   │   └── workouts-columns.tsx
│   ├── data-table.tsx   # Reusable ShadCN DataTable (TanStack Table)
│   ├── summary-stats.tsx
│   ├── date-range-selector.tsx
│   └── layout/
│       ├── app-shell.tsx
│       ├── nav-tabs.tsx
│       └── auth-guard.tsx
├── hooks/
│   ├── use-auth.ts      # OAuth state management
│   ├── use-whoop-data.ts  # TanStack Query hooks for collections
│   └── use-excel-export.ts
├── lib/
│   ├── whoop-api.ts     # API client (calls /api/whoop/* proxy)
│   ├── auth.ts          # Token storage/refresh logic
│   ├── types.ts         # TypeScript types for all entities
│   ├── formatters.ts    # Duration, percentage, number formatting
│   └── query-config.ts  # TanStack Query + persister setup
├── pages/
│   ├── landing.tsx       # Unauthenticated landing page
│   ├── sleep.tsx
│   ├── cycles.tsx
│   ├── recovery.tsx
│   └── workouts.tsx
├── App.tsx
├── main.tsx
└── index.css            # Tailwind v4 entry

api/
├── auth/
│   ├── callback.ts      # OAuth token exchange
│   └── refresh.ts       # Token refresh
└── whoop/
    └── [...path].ts     # Catch-all WHOOP API proxy

tests/
├── unit/
│   ├── formatters.test.ts
│   ├── auth.test.ts
│   └── types.test.ts
└── integration/
    ├── sleep-table.test.tsx
    ├── cycles-table.test.tsx
    ├── recovery-table.test.tsx
    ├── workouts-table.test.tsx
    ├── date-range.test.tsx
    └── excel-export.test.tsx
```

**Structure Decision**: Single project layout. The `api/`
directory at root is Vercel's convention for serverless
functions — it is not a separate backend project. The SPA lives
in `src/` and the serverless proxy in `api/`. Both deploy as a
single Vercel project.

## Complexity Tracking

No constitution violations to justify. All principles pass.
