# API Proxy Contracts (Vercel Serverless Functions)

These are the endpoints exposed by the Vercel serverless
functions. They proxy requests to the WHOOP API, keeping the
`client_secret` server-side and handling CORS.

## POST /api/auth/callback

Exchanges an OAuth authorization code for tokens.

**Request body** (JSON):
```json
{
  "code": "string (authorization code from WHOOP redirect)"
}
```

**Response** (200 OK):
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

**Error responses**:
- 400: Missing or invalid authorization code
- 502: WHOOP API returned an error during token exchange

**Security**: `client_secret` is stored as a Vercel environment
variable and never exposed to the client.

## POST /api/auth/refresh

Refreshes an expired access token.

**Request body** (JSON):
```json
{
  "refresh_token": "string"
}
```

**Response** (200 OK):
```json
{
  "access_token": "string (new)",
  "refresh_token": "string (new, rotated)",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

**Error responses**:
- 400: Missing refresh token
- 401: Refresh token is invalid or revoked
- 502: WHOOP API error

## GET /api/whoop/:path*

Transparent proxy for all WHOOP data API calls. Forwards the
request to `https://api.prod.whoop.com/developer/v2/:path*`
with the user's access token.

**Request headers**:
- `Authorization: Bearer <access_token>` (required)

**Query parameters**: Passed through unchanged to WHOOP API
(e.g., `start`, `end`, `limit`, `nextToken`).

**Response**: WHOOP API response passed through unchanged.

**Error responses**:
- 401: Missing or expired access token (client should refresh)
- 429: WHOOP rate limit exceeded (forward rate limit headers)
- 502: WHOOP API unreachable

**Examples**:
```
GET /api/whoop/activity/sleep?start=2026-02-24T00:00:00.000Z&end=2026-03-03T00:00:00.000Z&limit=25
GET /api/whoop/cycle?start=2026-02-24T00:00:00.000Z&end=2026-03-03T00:00:00.000Z&limit=25
GET /api/whoop/activity/recovery?start=2026-02-24T00:00:00.000Z&end=2026-03-03T00:00:00.000Z&limit=25
GET /api/whoop/activity/workout?start=2026-02-24T00:00:00.000Z&end=2026-03-03T00:00:00.000Z&limit=25
GET /api/whoop/user/profile/basic
```

## CORS Configuration

All `/api/*` endpoints return these headers:
```
Access-Control-Allow-Origin: <app origin>
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

## Privacy Guarantees

- No request or response bodies are logged
- No health data is stored or cached on the server
- Serverless functions are ephemeral (no persistent state)
- Only `client_id` and `client_secret` are server-side secrets
- All health data passes through the proxy without modification
