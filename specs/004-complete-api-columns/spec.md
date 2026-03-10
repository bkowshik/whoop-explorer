# Feature Specification: Complete API Columns in Data Tables

**Feature Branch**: `004-complete-api-columns`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "Identify columns available in the API but not shown in the tables of sleep, cycles, recovery, workouts, etc and add them in so that users can see all data available from the WHOOP api in the table."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Show Full Start/End Times Across All Tables (Priority: P1)

As a user viewing my sleep, cycle, or workout data, I want to see the actual start and end times (not just the date), so I can understand exactly when each event began and ended.

**Why this priority**: Currently the "Date" column in sleep, cycles, and workouts tables only shows "Mon DD" (e.g., "Mar 10"), completely dropping the time component. Start/end times are fundamental to understanding when events occurred and are already available in the API data — they're just not being displayed.

**Independent Test**: Can be fully tested by loading any table and verifying that start times include the time of day (e.g., "Mar 10, 10:30 PM") and end times appear as a new column.

**Acceptance Scenarios**:

1. **Given** the user is on the sleep page with loaded data, **When** they view the table, **Then** the existing Date column shows both date and time (e.g., "Mar 10, 10:30 PM") and a new End Time column is visible.
2. **Given** the user is on the cycles page, **When** they view the table, **Then** the Date column shows the cycle start date and time, and a new End Time column shows when the cycle ended.
3. **Given** the user is on the workouts page, **When** they view the table, **Then** the Date column shows the workout start date and time (the end time is already captured via the Duration column).

---

### User Story 2 - View Missing Sleep Columns (Priority: P1)

As a user viewing my sleep data, I want to see all available sleep fields including sleep cycle count, nap indicator, sleep consistency, no-data time, and the full sleep needed breakdown, so I can get a complete picture of my sleep without needing to export raw data.

**Why this priority**: Sleep is the most data-rich entity with many missing columns. The sleep needed breakdown (baseline, sleep debt, strain need, nap reduction) is unique to WHOOP and helps users understand why a certain amount of sleep is recommended. Sleep consistency percentage and no-data time provide additional quality insights.

**Independent Test**: Can be fully tested by loading the sleep table and verifying that all new columns appear with correctly formatted values.

**Acceptance Scenarios**:

1. **Given** the user is on the sleep page with loaded data, **When** they view the table, **Then** they see columns for Sleep Cycles, Nap (yes/no), Consistency, No Data Time, Baseline Need, Sleep Debt, Strain Need, and Nap Reduction in addition to all existing columns.
2. **Given** a sleep record has null values for any new field, **When** the table renders, **Then** the cell displays a dash or empty indicator rather than "null" or "0".
3. **Given** a sleep record is marked as a nap, **When** the table renders, **Then** the Nap column clearly shows "Yes" (or equivalent indicator).
4. **Given** a sleep record has sleep needed data, **When** the table renders, **Then** each of the 4 sleep needed fields displays as a human-readable duration.

---

### User Story 3 - View Missing Workout Columns Including Zone Durations and Altitude (Priority: P1)

As a user viewing my workout data, I want to see altitude gain, altitude change, percent recorded, and heart rate zone durations, so I can analyze the full depth of my workout performance data.

**Why this priority**: Workout data has the most unmapped API fields (altitude gain/change, percent recorded, zone durations). These fields provide significant training insights that are completely invisible today.

**Independent Test**: Can be fully tested by loading the workouts table and verifying that new columns for altitude gain, altitude change, percent recorded, and zone duration data appear with correct values.

**Acceptance Scenarios**:

1. **Given** the user is on the workouts page with loaded data, **When** they view the table, **Then** they see additional columns for Altitude Gain, Altitude Change, and Percent Recorded.
2. **Given** a workout has heart rate zone duration data, **When** the table renders, **Then** zone durations are displayed (zones 0-5) in a readable time format.
3. **Given** a workout has no altitude data (e.g., indoor workout), **When** the table renders, **Then** altitude columns show a dash or empty indicator.

---

### User Story 4 - Surface Cycle Relationships Across Tables (Priority: P2)

As a user, I want to see which cycle each sleep record and recovery record belongs to, so I can understand how my daily physiological data connects together.

**Why this priority**: The WHOOP API structures data around "cycles" (physiological days). Sleep has a `cycleId` and recovery has a `cycleId`, but today these relationships are invisible (recovery shows a raw Cycle ID number with no context, sleep shows nothing). Surfacing the cycle link helps users correlate their daily recovery, sleep, and training. Workouts do not have an explicit cycle reference in the API and are excluded from this story.

**Independent Test**: Can be fully tested by loading the sleep table and verifying a Cycle column appears that matches the corresponding cycle's date, and similarly for recovery.

**Acceptance Scenarios**:

1. **Given** the user is on the sleep page with loaded data, **When** they view the table, **Then** they see a Cycle column showing the cycle date that each sleep record belongs to.
2. **Given** the user is on the recovery page with loaded data, **When** they view the table, **Then** the existing Cycle ID column is replaced with a human-readable cycle date reference instead of a raw numeric ID.
3. **Given** a sleep or recovery record references a cycle ID that is not in the loaded cycle data, **When** the table renders, **Then** the Cycle column shows the raw cycle ID as a fallback.

