# Quickstart: Security Audit & Hardening

**Feature**: 002-security-audit | **Date**: 2026-03-03

## Prerequisites

- Node.js 18+
- Vercel CLI (`npm i -g vercel`) for local development
- Access to Vercel dashboard for WAF rate limit configuration

## Files to Modify

### Serverless Functions (CORS, input validation, error handling)

| File | Changes |
|------|---------|
| `api/auth/callback.ts` | Strict CORS, input validation, remove `detail` from errors |
| `api/auth/refresh.ts` | Strict CORS, input validation, remove `detail` from errors |
| `api/whoop/index.ts` | Strict CORS, path allowlist, input validation, remove `detail` from errors |

### Configuration

| File | Changes |
|------|---------|
| `vercel.json` | Add `headers` block with security headers |
| `.gitignore` | Add `.env` and `.env.*` patterns |
| `package.json` | Upgrade `xlsx` to CDN tarball 0.20.3 |

### Frontend

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap `ReactQueryDevtools` in `import.meta.env.DEV` check |
| `src/lib/auth.ts` | Replace `localStorage.clear()` with key-specific removal |

### Tests

| File | Changes |
|------|---------|
| `tests/api/cors.test.ts` | New — CORS enforcement tests |
| `tests/api/callback-validation.test.ts` | New — callback input validation tests |
| `tests/api/refresh-validation.test.ts` | New — refresh input validation tests |
| `tests/api/proxy-allowlist.test.ts` | New — proxy path allowlist tests |
| `tests/api/error-responses.test.ts` | New — error detail suppression tests |
| `tests/lib/auth.test.ts` | Update — test key-specific logout cleanup |

## Key Implementation Order

1. **Shared CORS helper** — Extract and test the CORS validation logic first (used by all 3 endpoints)
2. **Input validation** — Add to each endpoint with tests
3. **Proxy allowlist** — Add path prefix checking with tests
4. **Error response hardening** — Remove `detail` fields, add logging
5. **Security headers** — Add to `vercel.json`
6. **Dependency upgrade** — Swap xlsx version
7. **Frontend fixes** — DevTools guard, logout cleanup
8. **gitignore update** — Extend `.env*` patterns
9. **Rate limiting** — Configure Vercel WAF (dashboard)

## Verification Commands

```bash
# Run all tests
npm test

# Check for dependency vulnerabilities
npm audit

# Verify xlsx version
npm ls xlsx

# Local dev (tests serverless functions)
vercel dev
```
