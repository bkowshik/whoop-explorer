# Research: Table Readability Improvements

**Feature**: 005-table-readability
**Date**: 2026-03-10

## R1: Geist Mono Font Loading Strategy

**Decision**: Load Geist Mono via npm package `geist` and import in CSS.

**Rationale**: The `geist` npm package provides both Geist and Geist Mono as optimized WOFF2 files. Using the npm package avoids external CDN dependencies (aligning with privacy-first principle) and integrates cleanly with the Vite build pipeline. Tailwind CSS v4 supports custom font families via `@theme` inline configuration.

**Alternatives considered**:
- Google Fonts CDN: Rejected — external network dependency, potential privacy concerns (Google tracking).
- Self-hosted WOFF2 files: Viable but the npm package handles this automatically with proper subsetting.
- Fontsource package: Viable but Geist's official npm package is the canonical source.

## R2: Duration Format — Decimal Hours vs H:MM

**Decision**: Use decimal hours with 2 decimal places (e.g., "7.50") via `toFixed(2)`.

**Rationale**: Decimal hours enable quick mental arithmetic for comparison (7.50 vs 8.25 is immediately comparable). The existing `formatDuration` converts ms → "Xh YYm" which makes column scanning harder. Two decimal places provide minute-level precision (0.01 hr ≈ 36 seconds), sufficient for sleep/cycle durations.

**Alternatives considered**:
- Keep "Xh YYm": Rejected — user explicitly requested hours format.
- One decimal place: Rejected — loses precision (0.1 hr = 6 minutes, too coarse).
- Three decimal places: Rejected — excessive precision, visual clutter.

## R3: Number Formatting with Commas

**Decision**: Use `Intl.NumberFormat` for locale-aware comma formatting.

**Rationale**: `Intl.NumberFormat` is built into all modern browsers, handles thousands separators correctly, and respects the user's locale. For this project, we'll use `en-US` locale explicitly since the WHOOP API provides data in standard units.

**Alternatives considered**:
- Manual string manipulation: Rejected — error-prone, doesn't handle edge cases.
- `toLocaleString()`: Works but `Intl.NumberFormat` is more explicit and reusable.

## R4: Body Measurement 502 Root Cause

**Decision**: The 502 was caused by using the wrong WHOOP API endpoint path.

**Rationale**: The original implementation used `user/body_measurement` as the endpoint path, but the correct WHOOP API v2 endpoint is `user/measurement/body`. The old path returned 404 from the upstream WHOOP API, which the proxy surfaced as a 502. Confirmed by testing the upstream API directly and cross-referencing with the [whoopy Python client](https://github.com/felixnext/whoopy) which uses the correct `user/measurement/body` path.

**Alternatives considered**:
- Vercel rewrite/URL encoding issue: Investigated but the rewrite worked correctly — the upstream 404 was the root cause.
- Authentication issue: Ruled out — same token works for other endpoints.
- Rate limiting: Would show 429, not 502.

## R5: Table Styling — Alternating Rows and Hover

**Decision**: Use Tailwind CSS utility classes applied in the DataTable component with CSS custom properties for the tint colors.

**Rationale**: Tailwind v4 supports `even:` and `odd:` variants for alternating row styling, and `hover:` for row highlights. Using CSS custom properties (already established in the project's theme) keeps the colors consistent with the design system. No additional CSS framework needed.

**Alternatives considered**:
- CSS `:nth-child` in global CSS: Works but less composable than Tailwind utilities.
- Separate CSS module: Rejected — adds file complexity; Tailwind utilities are sufficient.

## R6: Sticky Headers

**Decision**: Apply `sticky top-0` positioning to the `<thead>` element with a background color and z-index.

**Rationale**: CSS `position: sticky` is supported in all modern browsers and works within scrollable containers. The table already renders inside a scrollable div. The header needs an opaque background to prevent content showing through when scrolling.

**Alternatives considered**:
- JavaScript-based scroll tracking: Rejected — CSS sticky is simpler and performant.
- Fixed header with separate scrollable body: Rejected — complex to sync column widths.

## R7: Numeric Right-Alignment

**Decision**: Add a `meta.align` property to column definitions and apply `text-right` class in the DataTable renderer for numeric columns.

**Rationale**: TanStack Table's `ColumnMeta` type can be extended to include alignment hints. The DataTable component reads `column.columnDef.meta?.align` and applies the appropriate Tailwind class. This keeps alignment logic declarative in column definitions rather than spread across formatters.

**Alternatives considered**:
- CSS `font-variant-numeric: tabular-nums`: Supplements alignment but doesn't replace `text-right` — use both.
- Per-formatter alignment: Rejected — mixes formatting and layout concerns.