---

### User Story 5 - Column Visibility Toggle (Priority: P1)

As a user viewing any data table, I want a "Columns" dropdown that lets me toggle visibility and reorder any column, so I can customize the table layout to focus on the data that matters most to me.

**Why this priority**: With many new columns being added across all tables, users need full control over which columns are visible and in what order. Some columns (like created_at, updated_at, internal IDs) are hidden by default but should be accessible. This prevents table clutter while ensuring 100% of API data remains reachable.

**Independent Test**: Can be fully tested by clicking the Columns dropdown on any table, toggling columns on/off, reordering them, reloading the page, and verifying preferences are preserved.

**Acceptance Scenarios**:

1. **Given** the user is on any data table page, **When** they click the "Columns" dropdown, **Then** they see a list of all available columns for that table, each with a checkmark indicating whether it is currently visible.
2. **Given** the Columns dropdown is open, **When** the user unchecks a visible column, **Then** that column is immediately hidden from the table.
3. **Given** the Columns dropdown is open, **When** the user checks a hidden column, **Then** that column is immediately shown in the table.
4. **Given** certain columns are hidden by default (created_at, updated_at, internal IDs), **When** the user first loads the page, **Then** those columns are not visible in the table but appear unchecked in the Columns dropdown.
5. **Given** the user has toggled column visibility or reordered columns, **When** they reload the page, **Then** their column preferences (visibility and order) are preserved.
6. **Given** the Columns dropdown is open, **When** the user drags a column to a new position in the list, **Then** the table column order updates to match.
7. **Given** all columns in every table (existing and new) support visibility toggle and reordering, **When** the user customizes any table, **Then** the customization applies to all columns without exception.

---

### User Story 6 - View Body Measurements (Priority: P2)

As a user, I want to see my body measurements (height, weight, and WHOOP-calculated max heart rate) in the app, so I can review the physical profile data WHOOP has for me.

**Why this priority**: Body measurements is a separate, small endpoint with only 3 fields. It provides useful context but is not a data table like the other entities — it's a single-record display.

**Independent Test**: Can be fully tested by loading the body measurements section and verifying height, weight, and max heart rate are displayed with correct units.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they navigate to the Body page (new nav tab), **Then** they see their height (in meters), weight (in kilograms), and WHOOP-calculated max heart rate (in bpm) displayed as a card.
2. **Given** the API returns null for any body measurement field, **When** the section renders, **Then** the field shows a dash or empty indicator.

---

### Edge Cases

- What happens when the API returns null for newly added fields? Tables display a dash or empty indicator consistently.
- How does the table handle workout zone duration data when some zones have zero milliseconds? Zero-duration zones display as "0:00" or equivalent.
- What happens when altitude data is missing for indoor workouts? Altitude columns show a dash.
- How does the nap indicator display for sleep records where `isNap` is not present in older data? Default to showing a dash.
- What happens when a cycle is still in progress and has no end time? The `formatDateTime` formatter returns "—" for null input, which serves as the "in progress" indicator.
- What happens when a sleep/recovery record references a cycle ID that wasn't loaded (e.g., outside the date range)? Show the raw cycle ID as fallback.
- How are start/end times displayed across different timezones? Use the user's local browser timezone for display, consistent with existing date formatting.
- What happens when new columns are added in a future update but the user has saved preferences from before? New columns use their default visibility (shown or hidden) and appear in the Columns dropdown; existing preferences are preserved for known columns.
- How does drag-to-reorder work on mobile/touch devices? @dnd-kit includes touch sensor support out of the box, so drag-to-reorder works on mobile via touch-and-hold. No fallback UI (e.g., up/down buttons) is needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display start times with both date and time (not just date) in sleep, cycles, and workouts tables.
- **FR-002**: System MUST display end time as a formatted date/time column in the sleep table.
- **FR-003**: System MUST display end time as a formatted date/time column in the cycles table.
- **FR-004**: System MUST display sleep cycle count as a numeric column in the sleep table.
- **FR-005**: System MUST display a nap indicator as a Yes/No column in the sleep table.
- **FR-006**: System MUST display sleep consistency percentage in the sleep table.
- **FR-007**: System MUST display no-data time (total_no_data_time_milli) as a duration column in the sleep table.
- **FR-008**: System MUST display all 4 sleep needed breakdown fields as individual duration columns: Baseline Need, Sleep Debt, Strain Need, and Nap Reduction.
- **FR-009**: System MUST update the sleep data model and API response mapping to include the previously unmapped fields (sleep consistency percentage, no-data time, sleep needed breakdown).
- **FR-010**: System MUST map and display workout altitude gain in the workouts table, converted to appropriate units.
- **FR-011**: System MUST map and display workout altitude change in the workouts table, converted to appropriate units.
- **FR-012**: System MUST map and display workout percent recorded as a percentage in the workouts table.
- **FR-013**: System MUST map and display workout heart rate zone durations in the workouts table, showing time spent in each zone.
- **FR-014**: System MUST update the workout data model and API response mapping to include the previously unmapped fields (altitude gain, altitude change, percent recorded, zone durations).
- **FR-015**: System MUST show which cycle each sleep record belongs to, displaying the cycle date rather than a raw numeric ID.
- **FR-016**: System MUST replace the raw Cycle ID in the recovery table with a human-readable cycle date reference.
- **FR-017**: System MUST display the user calibrating indicator in the recovery table, showing whether the user's data is still calibrating.
- **FR-018**: System MUST update the recovery data model and API response mapping to include the user_calibrating field.
- **FR-019**: System MUST map created_at and updated_at fields for all entities (sleep, cycles, recovery, workouts) and include them as hidden-by-default columns in each table.
- **FR-020**: System MUST provide a "Columns" dropdown on every data table that lists all available columns with checkmarks to toggle visibility.
- **FR-021**: System MUST allow users to reorder columns via the Columns dropdown, and the table MUST reflect the new order immediately.
- **FR-022**: System MUST make all columns (existing and new) toggleable and reorderable — no columns are exempt.
- **FR-023**: System MUST hide metadata columns (created_at, updated_at) and internal ID columns by default, but allow users to show them via the Columns dropdown.
- **FR-024**: System MUST persist both column visibility and column order preferences in browser storage so they survive page reloads.
- **FR-025**: System MUST fetch and display body measurements (height, weight, max heart rate) in a dedicated section/card.
- **FR-026**: System MUST render null or missing values consistently across all tables and sections using a dash or empty indicator, never displaying "null", "undefined", or "NaN".

