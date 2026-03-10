# Feature Specification: Security Audit & Hardening

**Feature Branch**: `002-security-audit`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "Do a thorough security audit of the code in this repository."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Harden OAuth Token Handling and CORS Policy (Priority: P1)

As a user of the WHOOP Explorer app, I need my OAuth tokens to be handled securely and the API endpoints to enforce strict origin policies so that my WHOOP account credentials cannot be stolen by malicious scripts or cross-site attacks.

**Why this priority**: Token theft gives an attacker full access to a user's WHOOP health data and account. Combined with a permissive CORS fallback (`*`), this represents the highest-impact credential and data exfiltration risk in the application.

**Independent Test**: Can be fully tested by verifying that CORS headers reject unauthorized origins, the proxy only serves whitelisted paths, and serverless endpoints never fall back to wildcard CORS.

**Acceptance Scenarios**:

1. **Given** a request is made to any serverless endpoint from an unauthorized origin, **When** the CORS origin header does not match the configured app URL, **Then** the request is rejected and no data is returned
2. **Given** the `VITE_APP_URL` environment variable is not set, **When** a serverless function starts, **Then** it fails with a clear configuration error rather than falling back to `Access-Control-Allow-Origin: *`
3. **Given** an authenticated user makes a request through the WHOOP proxy, **When** the requested path is not in the allowed whitelist (e.g., `activity/sleep`, `activity/workout`, `activity/recovery`, `cycle`, `recovery`), **Then** the proxy returns a 403 Forbidden response

---

### User Story 2 - Add Security Response Headers (Priority: P2)

As a user browsing the WHOOP Explorer app, I need the application to serve proper security headers so that common web attacks (clickjacking, content injection, MIME sniffing) are mitigated by the browser.

**Why this priority**: Security headers are a defense-in-depth measure that protects all users against entire classes of browser-based attacks with minimal implementation effort.

**Independent Test**: Can be fully tested by inspecting HTTP response headers on any page load and verifying each required header is present and correctly configured.

**Acceptance Scenarios**:

1. **Given** a user loads any page of the application, **When** the browser receives the response, **Then** the response includes Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, and Permissions-Policy headers
2. **Given** a Content-Security-Policy header is set, **When** an inline script not matching the policy attempts to execute, **Then** the browser blocks the script execution

---

### User Story 3 - Remediate Known Dependency Vulnerabilities (Priority: P2)

As a project maintainer, I need known high-severity vulnerabilities in dependencies to be resolved so that the application is not exposed to prototype pollution, ReDoS, or other exploitable flaws.

**Why this priority**: Dependencies with known HIGH vulnerabilities (especially `xlsx` which runs in production client-side code) present a concrete, documented attack surface that should be closed.

**Independent Test**: Can be fully tested by running a dependency audit and verifying zero HIGH or CRITICAL vulnerabilities remain.

**Acceptance Scenarios**:

1. **Given** the project dependencies are installed, **When** a dependency vulnerability audit is run, **Then** zero HIGH or CRITICAL severity vulnerabilities are reported
2. **Given** the Excel export feature uses SheetJS, **When** a user exports data, **Then** the library version in use is free of known prototype pollution and ReDoS vulnerabilities

---

### User Story 4 - Validate and Sanitize Serverless Function Inputs (Priority: P2)

As a system operator, I need all inputs to the serverless API endpoints to be validated so that malformed or malicious payloads are rejected before being forwarded to external services.

**Why this priority**: Input validation at system boundaries is a fundamental security practice that prevents entire categories of injection and abuse attacks.

**Independent Test**: Can be fully tested by sending malformed requests to each endpoint and verifying they are rejected with appropriate error codes before any external API call is made.

**Acceptance Scenarios**:

1. **Given** a request to the token exchange endpoint with a non-string or excessively long `code` parameter, **When** the endpoint processes the request, **Then** it returns a 400 Bad Request error before contacting the upstream API
2. **Given** a request to the token refresh endpoint with a non-string or excessively long `refresh_token`, **When** the endpoint processes the request, **Then** it returns a 400 Bad Request error before contacting the upstream API
3. **Given** a request to the data proxy with a path containing traversal sequences (e.g., `../`), **When** the proxy processes the request, **Then** it rejects the request with a 400 Bad Request error

---

### User Story 5 - Improve Secrets Management and Error Handling (Priority: P3)

As a developer working on this project, I need the repository configuration to prevent accidental secret leakage and I need error responses to hide internal details so that credentials are never committed and attackers cannot gain insight from error messages.

**Why this priority**: Preventing secret leakage is critical, but the current `.gitignore` already covers the primary risk (`.env.local`). This extends coverage to edge cases and hardens error responses.

**Independent Test**: Can be fully tested by creating test `.env` files with various naming patterns and verifying git does not track them, and by triggering upstream API errors and verifying no internal details leak to the client.

**Acceptance Scenarios**:

1. **Given** a developer creates a file named `.env`, `.env.production`, or `.env.staging` in the project root, **When** they run `git status`, **Then** the file does not appear as untracked
2. **Given** an upstream API returns an error with internal details, **When** the serverless function sends a response to the client, **Then** only a generic error message is included, not the raw upstream error text

---

### User Story 6 - Add Rate Limiting to Proxy Endpoints (Priority: P3)

As a system operator, I need the data proxy to enforce rate limits so that a single client cannot exhaust the application's upstream API quota, which would deny service to all users.

**Why this priority**: Rate limiting protects shared resources but is lower priority since the application currently has a limited user base and the upstream API enforces its own limits.

