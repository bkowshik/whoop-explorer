# Research: Complete API Columns in Data Tables

**Feature**: 004-complete-api-columns | **Date**: 2026-03-10

## R1: Column Visibility & Reorder with TanStack Table

**Decision**: Use TanStack Table's built-in `columnVisibility` and `columnOrder` state features.

**Rationale**: TanStack Table v8 already provides first-class support for column visibility (`setColumnVisibility`) and column ordering (`setColumnOrder`). These are reactive state objects that integrate directly with `useReactTable`. No additional library needed for the toggle/reorder logic.

**Alternatives considered**:
- Custom state management with React context: Rejected — duplicates what TanStack Table already provides.
- Third-party table plugin: Rejected — unnecessary dependency for built-in functionality.

## R2: Drag-to-Reorder in Columns Dropdown

**Decision**: Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag-to-reorder in the Columns dropdown.

**Rationale**: `@dnd-kit` is the modern React DnD library — lightweight (~10KB gzipped for core + sortable), accessible (keyboard + screen reader support), performant, and actively maintained. It works well in dropdown/popover contexts. The project has no existing DnD library.

**Alternatives considered**:
- `react-beautiful-dnd`: Deprecated, no longer maintained. Rejected.
- HTML5 drag-and-drop API: Poor accessibility, inconsistent mobile support. Rejected.
- CSS-only reorder (up/down buttons): Simpler but poor UX for many columns. Rejected — the tables will have 10-20+ columns each, so drag is justified.

## R3: Columns Dropdown UI Component

**Decision**: Use Radix UI `Popover` for the dropdown container (already in the project's dependency tree via `radix-ui`).

**Rationale**: The project already uses Radix UI primitives. A Popover provides accessible, keyboard-navigable, dismissible overlay. No new dependency needed.

**Alternatives considered**:
- shadcn `DropdownMenu`: Could work but less flexible for embedding DnD sortable lists inside.
- Custom dropdown: More work, less accessible. Rejected.

## R4: Column Preference Persistence

**Decision**: Store preferences in localStorage under a per-table key (e.g., `whoop_columns_sleep`).

**Rationale**: localStorage is already used for auth tokens. Column preferences are small JSON objects (column IDs + visibility booleans + order array). localStorage is synchronous, simple, and sufficient. No need for IndexedDB complexity.

**Storage format**:
```json
{
  "visibility": { "createdAt": false, "updatedAt": false, "id": false },
  "order": ["date", "duration", "efficiency", ...]
}
```

**Migration strategy**: If a stored preference references unknown column IDs (from a future update), those entries are ignored. New columns not in stored preferences use their default visibility.

**Alternatives considered**:
- IndexedDB via idb-keyval: Overkill for small preference objects. Async adds complexity.
- Cookie storage: Size limits, not appropriate. Rejected.

## R5: Body Measurement API Endpoint

**Decision**: Add `user/body_measurement` to the API proxy allowlist and create a new `fetchBodyMeasurement()` function.

**Rationale**: The WHOOP API v2 endpoint is `GET /developer/v2/user/body_measurement`. This is a single-record endpoint (not paginated), so it doesn't use the `fetchCollection` pattern. A simple fetch function is appropriate.

**Alternatives considered**:
- Fetch directly from browser without proxy: Rejected — violates existing architecture where all WHOOP API calls go through the Vercel proxy for CORS.

## R6: Date/Time Formatting

**Decision**: Add a `formatDateTime` formatter that shows both date and time (e.g., "Mar 10, 10:30 PM").

**Rationale**: The existing `formatDate` only shows "Mon DD". A new formatter preserves the existing function (used elsewhere) and adds date+time display. Uses `Intl.DateTimeFormat` for locale-aware formatting.

**Format**: `toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })`

**Alternatives considered**:
- Modify existing `formatDate`: Rejected — would change behavior everywhere it's used.
- Use a date library (dayjs, date-fns): Rejected — Intl.DateTimeFormat is sufficient and adds no dependency.

## R7: Cycle Relationship Resolution

**Decision**: Pass cycle data as a lookup map to sleep/recovery tables for resolving cycle IDs to human-readable dates.

**Rationale**: Pages already fetch data via `useWhoopData`. The sleep and recovery pages can additionally fetch cycles for the same date range and build a `Map<number, string>` (cycleId → cycle start date). This map is passed to column definitions via TanStack Table's `meta` property. No global state needed.

**Alternatives considered**:
- Global context/store for cycles: Rejected — YAGNI. Each page can fetch its own cycle data.
- Pre-join in the API layer: Not possible — WHOOP API doesn't support joins.
