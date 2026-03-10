# Feature Specification: Table Readability Improvements

**Feature Branch**: `005-table-readability`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "Improve table for reading: Move unit to column header, use hours for duration, add duration column in cycles, skin temperature shows value only, percentage columns keep %, use Geist mono font with numeric alignment, fix body API 502"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Numeric Columns with Units in Headers (Priority: P1)

A user viewing any data table (sleep, cycles, recovery, workouts) sees units displayed in the column header rather than repeated in every cell. For example, instead of a column header "Skin Temp" with cells showing "36.5°C", the header reads "Skin Temp (°C)" and cells show just "36.5". This reduces visual clutter and makes scanning columns of numbers faster.

**Why this priority**: This is the highest-impact visual change — it affects every numeric column across all four tables, immediately reducing noise and improving scannability.

**Independent Test**: Can be tested by loading any table view and confirming that units appear only in column headers, not in individual cells. Percentage columns retain the "%" symbol in cells since percentages are conventionally displayed inline.

**Acceptance Scenarios**:

1. **Given** a user views the recovery table, **When** they look at the "Skin Temp" column, **Then** the header reads "Skin Temp (°C)" and cells display only the numeric value (e.g., "36.5").
2. **Given** a user views any table with duration columns, **When** they look at the column header, **Then** it includes "(hrs)" and cells show decimal hours (e.g., "8.25") instead of "8h 15m".
3. **Given** a user views a column representing a percentage (e.g., recovery score), **When** they look at the cells, **Then** the "%" symbol remains in each cell (e.g., "72%") as this is a universally understood inline notation.
4. **Given** a user views the body measurement card, **When** values are displayed, **Then** units appear in the label/header and not repeated with each value.

---

### User Story 2 - Consistent Duration Formatting in Hours (Priority: P1)

A user viewing duration values across all tables sees them expressed consistently in decimal hours. A new "Duration" column is added to the cycles table, calculated from the difference between cycle start and end times.

**Why this priority**: Duration consistency is critical for comparing values across tables and for quick mental arithmetic. Adding the cycles duration column fills a data gap users expect.

**Independent Test**: Can be tested by loading each table and confirming all duration columns use decimal hours, and by verifying the cycles table now includes a "Duration (hrs)" column.

**Acceptance Scenarios**:

1. **Given** a user views the sleep table, **When** they look at any duration column, **Then** values are displayed as decimal hours rounded to two decimal places (e.g., "7.50" instead of "7h 30m").
2. **Given** a user views the cycles table, **When** they look at the columns, **Then** a "Duration (hrs)" column exists showing the time difference between cycle start and end.
3. **Given** a cycle has no end time (still in progress), **When** the duration column is displayed, **Then** it shows an em dash "—" to indicate the value is unavailable.

---

### User Story 3 - Monospace Font with Numeric Alignment (Priority: P2)

A user viewing the data tables sees all numeric values rendered in the Geist Mono font with proper comma-separated thousands and right-aligned numbers. This makes it easy to visually compare values vertically within a column.

**Why this priority**: Typography improvements significantly aid readability for data-heavy tables but are secondary to getting the data formatting correct first.

**Independent Test**: Can be tested by loading any table and visually confirming numbers use a monospace font, large numbers include comma separators, and decimal points align vertically within a column.

**Acceptance Scenarios**:

1. **Given** a user views any data table, **When** they look at numeric cells, **Then** the values are rendered in Geist Mono font.
2. **Given** a numeric value is 1,000 or greater, **When** it is displayed in a table cell, **Then** it includes comma separators (e.g., "1,234" not "1234").
3. **Given** a column contains decimal values, **When** the user scans the column vertically, **Then** decimal points are visually aligned through consistent decimal place formatting and right-alignment of numeric cells.
4. **Given** the Geist Mono font fails to load, **When** the table renders, **Then** a fallback monospace font is used so numeric alignment is preserved.

---

### User Story 5 - Visual Row Differentiation (Priority: P2)

A user scanning a data table can easily track values across a row thanks to subtle alternating row background tints and a hover highlight on the row under the cursor. This prevents the eye from drifting to adjacent rows when reading wide tables with many columns.

**Why this priority**: Row-level visual styling complements the column-level formatting improvements (units, alignment) by aiding horizontal readability. It is a polish item that builds on the core formatting work.

**Independent Test**: Can be tested by loading any table with multiple rows and confirming alternating rows have a barely perceptible background tint difference, and that hovering over a row applies a visible highlight.

**Acceptance Scenarios**:

