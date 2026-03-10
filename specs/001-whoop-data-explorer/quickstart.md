# Quickstart: WHOOP Data Explorer

## Prerequisites

- Node.js 18+ and npm
- A WHOOP account with data
- A WHOOP developer app registered at
  https://developer.whoop.com (for client_id and client_secret)
- Vercel CLI (for local development with serverless functions)

## Setup

1. Clone and install:
   ```
   git clone <repo-url>
   cd whoop-explorer
   npm install
   ```

2. Create `.env.local` at project root:
   ```
   WHOOP_CLIENT_ID=your_client_id
   WHOOP_CLIENT_SECRET=your_client_secret
   REDIRECT_URI=http://localhost:3000/api/auth/callback
   VITE_APP_URL=http://localhost:3000
   ```

3. Start the development server:
   ```
   vercel dev
   ```
   This runs both the Vite dev server and the serverless
   functions locally.

4. Open http://localhost:3000 in your browser.

## First Use

1. Click "Connect WHOOP" on the landing page.
2. You are redirected to WHOOP's OAuth login page.
3. Authorize the app to access your data.
4. You are redirected back. The app loads your last 7 days of
   data across Sleep, Cycles, Recovery, and Workouts.
5. Use the tabs to switch between collections.
6. Use the date range selector to expand to 30 or 90 days.
7. Click "Download as Excel" to export your data.

## Verify Privacy Guarantee

Open browser DevTools → Network tab. Observe:
- `/api/auth/*` calls contain only OAuth tokens (no health data)
- `/api/whoop/*` calls proxy to WHOOP API; responses contain
  health data but are processed entirely in the browser
- No calls to analytics, telemetry, or third-party services
- Disconnect your account and verify all localStorage/IndexedDB
  entries are cleared

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in the Vercel dashboard.
3. Add environment variables:
   - `WHOOP_CLIENT_ID`
   - `WHOOP_CLIENT_SECRET`
   - `REDIRECT_URI` (your production URL + `/api/auth/callback`)
   - `VITE_APP_URL` (your production URL)
4. Deploy. Vercel auto-detects Vite and serverless functions.

## Running Tests

```
npm test           # Run all tests (Vitest)
npm test -- --ui   # Run with Vitest UI
```
