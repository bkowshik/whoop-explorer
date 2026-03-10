# WHOOP Explorer

Privacy-first app to explore, download, and understand your WHOOP health data. All health data stays in your browser — the server only handles OAuth authentication.

## Features

- **OAuth2 Connect** — securely link your WHOOP account
- **Browse Data** — sortable tables for Sleep, Cycles, Recovery, and Workouts
- **Summary Stats** — averages and totals at a glance
- **Date Ranges** — switch between 7, 30, and 90 day views
- **Excel Export** — download any collection as `.xlsx`
- **Offline Cache** — data persists in IndexedDB across sessions
- **Auto Refresh** — tokens refresh automatically before expiry

## Tech Stack

- React 19 + TypeScript + Vite 7
- TanStack Query v5 (caching + IndexedDB persistence)
- TanStack Table v8 (sortable data tables)
- ShadCN/ui (Radix + Tailwind v4)
- Vercel serverless functions (OAuth proxy)
- SheetJS (Excel export, lazy-loaded)

## Setup

### 1. WHOOP Developer App

Create an app at the [WHOOP Developer Portal](https://developer.whoop.com):

- Set the redirect URI to `http://localhost:3000/callback` (local) or `https://your-domain.vercel.app/callback` (production)
- Note your **Client ID** and **Client Secret**
- Enable scopes: `offline`, `read:profile`, `read:cycles`, `read:sleep`, `read:recovery`, `read:workout`

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your values:

```
WHOOP_CLIENT_ID=your_client_id
WHOOP_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:3000/callback
VITE_APP_URL=http://localhost:3000
VITE_WHOOP_CLIENT_ID=your_client_id
```

### 3. Install & Run

```bash
npm install
vercel dev
```

> **Important:** You must use `vercel dev` (not `npm run dev`) for local development. The serverless API functions (`/api/*`) that handle OAuth and proxy WHOOP API requests only work through the Vercel dev server. Running `npm run dev` starts only the Vite frontend and API calls will fail with 404 errors.
>
> `vercel dev` starts on `http://localhost:3000` by default. Make sure your WHOOP app redirect URI and environment variables use port 3000, not 5173.

### 4. Deploy to Vercel

```bash
vercel
```

Set the same environment variables in your Vercel project settings.

## Project Structure

```
src/
  components/
    layout/         # AppShell, AuthGuard, NavTabs
    tables/         # Column definitions per collection
    ui/             # ShadCN components
    data-table.tsx  # Reusable sortable table
    summary-stats.tsx
    date-range-selector.tsx
  hooks/
    use-auth.ts     # OAuth context + auto-refresh
    use-whoop-data.ts  # Weekly-bucketed data fetching
    use-excel-export.ts
  lib/
    auth.ts         # Token storage (localStorage)
    whoop-api.ts    # API client + response mappers
    formatters.ts   # Display formatters
    query-config.ts # TanStack Query + IndexedDB persister
    types.ts        # TypeScript types
  pages/            # Sleep, Cycles, Recovery, Workouts, Landing, Callback
api/
  auth/callback.ts  # OAuth token exchange
  auth/refresh.ts   # Token refresh
  whoop/[...path].ts # WHOOP API proxy
```

## Privacy

- Health data is **never stored on any server** — the proxy passes it through without logging
- All data processing happens in the browser
- Disconnecting clears all local data (localStorage + IndexedDB)
- Only `client_id` and `client_secret` are server-side secrets

## Tests

```bash
npm test
```

85 unit tests covering formatters, auth token management, API response mapping, column preferences, and proxy allowlist.
