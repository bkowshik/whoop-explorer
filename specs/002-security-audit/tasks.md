# Tasks: Security Audit & Hardening

**Input**: Design documents from `/specs/002-security-audit/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-security.md

**Tests**: Included per constitution Principle II (TDD is NON-NEGOTIABLE). Tests are written first, verified to fail, then implementation proceeds.

**Organization**: Tasks grouped by user story. Stories US1 → US4 → US5 modify the same 3 serverless files sequentially. US2, US3, US6 are independent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create test directory structure for new API tests

- [x] T001 Create test directory structure `tests/api/` and `tests/lib/` per plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared CORS helper that all 3 serverless endpoints depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

- [x] T002 Write failing tests for shared CORS helper: validates origin against `VITE_APP_URL`, returns 500 when env var missing, omits CORS headers for mismatched origins, handles OPTIONS preflight — in `tests/api/cors.test.ts`

### Implementation for Foundational

- [x] T003 Implement shared CORS helper function in `api/lib/cors.ts` — validates `VITE_APP_URL` exists (returns 500 if not), checks request `Origin` header against allowed origin, sets CORS headers only for matching origins, handles OPTIONS preflight. Per contract: `contracts/api-security.md` CORS Policy section

**Checkpoint**: CORS helper passes all tests. Endpoints not yet updated.

---

## Phase 3: User Story 1 — Harden OAuth Token Handling and CORS Policy (Priority: P1) MVP

**Goal**: Enforce strict CORS on all endpoints + proxy path allowlisting (FR-001, FR-003)

**Independent Test**: Verify CORS headers reject unauthorized origins across all 3 endpoints, and the proxy rejects non-whitelisted paths with 403

### Tests for User Story 1

- [x] T004 [P] [US1] Write failing tests for CORS enforcement across all 3 endpoints: callback rejects unauthorized origin, refresh rejects unauthorized origin, proxy rejects unauthorized origin — in `tests/api/cors.test.ts` (extend from T002)
- [x] T005 [P] [US1] Write failing tests for proxy path allowlist: allows `activity/sleep`, `activity/workout`, `activity/recovery`, `cycle`, `recovery`; rejects `user/profile`, arbitrary paths, empty path; rejects URL-encoded traversal `%2e%2e%2f` — in `tests/api/proxy-allowlist.test.ts`

### Implementation for User Story 1

- [x] T006 [P] [US1] Update `api/auth/callback.ts` to use shared CORS helper from `api/lib/cors.ts`, replacing inline CORS headers and `?? "*"` fallback
- [x] T007 [P] [US1] Update `api/auth/refresh.ts` to use shared CORS helper from `api/lib/cors.ts`, replacing inline CORS headers and `?? "*"` fallback
- [x] T008 [US1] Add proxy path allowlist to `api/whoop/index.ts`: define `ALLOWED_PATHS` array per `data-model.md` ProxyAllowlist entity, validate decoded `apiPath` starts with an allowed prefix, return 403 for non-matching paths. Also update to use shared CORS helper from `api/lib/cors.ts`

**Checkpoint**: All 3 endpoints enforce strict CORS. Proxy rejects non-whitelisted paths. US1 is independently testable.

---

## Phase 4: User Story 2 — Add Security Response Headers (Priority: P2)

**Goal**: Serve 6 security headers on all responses via Vercel configuration (FR-002)

**Independent Test**: Inspect HTTP response headers on any deployed page and verify all 6 headers are present

### Implementation for User Story 2

- [x] T009 [US2] Add `headers` block to `vercel.json` with all 6 security headers per `data-model.md` SecurityHeaders entity: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy-Report-Only` with the CSP directive from research.md R2. Use source pattern `"/(.*)"` to match all routes.

**Checkpoint**: Security headers configured. Verification requires deployment (`vercel dev` or production deploy).

---

## Phase 5: User Story 3 — Remediate Known Dependency Vulnerabilities (Priority: P2)

**Goal**: Resolve all HIGH/CRITICAL dependency vulnerabilities (FR-007)

**Independent Test**: Run `npm audit` and verify zero HIGH or CRITICAL vulnerabilities

### Implementation for User Story 3

- [x] T010 [US3] Upgrade xlsx from npm `^0.18.5` to SheetJS CDN tarball `0.20.3`: run `npm rm --save xlsx && npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` per research.md R1. Verify `src/hooks/use-excel-export.ts` still compiles (API is backward-compatible).
- [x] T011 [US3] Run `npm audit` and verify zero HIGH or CRITICAL vulnerabilities remain. If transitive devDependency vulnerabilities persist (via `@vercel/node`), document in a comment and attempt `npm audit fix` or pin overrides in `package.json`.

**Checkpoint**: `npm audit` reports zero HIGH/CRITICAL. Excel export still functional.

---

## Phase 6: User Story 4 — Validate and Sanitize Serverless Function Inputs (Priority: P2)

**Goal**: Validate all inputs at system boundaries before forwarding to upstream API (FR-004)

