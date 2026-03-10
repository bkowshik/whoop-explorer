# Feature Specification: WHOOP Data Explorer

**Feature Branch**: `001-whoop-data-explorer`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "Complete OAuth with Whoop v2 APIs, Fetch data from all collections Sleep, Cycles, Recovery and Workouts, Provide option to download as Excel, Summarize metrics appropriately so that users can switch between different data, fully client side with no health data coming to any server, Host on vercel"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect WHOOP Account (Priority: P1)

A user opens the app and connects their WHOOP account to access
their health data. They click a "Connect WHOOP" button, complete
the WHOOP OAuth login in a popup or redirect, and return to the
app authenticated. The app then fetches their recent data from
all four collections (Sleep, Cycles, Recovery, Workouts) and
displays a confirmation that data has been loaded.

**Why this priority**: Without authentication and data fetching,
no other feature can function. This is the foundation of the
entire app.

**Independent Test**: Can be tested by completing the OAuth flow
and verifying that data from all four WHOOP collections is
successfully loaded and visible in the app.

**Acceptance Scenarios**:

1. **Given** a user on the landing page, **When** they click
   "Connect WHOOP" and complete the OAuth login, **Then** they
   are redirected back to the app in an authenticated state.
2. **Given** an authenticated user, **When** the app loads their
   data, **Then** the most recent 7 days of data is fetched first
   across all four collections and displayed progressively — each
   collection view becomes usable as soon as its data arrives,
   without waiting for all collections to finish loading.
3. **Given** an authenticated user viewing their data, **When**
   they select a different date range (30 days or 90 days),
   **Then** already-loaded data remains visible while additional
   data loads in the background, and new records appear
   progressively as they arrive.
4. **Given** a user who denies the OAuth permission, **When**
   they are redirected back, **Then** the app shows a clear
   message explaining that access was not granted and offers to
   retry.
5. **Given** an authenticated user whose session has expired,
   **When** they return to the app, **Then** the app prompts
   them to reconnect rather than showing an error.
6. **Given** a returning user with a valid persisted token,
   **When** they open the app in a new browser session, **Then**
   they see their previously cached data immediately and fresh
   data loads in the background.

---

### User Story 2 - Explore Data Summaries (Priority: P2)

An authenticated user wants to browse their WHOOP data. They see
a dashboard with tabs or navigation for each data collection
(Sleep, Cycles, Recovery, Workouts). Each view shows summarized
metrics appropriate to that collection. Users can switch between
collections seamlessly.

**Why this priority**: This is the core value proposition — making
WHOOP data understandable and explorable. Once data is fetched,
users need a meaningful way to view it.

**Independent Test**: Can be tested by loading sample data and
verifying that each collection view displays the correct
summarized metrics and that navigation between views works.

**Acceptance Scenarios**:

1. **Given** an authenticated user with loaded data, **When**
   they view the Sleep collection, **Then** they see summarized
   sleep metrics including total sleep duration, sleep efficiency,
   disturbances, and time in each sleep stage (light, deep, REM).
2. **Given** an authenticated user with loaded data, **When**
   they view the Cycles collection, **Then** they see daily
   strain scores, calories burned, and average heart rate.
3. **Given** an authenticated user with loaded data, **When**
   they view the Recovery collection, **Then** they see recovery
   scores, HRV, resting heart rate, and SpO2 values.
4. **Given** an authenticated user with loaded data, **When**
   they view the Workouts collection, **Then** they see workout
   type, duration, strain, average/max heart rate, and calories.
5. **Given** a user on any collection view, **When** they switch
   to a different collection, **Then** the view transitions
   smoothly without a full page reload.
6. **Given** a user viewing a collection, **When** the data
   contains many records, **Then** metrics are displayed in a
   tabular format ordered by most recent first, with aggregate
   summary statistics at the top. No drill-down into individual
   records; the table is the deepest view.

---

### User Story 3 - Download Data as Excel (Priority: P3)

A user wants to download their WHOOP data as an Excel file for
offline analysis, sharing with a doctor, or personal record
keeping. They click a download button and receive an Excel file
containing their data organized by collection.

**Why this priority**: Data portability is important but secondary
to viewing. Users first need to see their data before deciding to
download it.

**Independent Test**: Can be tested by clicking the download
button and verifying the resulting Excel file contains the
correct data with proper formatting.

**Acceptance Scenarios**:

1. **Given** an authenticated user with loaded data, **When**
   they click "Download as Excel", **Then** an Excel file is
   generated and downloaded to their device.
2. **Given** the downloaded Excel file, **When** opened in a
   spreadsheet application, **Then** it contains one sheet per
   collection (Sleep, Cycles, Recovery, Workouts) with
   appropriately labeled columns.
3. **Given** a user viewing a specific collection, **When** they
   click download, **Then** they can choose to download all
   collections or only the currently viewed collection.
4. **Given** a user triggering a download, **When** the file is
   being generated, **Then** a progress indicator is shown and
   the file is generated entirely in the browser (no data sent
   to any server).

---

### Edge Cases

- What happens when the WHOOP API is temporarily unavailable?
  The app displays a user-friendly error with a retry option.
- What happens when a user has no data for a specific collection
  (e.g., no workouts)? The collection view shows an empty state
  message rather than an error.
- What happens when the OAuth token expires mid-session? The app
  detects the expired token and prompts the user to reconnect.
