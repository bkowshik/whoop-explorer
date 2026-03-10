# Implementation Plan: Security Audit & Hardening

**Branch**: `002-security-audit` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-security-audit/spec.md`

## Summary

Harden the WHOOP Explorer application against identified security vulnerabilities: enforce strict CORS policies on all serverless endpoints (eliminating wildcard fallback), add security response headers via Vercel configuration (CSP in report-only mode), implement proxy path allowlisting, validate all serverless function inputs, remediate known dependency vulnerabilities (SheetJS upgrade), suppress internal error details from client responses, and apply frontend security fixes (DevTools guard, scoped logout).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: React 19, TanStack Query v5, Vite 7, xlsx (SheetJS), Vercel serverless functions
**Storage**: localStorage (OAuth tokens), IndexedDB via idb-keyval (query cache)
**Testing**: Vitest 4
**Target Platform**: Browser (SPA) + Vercel serverless functions (API proxy)
**Project Type**: Web application (SPA + serverless API layer)
**Performance Goals**: No degradation from security changes
**Constraints**: No new runtime dependencies (constitution Principle III — Simplicity); rate limiting via Vercel WAF (no code-level implementation)
**Scale/Scope**: Single developer, personal use app, ~25 source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Privacy-First (Client-Side Only) | **Pre-existing tension** | Constitution states "no backend" and "static file hosting only", but the project already has 3 Vercel serverless functions for OAuth token exchange (client secret protection) and API proxying. This feature modifies existing server-side code but does not add new server-side logic. The serverless functions exist to protect secrets that cannot be exposed client-side. |
| II. Test-Driven Development | **Pass** | All changes will follow TDD: write failing tests first, then implement. Test files identified in quickstart.md. |
| III. Simplicity & YAGNI | **Pass** | All changes address concrete, documented vulnerabilities from the audit — no hypothetical threats. Rate limiting uses Vercel WAF (zero code, zero dependencies). SheetJS upgrade is a drop-in version bump. No new abstractions introduced. |
| IV. User-Friendly Design | **Pass** | FR-006 requires generic, plain-language error messages. No user-facing UI changes. |
| V. Modern Frontend Practices | **Pass** | TypeScript strict mode maintained. Dependency vulnerability remediation aligns with "Dependencies MUST be kept minimal; each dependency MUST be justified." |

**Gate result**: PASS — no blocking violations. Pre-existing tension with Principle I is documented and justified (client secret protection requirement predates this feature).

### Post-Phase 1 Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Privacy-First | **Same** | No new server-side logic added. Existing functions hardened only. |
| II. TDD | **Pass** | Test plan defined for all changes. |
| III. Simplicity & YAGNI | **Pass** | Shared CORS helper is the only new abstraction — justified by DRY across 3 endpoints. |
| IV. User-Friendly Design | **Pass** | Error messages are generic and user-facing. |
| V. Modern Frontend | **Pass** | xlsx upgrade resolves CVEs. No new dependencies added. |

## Project Structure

### Documentation (this feature)

```text
specs/002-security-audit/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: entity/config definitions
├── quickstart.md        # Phase 1: implementation guide
├── contracts/
│   └── api-security.md  # Phase 1: API contract changes
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
api/
├── auth/
│   ├── callback.ts      # Modified: CORS, validation, error handling
│   └── refresh.ts       # Modified: CORS, validation, error handling
└── whoop/
    └── index.ts         # Modified: CORS, validation, allowlist, error handling

src/
├── App.tsx              # Modified: DevTools guard
└── lib/
    └── auth.ts          # Modified: scoped logout

vercel.json              # Modified: security headers block
.gitignore               # Modified: broader .env* patterns
package.json             # Modified: xlsx version upgrade

tests/
├── api/
│   ├── cors.test.ts           # New: CORS enforcement
│   ├── callback-validation.test.ts  # New: callback input validation
│   ├── refresh-validation.test.ts   # New: refresh input validation
│   ├── proxy-allowlist.test.ts      # New: path allowlist
│   └── error-responses.test.ts      # New: error detail suppression
└── lib/
    └── auth.test.ts     # Modified: scoped logout tests
```

**Structure Decision**: No structural changes. All modifications are to existing files. New test files follow the existing `tests/` directory convention.

## Complexity Tracking

No constitution violations requiring justification. The shared CORS helper is the only new abstraction, justified by eliminating duplicated CORS logic across 3 endpoints (DRY principle).