### Key Entities

- **Sleep Record**: Extended with start time (time component), end time, sleep cycle count, nap indicator, cycle reference, sleep consistency %, no-data time, and sleep needed breakdown (baseline, sleep debt, strain need, nap reduction). Total of 11 new/updated columns.
- **Workout Record**: Extended with start time (time component), altitude gain, altitude change, percent recorded, and zone durations (zones 0-5). Total of 4+ new/updated columns.
- **Cycle Record**: Extended with start time (time component) and end time. Total of 1 new column + 1 updated column.
- **Recovery Record**: Cycle ID column updated from raw number to human-readable cycle date. User calibrating indicator added. Total of 2 updated/new columns.
- **Body Measurement**: New entity displaying height (meters), weight (kilograms), and WHOOP-calculated max heart rate (bpm). Single-record display, not a table.

## Clarifications

### Session 2026-03-10

- Q: How should the sleep_needed breakdown (4 sub-fields) be displayed? → A: Show all 4 fields as individual columns (Baseline Need, Sleep Debt, Strain Need, Nap Reduction).
- Q: Should the Body Measurements endpoint (height, weight, max HR) be included in this feature? → A: Yes, include as a new section/card in the app.
- Q: Should metadata fields (created_at, updated_at) be shown in tables? → A: Hidden by default but viewable via a "Columns" dropdown that lists all available columns with checkmarks to toggle visibility.
- Q: Should column visibility preferences persist across page reloads? → A: Yes, persist in browser storage.
- Q: Should all columns support visibility toggle, or only new/metadata ones? → A: All columns in every table are toggleable. Additionally, users can reorder columns and that order persists in browser storage too.

## Assumptions

- All API fields are mapped and available in every table. Fields like raw IDs, sleep ID, timezone offset, score state, created_at, and updated_at are hidden by default but accessible via the Columns dropdown.
- Cycle ID is an exception: while it's an internal ID, it represents a meaningful relationship. It should be displayed as a human-readable cycle date, not a raw number.
- Altitude values from the WHOOP API are in meters and will be displayed in meters (with unit label).
- Zone durations from the API are in milliseconds and will be converted to a human-readable time format (minutes:seconds or similar).
- The existing table component supports adding new columns without layout changes (horizontal scrolling or responsive behavior already handles wide tables).
- Start/end times will be displayed in the user's local browser timezone, consistent with existing behavior.
- Resolving cycle references requires cycle data to be available when rendering sleep/recovery tables. If cycle data is not loaded for the referenced cycle ID, the raw ID is shown as fallback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All non-internal fields from every WHOOP API entity (sleep, cycles, recovery, workouts) are visible in their respective data tables.
- **SC-002**: Users can view 100% of the data returned by the WHOOP API without needing to export or inspect raw responses.
- **SC-003**: All null or missing values display consistently using a dash indicator across every table and every column.
- **SC-004**: Workout zone durations and altitude data are displayed in human-readable formats (time for durations, meters for altitude).
- **SC-005**: Users can see the exact time of day when sleep sessions, cycles, and workouts started, not just the date.
- **SC-006**: Users can understand which cycle each sleep and recovery record belongs to without needing to cross-reference raw IDs manually.
- **SC-007**: Users can toggle visibility and reorder any column in any table via a Columns dropdown, with preferences persisted across page reloads.