- What happens when a user selects the 90-day range with a lot
  of data? Data is fetched progressively with pagination; already-
  loaded records display immediately while the rest loads.
- What happens on a slow network connection? Loading states are
  shown during data fetching with the option to cancel.
- What happens if the browser does not support required features?
  A clear message informs the user which browser to use.
- What happens when a user disconnects their account? All locally
  cached health data is immediately and permanently cleared from
  browser storage and memory.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users via WHOOP OAuth2
  (v2 API) without requiring users to manage API keys.
- **FR-002**: System MUST fetch data from all four WHOOP
  collections: Sleep, Cycles, Recovery, and Workouts.
- **FR-003**: System MUST handle paginated responses from the
  WHOOP API to retrieve complete datasets.
- **FR-012**: System MUST fetch data progressively — displaying
  available records immediately while continuing to fetch
  remaining pages in the background.
- **FR-013**: System MUST default to a 7-day date range and
  provide user-selectable options for 30-day and 90-day ranges.
- **FR-014**: When switching date ranges, system MUST retain
  already-loaded data on screen and fetch only the additional
  date range incrementally.
- **FR-015**: System MUST cache fetched data in the browser so
  that navigating between collection views or revisiting a
  date range does not trigger redundant API requests.
- **FR-017**: System MUST persist OAuth tokens and cached health
  data in browser storage across sessions. Returning users MUST
  see their previously loaded data immediately without waiting
  for a fresh API fetch.
- **FR-018**: System MUST keep cached data fresh by fetching
  updates from the WHOOP API when the user returns, merging new
  records into the existing cache without disrupting the view.
- **FR-004**: System MUST display each collection as a data table
  with columns matching the key metrics for that collection.
  Aggregate summary statistics MUST appear above the table.
  No individual record detail views; the table is the deepest
  level of interaction.
- **FR-005**: System MUST allow users to navigate between the
  four collection views without full page reloads.
- **FR-006**: System MUST generate Excel files entirely in the
  browser with one sheet per collection.
- **FR-007**: System MUST NOT transmit, store, or log any user
  health data on any server. All health data processing happens
  in the browser.
- **FR-008**: System MUST provide clear loading states during
  data fetching and file generation.
- **FR-009**: System MUST handle authentication errors (denied
  permissions, expired tokens) with plain-language messages and
  recovery actions.
- **FR-016**: System MUST immediately and permanently delete all
  locally cached health data (browser storage, in-memory caches)
  when a user disconnects their WHOOP account.
- **FR-010**: System MUST be deployable as a static site on
  Vercel (with a minimal serverless function for OAuth token
  exchange only — no health data passes through the server).
- **FR-011**: System MUST display data ordered by most recent
  first within each collection table.

### Key Entities

- **Sleep Record**: A single night's sleep data — total duration,
  efficiency percentage, disturbances count, time in each stage
  (light, deep, REM, awake), start/end timestamps.
- **Cycle**: A single day's physiological cycle — strain score,
  kilojoules burned, average heart rate, max heart rate,
  start/end timestamps.
- **Recovery**: A single day's recovery measurement — recovery
  score (0–100%), HRV (heart rate variability in ms), resting
  heart rate, SpO2 percentage.
- **Workout**: A single workout session — sport/activity type,
  duration, strain score, average heart rate, max heart rate,
  calories burned, start/end timestamps.
- **User Session**: The authenticated state — OAuth tokens
  (stored only in browser memory/storage), token expiry,
  connected WHOOP user identity.

### Assumptions

- The WHOOP v2 API requires an OAuth2 Authorization Code flow
  with a client secret, which cannot be safely embedded in
  client-side code. A minimal Vercel serverless function handles
  ONLY the token exchange. No health data flows through this
  function. This is consistent with the "no health data on
  server" principle.
- The app fetches the most recent 7 days of data by default.
  Users can switch to 30-day or 90-day ranges.
- Data fetching is progressive: available records are displayed
  immediately while remaining pages load in the background.
- Client-side caching (via TanStack Query) prevents redundant
  API calls when navigating between views or revisiting ranges.
- UI components use the ShadCN component library.
- WHOOP API rate limits are respected; the app does not make
  concurrent bulk requests.
- The app targets modern evergreen browsers (Chrome, Firefox,
  Safari, Edge — latest 2 versions).

## Clarifications

### Session 2026-03-03

- Q: When a user disconnects, what happens to cached data? → A: All locally cached health data is cleared immediately on disconnect.
- Q: What happens when a returning user opens the app in a new session? → A: OAuth token and health data are persisted locally across browser sessions. Returning users see their cached data immediately.
- Q: Can users drill into individual record details? → A: No. Each collection displays as a tabular view only. Visualizations and detail views are deferred to a future iteration. Prioritize privacy and simplicity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can connect their WHOOP account and see their
  data within 60 seconds of first opening the app.
- **SC-002**: Users can switch between any two collection views
  in under 1 second.
- **SC-003**: Users can download an Excel file of their data
  within 10 seconds of clicking the download button (for 30 days
  of data).
- **SC-004**: 90% of first-time users can complete the connect →
  explore → download flow without needing external help.
- **SC-005**: Zero user health data is transmitted to any server
  (verifiable by network traffic inspection).
- **SC-006**: The app loads and becomes interactive within
  3 seconds on a standard broadband connection.
- **SC-007**: All collection views display correctly on both
  desktop (1024px+) and mobile (375px+) screen sizes.
