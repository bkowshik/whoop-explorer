# Quickstart: Table Readability Improvements

**Feature**: 005-table-readability
**Date**: 2026-03-10

## Prerequisites

- Node.js 18+ installed
- `npm install` completed at repo root
- Existing WHOOP OAuth tokens for testing API fixes

## Key Files to Modify

| File | Change Summary |
|------|---------------|
| `src/lib/formatters.ts` | Update `formatDuration` to decimal hours, update `formatMeters` to drop unit, add `formatNumber` |
| `src/components/tables/sleep-columns.tsx` | Add `meta.unit` and `meta.align` to all column defs, update headers |
| `src/components/tables/cycles-columns.tsx` | Same as above + add Duration computed column |
| `src/components/tables/recovery-columns.tsx` | Same + fix skin temp inline formatter to use shared formatter |
| `src/components/tables/workouts-columns.tsx` | Same as sleep columns |
| `src/components/data-table.tsx` | Read `meta.align`/`meta.unit` for rendering, add zebra rows, hover, sticky headers, moderate density |
| `src/components/body-measurements.tsx` | Move units to labels |
| `src/index.css` | Import Geist Mono font, add table styling variables |
| `index.html` | No changes needed (font loaded via CSS) |
| `api/whoop/index.ts` | Debug and fix body_measurement path handling |

## Development Workflow

1. **Install Geist font**: `npm install geist`
2. **Run tests**: `npm test` (verify existing tests pass before changes)
3. **TDD cycle**: Write failing tests → implement → verify green
4. **Dev server**: `npm run dev` for visual verification
5. **Lint**: `npm run lint` before committing

## Testing Strategy

- **Unit tests** for all formatter functions (formatDuration, formatNumber, formatMeters)
- **Unit tests** for cycles Duration column accessor (computed from start/end)
- **Integration test** for body measurement API proxy (mock upstream responses)
- **Visual verification** for font, alignment, zebra rows, sticky headers (manual)

## Implementation Order

1. Formatters (foundation — everything else depends on these)
2. Column definitions (uses updated formatters)
3. DataTable component (table-level styling)
4. Global CSS / font loading
5. Body measurements component
6. API proxy fix (independent, can be done in parallel)
