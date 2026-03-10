# Research: WHOOP Data Explorer

**Date**: 2026-03-03
**Branch**: `001-whoop-data-explorer`

## R1: WHOOP API v2 OAuth2 Flow

**Decision**: Use OAuth2 Authorization Code flow with a Vercel
serverless function for token exchange and refresh.

**Rationale**: WHOOP requires `client_secret` for token exchange
and explicitly prohibits exposing it in client-side code. PKCE is
not supported. A serverless function is the minimum viable
server-side component.

**Alternatives considered**:
- Pure client-side PKCE flow — not supported by WHOOP API.
- Embedding client_secret in browser — explicitly forbidden by
  WHOOP developer guidelines.

**Key details**:
- Authorization endpoint: `https://api.prod.whoop.com/oauth/oauth2/auth`
- Token endpoint: `https://api.prod.whoop.com/oauth/oauth2/token`
- Token exchange requires `client_secret_post` method
  (secret in form body, not Basic auth header)
- Access tokens expire in 3600 seconds (1 hour)
- Refresh tokens are supported (requires `offline` scope)
- Refresh also requires `client_secret` — must go through
  serverless function
- Both access_token and refresh_token are rotated on each refresh
- Required scopes: `offline read:profile read:cycles read:sleep
  read:recovery read:workout`

## R2: WHOOP API Endpoints and Data Format

**Decision**: Fetch from four collection endpoints using date
range parameters and cursor pagination.

**Rationale**: These are the documented v2 endpoints that map
directly to the four collections specified in the feature spec.

**API Base URL**: `https://api.prod.whoop.com/developer/v2`

**Endpoints**:

| Collection | Method | Path |
|------------|--------|------|
| Sleep | GET | `/activity/sleep` |
| Recovery | GET | `/activity/recovery` |
| Workouts | GET | `/activity/workout` |
| Cycles | GET | `/cycle` |
| Profile | GET | `/user/profile/basic` |

**Query parameters** (all collection endpoints):
- `start` — ISO 8601 datetime (inclusive)
- `end` — ISO 8601 datetime (exclusive)
- `limit` — 1-25 records per page (max 25)
- `nextToken` — cursor for next page

**Pagination**: Cursor-based. Response contains `records` array
and `next_token` (snake_case). Pass back as `nextToken`
(camelCase) query parameter. Empty/absent `next_token` = last
page.

**Rate limits**: 100 requests/minute, 10,000 requests/day.
Headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

**Data volume estimate for 90 days**:
- ~90 records per collection, 25 per page = ~4 pages each
- 4 collections x 4 pages = ~16 API calls
- Well within rate limits

## R3: WHOOP API Response Schemas

**Sleep response fields**:
- `id` (UUID), `cycle_id`, `user_id`
- `start`, `end`, `timezone_offset`
- `nap` (boolean)
- `score_state`: `SCORED` | `PENDING_SCORE` | `UNSCORABLE`
- `score.stage_summary`:
  `total_in_bed_time_milli`, `total_awake_time_milli`,
  `total_light_sleep_time_milli`,
  `total_slow_wave_sleep_time_milli`,
  `total_rem_sleep_time_milli`,
  `sleep_cycle_count`, `disturbance_count`
- `score.sleep_performance_percentage`
- `score.sleep_efficiency_percentage`
- `score.respiratory_rate`

**Cycle response fields**:
- `id` (integer), `user_id`
- `start`, `end`, `timezone_offset`
- `score_state`
- `score.strain` (0-21 scale)
- `score.kilojoule`
- `score.average_heart_rate`, `score.max_heart_rate`

**Recovery response fields**:
- `cycle_id`, `sleep_id`, `user_id`
- `score_state`
- `score.recovery_score` (0-100%)
- `score.resting_heart_rate`
- `score.hrv_rmssd_milli` (HRV in ms)
- `score.spo2_percentage`
- `score.skin_temp_celsius`

**Workout response fields**:
- `id` (UUID), `user_id`
- `start`, `end`, `timezone_offset`
- `sport_name` (string, replaces deprecated `sport_id`)
- `score_state`
- `score.strain`, `score.average_heart_rate`,
  `score.max_heart_rate`, `score.kilojoule`
