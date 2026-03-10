# Research: Security Audit & Hardening

**Feature**: 002-security-audit | **Date**: 2026-03-03

## R1: xlsx / SheetJS Vulnerability Remediation

**Decision**: Upgrade to SheetJS 0.20.3 from CDN tarball in the short term.

**Rationale**: The current `xlsx@0.18.5` has two HIGH CVEs (GHSA-4r6h-8v6p-xvw6 prototype pollution, GHSA-5pgg-2g8v-p4x9 ReDoS). SheetJS stopped publishing to npm at v0.18.6; patched versions are only available from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`. The project's usage is write-only (no file reading), so prototype pollution is not reachable, but ReDoS affects write paths and the scanner flags remain. The 0.20.x API is backward-compatible with all calls in `use-excel-export.ts`.

**Alternatives considered**:
- **ExcelJS**: Actively maintained on npm, no known HIGH CVEs. However, bundle is ~3-5 MB (vs ~300 KB for SheetJS) and migration requires rewriting `use-excel-export.ts`. Overkill for the current write-only use case. Consider as a future ticket for supply-chain health.
- **xlsx-populate**: Less actively maintained, primarily Node.js-oriented. Not recommended.
- **Stay on 0.18.5**: Leaves scanner findings unresolved and ReDoS vulnerability open.

**Install command**: `npm rm --save xlsx && npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`

---

## R2: Vercel Security Headers Configuration

**Decision**: Add security headers to `vercel.json` using the `headers` block. CSP in report-only mode; all other headers enforced immediately.

**Rationale**: Vercel's `headers` configuration supports glob patterns for source matching. Non-CSP headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) have zero breakage risk. CSP requires careful tuning with Vite's production output.

**Header values**:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'`

**CSP notes**:
- Vite production builds produce `<script type="module" src="/assets/...">` — `script-src 'self'` is sufficient, no `'unsafe-inline'` or `'unsafe-eval'` needed for scripts.
- Tailwind CSS v4 with Vite produces separate `.css` files in production, but may use `<style>` injection in dev — `'unsafe-inline'` is included for `style-src` as a safe starting point.
- All WHOOP API calls go through the `/api/whoop/*` proxy (same origin = `'self'`), so `connect-src 'self'` is correct. No direct browser-to-`api.prod.whoop.com` calls.

---

## R3: Rate Limiting Strategy

**Decision**: Use Vercel WAF rate limiting (dashboard-configured) for per-IP rate limiting on the proxy endpoint.

**Rationale**: In-memory rate limiting does not work reliably in Vercel serverless functions because multiple concurrent instances have isolated heaps and cold starts reset state. Vercel WAF operates at the edge layer before requests reach functions, requires no code changes, and no new dependencies.

**Alternatives considered**:
- **In-memory rate limiting**: Fundamentally broken in serverless — multiple instances and cold starts make counters unreliable. Must not be used.
- **Upstash Redis + `@upstash/ratelimit`**: Production-grade, works across instances via shared Redis state. However, adds a new dependency and external service (contradicts constitution Principle III — Simplicity). Appropriate if per-token limiting is ever needed.
- **`@vercel/firewall` SDK**: Code-based rate limiting that references dashboard-configured rules. More complex than WAF-only for simple IP-based limiting.

**Configuration**: Single WAF rule on `/api/whoop/*` path, keyed by IP, Fixed Window, ~60 requests per 60 seconds. Configured via Vercel dashboard, not code.

**IP header**: `x-forwarded-for` — Vercel overwrites this at the edge (spoofing-resistant), single trusted IP value.

---

## R4: CORS Hardening Approach

**Decision**: Replace `process.env.VITE_APP_URL ?? "*"` with a strict origin check that throws on missing configuration.

**Rationale**: All three serverless functions currently fall back to `Access-Control-Allow-Origin: *` when `VITE_APP_URL` is not set. This must be eliminated. The fix is to validate `VITE_APP_URL` exists at the top of each handler and return 500 if misconfigured.

**Implementation pattern**:
- Extract a shared CORS helper used by all three handlers.
- Validate the `Origin` header against the configured allowed origin.
- Return appropriate CORS headers only when the origin matches.
- Fail with 500 and a clear log message if `VITE_APP_URL` is not configured.

---

## R5: Proxy Path Allowlist

**Decision**: Implement a static allowlist of permitted path prefixes in the proxy handler.

**Rationale**: The current proxy forwards any path under `/developer/v2/`. The application only uses five endpoints. All others should be blocked.

**Allowed paths**:
- `activity/sleep`
- `activity/workout`
- `activity/recovery` (note: currently unused but listed in spec)
- `cycle`
- `recovery`

**Implementation**: Check the resolved `apiPath` against the allowlist before making the upstream request. Reject non-matching paths with 403.

---

## R6: ReactQueryDevtools in Production

**Decision**: Wrap `ReactQueryDevtools` in `import.meta.env.DEV` conditional.

**Rationale**: `@tanstack/react-query-devtools` is designed to be tree-shaken in production builds when lazy-loaded. However, the current code renders it unconditionally. While Vite + TanStack likely tree-shake it already, explicitly guarding with `import.meta.env.DEV` makes the intent clear and guarantees it.