**Independent Test**: Send malformed requests to each endpoint and verify 400 responses before any upstream call

### Tests for User Story 4

- [x] T012 [P] [US4] Write failing tests for callback input validation: rejects missing body, rejects non-string `code`, rejects `code` longer than 2048 chars, rejects whitespace-only `code`, accepts valid string `code` — in `tests/api/callback-validation.test.ts`. Per contract: `contracts/api-security.md` POST /api/auth/callback section
- [x] T013 [P] [US4] Write failing tests for refresh input validation: rejects missing body, rejects non-string `refresh_token`, rejects `refresh_token` longer than 2048 chars, rejects whitespace-only `refresh_token`, accepts valid string — in `tests/api/refresh-validation.test.ts`. Per contract: `contracts/api-security.md` POST /api/auth/refresh section
- [x] T014 [P] [US4] Write failing tests for proxy path validation: rejects path longer than 256 chars, rejects path containing `..` sequences (raw and URL-encoded), rejects empty/missing path, validates `Authorization` header starts with `Bearer ` — in `tests/api/proxy-allowlist.test.ts` (extend from T005)

### Implementation for User Story 4

- [x] T015 [US4] Add input validation to `api/auth/callback.ts`: check `typeof code === "string"`, `code.length <= 2048`, `code.trim().length > 0`. Return 400 with generic message per contract. Validation MUST occur before the `fetch` call to WHOOP token endpoint.
- [x] T016 [US4] Add input validation to `api/auth/refresh.ts`: check `typeof refresh_token === "string"`, `refresh_token.length <= 2048`, `refresh_token.trim().length > 0`. Return 400 with generic message per contract. Validation MUST occur before the `fetch` call to WHOOP token endpoint.
- [x] T017 [US4] Enhance input validation in `api/whoop/index.ts`: check `apiPath` is non-empty string, `apiPath.length <= 256`, decoded path does not contain `..`, `Authorization` header starts with `Bearer `. Return 400 for invalid path/auth, 403 for non-allowlisted path (from T008).

**Checkpoint**: All 3 endpoints reject malformed inputs with 400 before any upstream API call.

---

## Phase 7: User Story 5 — Improve Secrets Management and Error Handling (Priority: P3)

**Goal**: Prevent secret leakage via .gitignore and suppress internal error details from responses (FR-005, FR-006)

**Independent Test**: Create test `.env` files and verify git doesn't track them. Trigger upstream errors and verify no `detail` field in responses.

### Tests for User Story 5

- [x] T018 [US5] Write failing tests for error response format: verify callback returns `{ error: "Token exchange failed" }` without `detail` field on upstream failure, verify refresh returns `{ error: "Token refresh failed" }` without `detail` field, verify proxy returns `{ error: "Upstream API error" }` without `detail` field — in `tests/api/error-responses.test.ts`

### Implementation for User Story 5

- [x] T019 [P] [US5] Update `.gitignore` to add `.env` and `.env.*` patterns (in addition to existing `.env.local` and `.env.*.local`) to prevent accidental commits of any `.env` variant
- [x] T020 [P] [US5] Remove `detail` field from error responses in `api/auth/callback.ts`: replace `res.status(502).json({ error: "Token exchange failed", detail: error })` with `res.status(502).json({ error: "Token exchange failed" })` and add `console.error` for server-side logging
- [x] T021 [P] [US5] Remove `detail` field from error responses in `api/auth/refresh.ts`: replace `res.status(status).json({ error: "Token refresh failed", detail: error })` with `res.status(status).json({ error: "Token refresh failed" })` and add `console.error` for server-side logging
- [x] T022 [P] [US5] Remove `detail` field from error responses in `api/whoop/index.ts`: replace `res.status(502).json({ error: "WHOOP API error", detail: error })` with `res.status(502).json({ error: "Upstream API error" })` and add `console.error` for server-side logging

**Checkpoint**: No `.env*` files can be committed. No `detail` fields leak internal errors.

---

## Phase 8: User Story 6 — Add Rate Limiting to Proxy Endpoints (Priority: P3)

**Goal**: Per-IP rate limiting on the data proxy to prevent upstream API quota exhaustion (FR-008)

**Independent Test**: Verify rate limit returns 429 when exceeded (requires deployment + Vercel dashboard)

### Implementation for User Story 6

- [x] T023 [US6] Document Vercel WAF rate limiting configuration steps in `specs/002-security-audit/vercel-waf-setup.md`: path pattern `/api/whoop/*`, key by IP, Fixed Window algorithm, 60 requests per 60 seconds, per research.md R3. This is a dashboard-only configuration (no code changes).
- [ ] T024 [US6] Configure Vercel WAF rate limit rule via Vercel dashboard (MANUAL — requires dashboard access): Firewall → Custom Rules → Add Rule matching `/api/whoop/*` path, keyed by IP address, Fixed Window, 60 req/60s. Verify 429 response with `Retry-After` header on exceeded limit.

