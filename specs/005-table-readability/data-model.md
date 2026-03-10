# Data Model: Table Readability Improvements

**Feature**: 005-table-readability
**Date**: 2026-03-10

## Modified Entities

### ColumnMeta (Extended)

The existing TanStack Table `ColumnMeta` type is extended with alignment and unit metadata.

**Fields**:
- `defaultVisible: boolean` — Whether column is shown by default (existing)
- `align: "left" | "right"` — Cell text alignment; "right" for numeric columns (new)
- `unit: string | undefined` — Unit string to append to header (e.g., "hrs", "°C", "bpm") (new)

**Usage**: Column definitions declare `meta.align` and `meta.unit`. The DataTable component reads these to apply CSS classes and format headers.

### Formatter Functions (Modified)

| Formatter | Current Output | New Output | Notes |
|-----------|---------------|------------|-------|
| `formatDuration(ms)` | `"8h 15m"` | `"8.25"` | Decimal hours, 2 decimal places |
| `formatDecimal(v, places)` | `"36.5"` | `"36.5"` | No change |
| `formatPercentage(v)` | `"72%"` | `"72%"` | No change (% stays inline) |
| `formatInteger(v)` | `"150"` | `"150"` | No change for small numbers |
| `formatMeters(m)` | `"5.2 km"` | `"5.2"` | Unit moves to header |
| `formatKjToKcal(kj)` | `"2,345"` | `"2,345"` | Already uses toLocaleString |
| `formatNumber(v, places)` | N/A | `"1,234.56"` | New: generic formatter with commas |

### Cycles Table — Duration Column (New)

**Column ID**: `duration`
**Header**: `Duration` (with `meta.unit: "hrs"` → displays as "Duration (hrs)")
**Accessor**: Computed from `end - start` timestamps, converted to decimal hours
**Null handling**: If `end` is null/undefined, display "—"

### Body Measurement Display (Modified)

Units move from value strings to labels:

| Field | Current Display | New Display |
|-------|----------------|-------------|
| Height | `"1.83 m"` | Label: `"Height (m)"`, Value: `"1.83"` |
| Weight | `"84.5 kg"` | Label: `"Weight (kg)"`, Value: `"84.5"` |
| Max HR | `"195 bpm"` | Label: `"Max Heart Rate (bpm)"`, Value: `"195"` |

## No New Entities

No new data types, API contracts, or storage schemas are introduced. All changes modify existing display logic.
