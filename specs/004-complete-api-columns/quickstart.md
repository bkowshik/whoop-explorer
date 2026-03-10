# Quickstart: Complete API Columns in Data Tables

**Feature**: 004-complete-api-columns | **Date**: 2026-03-10

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
git checkout 004-complete-api-columns
npm install
npm run dev
```

## Key Files to Understand

| What | Where |
|------|-------|
| TypeScript interfaces | `src/lib/types.ts` |
| API response mappers | `src/lib/whoop-api.ts` |
| Formatters (date, duration, %) | `src/lib/formatters.ts` |
| DataTable component | `src/components/data-table.tsx` |
| Column definitions | `src/components/tables/*-columns.tsx` |
| Page components | `src/pages/{sleep,cycles,recovery,workouts}.tsx` |
| API proxy + allowlist | `api/whoop/index.ts` |
| Tests | `tests/unit/` |

## Architecture Overview

**Data flow**: WHOOP API → Vercel proxy → `whoop-api.ts` mappers → TanStack Query cache → Page component → DataTable

**Column system**: Each table has a column definition file (`*-columns.tsx`) that exports a `ColumnDef[]` array. The DataTable component receives columns + data and renders via TanStack Table.

**This feature adds**:
1. New fields to TypeScript interfaces + mappers (sleep needed, workout zones, etc.)
2. New column definitions for all missing fields
3. Column visibility/reorder dropdown using TanStack Table's built-in state
4. localStorage persistence for column preferences
5. Body measurement card (new API endpoint)

## Development Workflow

This project follows **TDD** (constitution Principle II):

1. Write failing tests first
2. Implement until tests pass
3. Refactor

```bash
npm test          # Run all tests
npm run lint      # Lint check
```

## New Dependencies Needed

| Package | Purpose | Size |
|---------|---------|------|
| `@dnd-kit/core` | Drag-and-drop primitives | ~10KB gzip |
| `@dnd-kit/sortable` | Sortable list for column reorder | ~5KB gzip |

## Key Patterns

### Adding a new column to a table

1. Add field to interface in `src/lib/types.ts`
2. Map from API response in `src/lib/whoop-api.ts`
3. Add formatter if needed in `src/lib/formatters.ts`
4. Add column definition in `src/components/tables/*-columns.tsx`
5. Set default visibility (visible or hidden)

### Column visibility defaults

Each column definition includes a `meta.defaultVisible` property:
- `true` (default): Column shown on first load
- `false`: Column hidden but available in Columns dropdown

### Persistence format

```json
// localStorage key: whoop_columns_sleep
{
  "visibility": { "createdAt": false, "id": false },
  "order": ["date", "end", "duration", "efficiency", ...]
}
```