**Independent Test**: Can be fully tested by sending rapid sequential requests to the proxy and verifying that requests beyond the limit are rejected with a 429 status.

**Acceptance Scenarios**:

1. **Given** an authenticated user sends more than the allowed number of requests per minute to the proxy, **When** the rate limit is exceeded, **Then** subsequent requests receive a 429 Too Many Requests response with a Retry-After header
2. **Given** the rate limit is enforced, **When** the cooldown period expires, **Then** the user can resume making requests normally

---

### Edge Cases

- What happens when `VITE_APP_URL` environment variable is not set in production? The CORS origin must not fall back to `*`; the function must fail with a configuration error.
- What happens when the upstream API returns error details in response bodies? Internal API error messages must not be forwarded verbatim to the client.
- What happens when a user's tokens expire and the refresh also fails? The user must be redirected to re-authenticate, and stale tokens must be cleared from all browser storage.
- What happens when IndexedDB or localStorage is full or unavailable? The app must degrade gracefully without exposing tokens or cached health data.
- What happens when the proxy receives a path with URL-encoded traversal sequences (e.g., `%2e%2e%2f`)? The proxy must decode and validate before forwarding.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST enforce a strict CORS origin policy on all serverless endpoints, rejecting requests from any origin not matching the configured application URL. The system MUST NOT fall back to a wildcard (`*`) origin under any configuration.
- **FR-002**: The system MUST serve security response headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, Permissions-Policy) on all HTTP responses. The Content-Security-Policy MUST initially be deployed in report-only mode (`Content-Security-Policy-Report-Only`) and switched to enforcing mode only after the policy has been validated in production.
- **FR-003**: The data proxy MUST enforce a whitelist of allowed path prefixes and reject all non-whitelisted paths with a 403 Forbidden response.
- **FR-004**: All serverless endpoint inputs MUST be validated for type, format, and length before being forwarded to external services. Invalid inputs MUST result in a 400 Bad Request response.
- **FR-005**: The `.gitignore` file MUST exclude all `.env*` file patterns to prevent accidental credential commits regardless of naming convention.
- **FR-006**: The system MUST NOT expose internal error details from upstream APIs to the client. Error responses MUST use generic user-facing messages.
- **FR-007**: Known HIGH and CRITICAL dependency vulnerabilities MUST be resolved by upgrading affected packages to patched versions.
- **FR-008**: The data proxy MUST enforce per-IP-address rate limiting to prevent upstream API quota exhaustion.
- **FR-009**: Development-only tools (such as query debugging components) MUST only be included in development builds, not in production bundles.
- **FR-010**: The logout function MUST clear only application-specific storage keys rather than all storage on the origin.

### Key Entities

- **OAuth Tokens**: Access token and refresh token pair used to authenticate with the upstream API. Stored in browser localStorage with a strict Content-Security-Policy as defense-in-depth against XSS-based token theft. Must be cleared completely on logout.
- **Security Headers**: HTTP response headers that instruct browsers to enable security protections. Applied globally to all responses.
- **Proxy Allowlist**: A defined set of permitted upstream API path prefixes that the proxy is authorized to forward. All other paths are blocked.
- **Rate Limit State**: Per-IP-address request counters used to enforce proxy rate limiting. Tracks request counts within a sliding or fixed time window.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero HIGH or CRITICAL vulnerabilities reported by dependency audit tooling after remediation
- **SC-002**: All six standard security response headers are present on 100% of application responses, with CSP initially in report-only mode
- **SC-003**: Proxy endpoint rejects 100% of requests to paths outside the defined allowlist
- **SC-004**: 100% of serverless endpoint inputs are validated before being forwarded to external services
- **SC-005**: No internal error messages from upstream APIs are exposed to end users in any error response
- **SC-006**: CORS policy rejects 100% of cross-origin requests from unauthorized origins, with no fallback to wildcard
- **SC-007**: Rate limiting activates and returns 429 responses when request volume from a single IP address exceeds the defined threshold

## Clarifications

### Session 2026-03-03

- Q: Should OAuth tokens be moved to httpOnly cookies (requiring server-side session management), kept in localStorage with CSP protection, or moved to sessionStorage? → A: Keep tokens in localStorage, protect with strict CSP and security headers as defense-in-depth.
- Q: How should rate limiting identify a "client" — per-IP address, per-authorization token, or a combination? → A: Per-IP address.
- Q: Should the Content-Security-Policy be deployed in enforcing mode immediately, report-only mode first, or enforcing with a permissive baseline? → A: Deploy in report-only mode first, then switch to enforcing after validation.

## Assumptions

- The OAuth Client ID is considered a public value (safe to embed in client-side code). Only the Client Secret is confidential.
- The application is deployed on Vercel, so Vercel configuration is the appropriate place to configure security headers.
- The current credentials in the local environment file have never been committed to git history (confirmed by audit) and do not require emergency rotation, but developers should be reminded to rotate credentials periodically.
- Rate limiting can be implemented at the serverless function level using in-memory or edge-based counters, without requiring an external store for the current scale.
- The SheetJS package (`xlsx`) can be upgraded to a patched version without breaking the Excel export feature, or an alternative library can be substituted if needed.
- The application's use of a modern frontend framework provides baseline protection against reflected XSS through automatic output escaping, but a Content-Security-Policy header adds defense-in-depth.
- OAuth tokens will remain in localStorage (not migrated to httpOnly cookies or sessionStorage). The primary mitigation against token theft is a strict CSP that prevents unauthorized script execution.