- `score.percent_recorded`
- `score.distance_meter`, `score.altitude_gain_meter`
- `score.zone_durations` (zones 0-5, each in milliseconds)

**Note**: `score` object is only present when
`score_state = "SCORED"`. Handle `PENDING_SCORE` and
`UNSCORABLE` gracefully.

## R4: CORS and API Proxy Architecture

**Decision**: Implement a Vercel serverless API proxy for ALL
WHOOP API calls (auth + data). The proxy is stateless — it
forwards requests and returns responses without logging or
storing any data.

**Rationale**: WHOOP does not document CORS support for browser
requests. Their official docs explicitly state "all requests to
WHOOP must be made server-side." Even if CORS headers are
present, relying on undocumented behavior is fragile. A
stateless proxy ensures reliable operation.

**Privacy principle compliance**:
The proxy function acts as a transparent pass-through:
- No health data is logged, stored, or cached on the server
- No request/response bodies are persisted
- Vercel serverless functions are ephemeral (no persistent state)
- The proxy only adds the Authorization header and forwards the
  response directly to the browser
- The user initiates and controls every request

This complies with the constitution's intent: the server never
"stores" or "logs" health data. It is a network conduit, similar
to a CDN or load balancer.

**Alternatives considered**:
- Direct browser-to-WHOOP API calls — CORS undocumented, fragile
- CORS proxy service (cors-anywhere) — third-party dependency,
  adds another server in the chain, less trustworthy

**Proxy endpoints on Vercel**:

| Vercel Route | Proxies to |
|-------------|------------|
| `/api/auth/callback` | OAuth token exchange |
| `/api/auth/refresh` | Token refresh |
| `/api/whoop/[...path]` | All WHOOP data API calls |

## R5: TanStack Query Caching Strategy

**Decision**: Use weekly time buckets as query keys with
IndexedDB persistence via `experimental_createQueryPersister`.

**Rationale**: Weekly buckets allow incremental date range
expansion (switching 7→30 days fetches only the missing weeks).
Past completed weeks get `staleTime: Infinity` since historical
health data never changes. Current week gets a shorter stale
time for background refresh.

**Key patterns**:
- `useQueries` with one query per weekly bucket per collection
- `placeholderData: keepPreviousData` for smooth range expansion
- Persist to IndexedDB via `idb-keyval`
- `staleTime: Infinity` for completed past weeks
- `staleTime: 5 minutes` for current (incomplete) week
- `gcTime: 24 hours` to keep cache in memory between view
  switches

**Alternatives considered**:
- Single query per date range — refetches everything on range
  change, wasteful
- `useInfiniteQuery` — sequential refetch from page 1 on
  revalidation, not ideal for historical data

## R6: Frontend Stack Decisions

**Decision**: React + TanStack Query v5 + TanStack Table v8 +
ShadCN/ui + React Router v7 + SheetJS for Excel.

**Rationale**: Each dependency is justified by significant
complexity reduction. ShadCN provides accessible components via
Radix UI. TanStack Table is headless and pairs with ShadCN's
Data Table pattern. React Router v7 in SPA mode is the simplest
routing solution for a 4-tab app.

**Package versions**:
- `@tanstack/react-query` ^5.90.x
- `@tanstack/react-query-persist-client` ^5.90.x
- `@tanstack/react-table` ^8.21.x
- `react-router-dom` ^7.x
- `xlsx` ^0.18.5 (SheetJS community — lazy loaded)
- `idb-keyval` ^6.x
- ShadCN/ui (copied into project, not an npm dep)
- Tailwind CSS v4

**Excel generation**: SheetJS community edition. Dynamic import
on export click to keep initial bundle small. Multi-sheet
workbook (one sheet per collection). No cell styling needed
(data export only).

**Alternatives considered**:
- TanStack Router — more type-safe but adds complexity for a
  simple SPA; overkill per Simplicity principle
- ExcelJS — larger bundle, full styling support not needed
- Zustand/Jotai for state — TanStack Query handles server state;
  React context sufficient for auth state