1. **Given** a user views any data table, **When** they look at the rows, **Then** even and odd rows have a subtle background tint difference (low-contrast alternating shade).
2. **Given** a user hovers over a table row, **When** the cursor is on that row, **Then** the row receives a distinct highlight that is more prominent than the alternating tint.
3. **Given** a table has only one row, **When** the user views it, **Then** the row still displays correctly without visual artifacts from the alternating pattern.

---

### User Story 4 - Fix Body Measurement API Error (Priority: P1)

A user navigating to the body measurement section sees their data load successfully instead of encountering a 502 Bad Gateway error. The API endpoint for body measurement returns data correctly.

**Why this priority**: A broken API endpoint is a functional bug that prevents users from accessing their data entirely — this is a blocking defect.

**Independent Test**: Can be tested by making a request to the body measurement API endpoint and confirming it returns a 200 response with valid body measurement data.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they navigate to the body measurement section, **Then** their height, weight, and max heart rate load and display correctly.
2. **Given** the upstream WHOOP API is unavailable, **When** the body measurement request fails, **Then** the user sees a clear error message rather than a raw 502 error.

---

### Edge Cases

- What happens when a duration value is exactly 0 milliseconds? Display "0.00" hours.
- What happens when a numeric value is null or missing? Display an em dash "—" consistently across all columns.
- What happens when a cycle is in progress and has no end time? Show "—" for the duration.
- What happens when the Geist Mono web font fails to load? Fall back to system monospace font.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display measurement units in column headers rather than repeating them in every cell, using the format "Column Name (unit)".
- **FR-002**: System MUST display all duration values as decimal hours rounded to two decimal places across all tables (sleep, cycles, recovery, workouts).
- **FR-003**: System MUST add a "Duration (hrs)" column to the cycles table, computed from the difference between cycle start and end timestamps.
- **FR-004**: System MUST retain the "%" symbol inline in cells for percentage columns (e.g., recovery score, SpO2).
- **FR-005**: System MUST render all numeric table cells using a monospace font with appropriate fallbacks.
- **FR-006**: System MUST format numbers 1,000 or greater with comma thousands separators.
- **FR-007**: System MUST right-align numeric cells and use consistent decimal places within each column for vertical alignment.
- **FR-008**: System MUST display null or missing numeric values as an em dash "—".
- **FR-009**: The body measurement endpoint MUST return a successful response with valid data for authenticated users.
- **FR-010**: The body measurement display MUST follow the same unit-in-header convention as table columns.
- **FR-011**: System MUST apply a subtle alternating background tint to even/odd table rows across all four tables.
- **FR-012**: System MUST highlight the table row under the user's cursor with a visually distinct hover state.
- **FR-013**: System MUST use moderate row density (balanced vertical padding — neither generous nor tight) across all tables.
- **FR-014**: System MUST keep table column headers pinned (sticky) at the top of the table viewport while the user scrolls through rows.

### Key Entities

- **Column Definition**: Describes a table column including its identifier, display name (with unit in header), data accessor, cell formatter, and alignment.
- **Duration Value**: A time span derived from milliseconds, consistently presented as decimal hours across all views.
- **Body Measurement**: A user's physical metrics (height, weight, max heart rate) retrieved from the WHOOP API.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All numeric columns across all four tables display units exclusively in headers, with zero unit strings appearing in cell values (except "%" in percentage columns).
- **SC-002**: All duration values across all tables are expressed in decimal hours with exactly two decimal places.
- **SC-003**: The cycles table includes a computed Duration column that accurately reflects the time between cycle start and end.
- **SC-004**: All numeric table cells render in a monospace font, and numbers 1,000+ include comma separators.
- **SC-005**: Users can successfully load body measurement data without encountering a 502 error.
- **SC-006**: Vertical scanning of numeric columns is improved through consistent right-alignment and decimal place formatting.
- **SC-007**: All four tables display subtle alternating row tints and a hover highlight, aiding horizontal row tracking across wide tables.

## Clarifications

### Session 2026-03-10

- Q: What table row visual differentiation approach should be used? → A: Subtle alternating row tint (very low-contrast background shift) + row hover highlight.
- Q: What table row density should be used? → A: Moderate — balanced vertical padding, neither generous nor tight.
- Q: Should table headers be sticky when scrolling? → A: Yes — headers stick to the top of the table viewport while scrolling.

## Assumptions

- Geist Mono is a freely available web font that can be loaded via a CDN or bundled with the application.
- Decimal hours (e.g., "7.50") is more useful for quick comparison than the current "7h 30m" format for this data-dense table context.
- The body measurement 502 error is caused by an issue in the serverless proxy function (e.g., path routing, WHOOP API contract change) rather than an authentication problem.
- Percentage values (like recovery score, SpO2) are best kept with inline "%" since users universally recognize this notation without needing a header hint.
- Two decimal places for hours provides sufficient precision for sleep and cycle durations.