**Checkpoint**: Rate limiting active on proxy endpoint. Verified via deployment testing.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Frontend security fixes and final verification

- [x] T025 [P] Wrap `ReactQueryDevtools` in `import.meta.env.DEV` conditional in `src/App.tsx` (FR-009): change `<ReactQueryDevtools initialIsOpen={false} />` to render only when `import.meta.env.DEV` is true
- [x] T026 Write failing test for scoped logout in `tests/lib/auth.test.ts`: verify `clearAllData()` removes `whoop_tokens` key from localStorage (not `localStorage.clear()`), verify IndexedDB is cleared via `idb-keyval.clear()`
- [x] T027 Update `clearAllData()` in `src/lib/auth.ts` to replace `localStorage.clear()` with `localStorage.removeItem("whoop_tokens")` (FR-010), keeping `idb-keyval.clear()` for IndexedDB
- [x] T028 Run full test suite (`npm test`) and verify all tests pass
- [x] T029 Run `npm audit` and verify zero HIGH or CRITICAL vulnerabilities (final SC-001 check)
- [x] T030 Run quickstart.md verification commands: `npm test`, `npm audit`, `npm ls xlsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (CORS helper) — BLOCKS US4 and US5 (same files)
- **US2 (Phase 4)**: Depends on Phase 1 only — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 1 only — can run in parallel with US1
- **US4 (Phase 6)**: Depends on US1 (modifies same 3 endpoint files after CORS changes)
- **US5 (Phase 7)**: Depends on US4 (modifies same 3 endpoint files after validation changes)
- **US6 (Phase 8)**: No code dependencies — can run any time (dashboard config)
- **Polish (Phase 9)**: Depends on all phases completing

### User Story Dependencies

- **US1 (P1)**: Requires Foundational CORS helper → MVP
- **US2 (P2)**: Independent (config only) → can parallel with US1
- **US3 (P2)**: Independent (package.json only) → can parallel with US1
- **US4 (P2)**: Requires US1 complete (same files modified)
- **US5 (P3)**: Requires US4 complete (same files modified)
- **US6 (P3)**: Independent (dashboard config) → can run any time

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD — constitution Principle II)
- Implementation follows test definitions
- Commit after each task or logical group

### Parallel Opportunities

- **Phase 2**: T002 (test) then T003 (impl) — sequential within phase
- **Phase 3**: T004 and T005 can run in parallel (different test files)
- **Phase 3**: T006 and T007 can run in parallel (different endpoint files)
- **Phases 4, 5**: US2 and US3 can run in parallel with US1 (different files)
- **Phase 6**: T012, T013, T014 can run in parallel (different test files)
- **Phase 7**: T019, T020, T021, T022 can run in parallel (different files)
- **Phase 9**: T025 and T026 can run in parallel (different files)
- **US6**: Can run any time in parallel (dashboard, no code)

---

## Parallel Example: User Story 1

```bash
# Launch tests in parallel (different test files):
Task T004: "CORS enforcement tests in tests/api/cors.test.ts"
Task T005: "Proxy allowlist tests in tests/api/proxy-allowlist.test.ts"

# After tests written, launch endpoint updates in parallel (different files):
Task T006: "Update api/auth/callback.ts with CORS helper"
Task T007: "Update api/auth/refresh.ts with CORS helper"
# T008 sequential (proxy has both CORS + allowlist changes)
```

## Parallel Example: User Story 5

```bash
# All error response changes in parallel (different files):
Task T019: "Update .gitignore"
Task T020: "Remove detail from api/auth/callback.ts"
Task T021: "Remove detail from api/auth/refresh.ts"
Task T022: "Remove detail from api/whoop/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational CORS helper
3. Complete Phase 3: US1 — CORS enforcement + proxy allowlist
4. **STOP and VALIDATE**: Test CORS rejection and allowlist blocking independently
5. Deploy to verify strict origin enforcement in production

### Incremental Delivery

1. Setup + Foundational → CORS helper ready
2. US1 (CORS + allowlist) → Test independently → Deploy (MVP!)
3. US2 (security headers) + US3 (xlsx upgrade) → Test independently → Deploy
4. US4 (input validation) → Test independently → Deploy
5. US5 (error handling + .gitignore) → Test independently → Deploy
6. US6 (rate limiting via WAF) → Configure and verify → Done
7. Polish → Final verification → Complete

### Single Developer Strategy

Complete in strict priority order:

1. Phase 1 + 2 (setup + foundational)
2. Phase 3 (US1 — MVP)
3. Phase 4 + 5 in parallel (US2 + US3 — independent, config/package changes)
4. Phase 6 (US4 — depends on US1)
5. Phase 7 (US5 — depends on US4)
6. Phase 8 (US6 — dashboard config)
7. Phase 9 (polish + verification)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1, US4, US5 modify the same 3 serverless files → must be done sequentially
- US2, US3, US6 touch different files/configs → can parallel with anything
- Rate limiting (US6) is dashboard-only, no code — verify via deployment
- Constitution requires TDD: tests written and failing BEFORE implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
