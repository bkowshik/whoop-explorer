# Data Model: Security Audit & Hardening

**Feature**: 002-security-audit | **Date**: 2026-03-03

This feature introduces no new persistent data entities. All changes are to configuration, validation logic, and response formats. The entities below represent static configuration and behavioral contracts.

## Entities

### ProxyAllowlist

A static set of permitted API path prefixes that the WHOOP proxy is authorized to forward.

| Attribute | Description |
|-----------|-------------|
| `ALLOWED_PATHS` | Static array of permitted path prefix strings |

**Values**: `["activity/sleep", "activity/workout", "activity/recovery", "cycle", "recovery"]`

**Validation rule**: The resolved `apiPath` from the incoming request must start with one of these prefixes. Paths not matching any prefix are rejected with 403.

---

### SecurityHeaders

A static configuration of HTTP security headers applied to all responses via `vercel.json`.

| Header | Value | Mode |
|--------|-------|------|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | Enforced |
| X-Frame-Options | `DENY` | Enforced |
| X-Content-Type-Options | `nosniff` | Enforced |
| Referrer-Policy | `strict-origin-when-cross-origin` | Enforced |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Enforced |
| Content-Security-Policy-Report-Only | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'` | Report-only |

---

### InputValidation

Validation rules applied to serverless function inputs at the system boundary.

| Endpoint | Field | Type | Max Length | Format | Rejection |
|----------|-------|------|-----------|--------|-----------|
| `/api/auth/callback` | `code` | string | 2048 chars | Non-empty, no whitespace-only | 400 |
| `/api/auth/refresh` | `refresh_token` | string | 2048 chars | Non-empty, no whitespace-only | 400 |
| `/api/whoop/*` | `path` (query) | string | 256 chars | No `..` sequences (decoded), must match allowlist | 400 or 403 |
| `/api/whoop/*` | `Authorization` (header) | string | 8192 chars | Starts with `Bearer ` | 401 |

---

### ErrorResponse

Standardized error response format replacing the current detail-leaking responses.

| Field | Type | Description |
|-------|------|-------------|
| `error` | string | Generic, user-facing error message |

**Removed field**: `detail` — previously contained raw upstream API error text. Replaced with server-side logging only.

---

### StorageKeys

Application-specific storage keys cleared on logout (replacing `localStorage.clear()`).

| Store | Key | Description |
|-------|-----|-------------|
| localStorage | `whoop_tokens` | OAuth token pair (access + refresh + expiry) |
| IndexedDB | All `idb-keyval` keys | Cached TanStack Query data (health records) |

**Logout behavior**: Clear `whoop_tokens` from localStorage by key, then clear all IndexedDB via `idb-keyval.clear()`. Do not call `localStorage.clear()`.
