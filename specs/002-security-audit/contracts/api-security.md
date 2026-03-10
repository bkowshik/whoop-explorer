# API Security Contracts

**Feature**: 002-security-audit | **Date**: 2026-03-03

## CORS Policy (all endpoints)

### Before (current behavior)

```
Access-Control-Allow-Origin: {VITE_APP_URL} or * (if unset)
```

### After (hardened)

```
Access-Control-Allow-Origin: {VITE_APP_URL}  (required, no fallback)
```

- If `VITE_APP_URL` is not set, the handler returns `500 Internal Server Error` with `{ "error": "Server configuration error" }`.
- If the request `Origin` header does not match `VITE_APP_URL`, the response omits CORS headers entirely (browser blocks the response).
- `OPTIONS` preflight requests are also subject to origin validation.

---

## POST /api/auth/callback

### Request validation (new)

| Check | Condition | Response |
|-------|-----------|----------|
| Body present | `req.body` is not null/undefined | 400 `{ "error": "Missing request body" }` |
| `code` exists | `typeof code === "string"` | 400 `{ "error": "Missing authorization code" }` |
| `code` length | `code.length <= 2048` | 400 `{ "error": "Invalid authorization code" }` |
| `code` not empty | `code.trim().length > 0` | 400 `{ "error": "Invalid authorization code" }` |

### Error response format (changed)

**Before**: `{ "error": "Token exchange failed", "detail": "<raw upstream error>" }`
**After**: `{ "error": "Token exchange failed" }` (upstream error logged server-side only)

---

## POST /api/auth/refresh

### Request validation (new)

| Check | Condition | Response |
|-------|-----------|----------|
| Body present | `req.body` is not null/undefined | 400 `{ "error": "Missing request body" }` |
| `refresh_token` exists | `typeof refresh_token === "string"` | 400 `{ "error": "Missing refresh token" }` |
| `refresh_token` length | `refresh_token.length <= 2048` | 400 `{ "error": "Invalid refresh token" }` |
| `refresh_token` not empty | `refresh_token.trim().length > 0` | 400 `{ "error": "Invalid refresh token" }` |

### Error response format (changed)

**Before**: `{ "error": "Token refresh failed", "detail": "<raw upstream error>" }`
**After**: `{ "error": "Token refresh failed" }` (upstream error logged server-side only)

---

## GET /api/whoop/*

### Path validation (new)

| Check | Condition | Response |
|-------|-----------|----------|
| Path present | `apiPath` is a non-empty string | 400 `{ "error": "Missing API path" }` |
| Path length | `apiPath.length <= 256` | 400 `{ "error": "Invalid API path" }` |
| No traversal | Path does not contain `..` after URL-decoding | 400 `{ "error": "Invalid API path" }` |
| Allowlist match | Path starts with an allowed prefix | 403 `{ "error": "Forbidden" }` |

### Allowed path prefixes

- `activity/sleep`
- `activity/workout`
- `activity/recovery`
- `cycle`
- `recovery`

### Error response format (changed)

**Before**: `{ "error": "WHOOP API error", "detail": "<raw upstream error>" }`
**After**: `{ "error": "Upstream API error" }` (upstream error logged server-side only)

---

## Rate Limiting (Vercel WAF)

Configured via Vercel dashboard, not in application code.

| Parameter | Value |
|-----------|-------|
| Path pattern | `/api/whoop/*` |
| Key | IP address |
| Algorithm | Fixed Window |
| Limit | 60 requests per 60 seconds |
| Response | 429 with `Retry-After` header |
