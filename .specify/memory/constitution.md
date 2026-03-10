<!--
Sync Impact Report
===================
Version change: N/A (initial) → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles (5 principles)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ no changes needed
    (Constitution Check section is generic and will be filled per-feature)
  - .specify/templates/spec-template.md: ✅ no changes needed
    (spec template is technology-agnostic by design)
  - .specify/templates/tasks-template.md: ✅ no changes needed
    (task template is generic; TDD tasks are optional per spec)
  - .claude/commands/*: ✅ no agent-specific name issues found
Follow-up TODOs: None
-->

# whoop-explorer Constitution

## Core Principles

### I. Privacy-First (Client-Side Only)

All data processing MUST happen entirely within the user's browser.
Health data MUST never be transmitted to, stored on, or routed
through any external server. There is no backend.

- The application MUST use browser-native APIs (File API,
  IndexedDB, localStorage) for all data handling.
- Network requests are permitted ONLY for loading the application
  itself (static assets) and for authenticated calls to the
  WHOOP API initiated and controlled by the user.
- No analytics, telemetry, or tracking services that transmit
  user health data are permitted.

**Rationale**: Users are trusting this tool with sensitive health
data. Zero-server architecture eliminates an entire class of data
breach, compliance, and trust risks.

### II. Test-Driven Development (NON-NEGOTIABLE)

All feature work MUST follow the TDD cycle: write tests first,
verify they fail, then implement until tests pass.

- Tests MUST be written and approved before implementation begins.
- Red-Green-Refactor cycle is strictly enforced.
- Test coverage MUST cover acceptance scenarios defined in specs.
- Tests MUST be independently runnable and deterministic.

**Rationale**: TDD ensures correctness from the start, prevents
regressions, and produces a living specification of behavior.

### III. Simplicity & YAGNI

Every feature and abstraction MUST justify its existence against
current, concrete requirements. Do not build for hypothetical
future needs.

- Prefer fewer files and inline solutions over premature
  abstractions.
- Three similar lines of code are better than a premature helper.
- No feature flags, configuration layers, or plugin systems
  unless explicitly required by a spec.
- Remove dead code immediately; do not comment it out.

**Rationale**: Complexity is the primary enemy of maintainability
in a small-team project. Each abstraction layer adds cognitive
overhead that slows future development.

### IV. User-Friendly Design

The application MUST be simple and intuitive for non-technical
users who want to explore their WHOOP data.

- UI flows MUST be self-explanatory without requiring
  documentation or tutorials.
- Error messages MUST be written in plain language with clear
  recovery actions.
- Data visualizations MUST be clean, readable, and accessible.
- The app MUST be responsive and work on both desktop and mobile
  browsers.

**Rationale**: The target audience is health-conscious individuals,
not developers. If a user needs to read docs to use the app, the
design has failed.

### V. Modern Frontend Practices

The codebase MUST follow current TypeScript and frontend
engineering standards.

- TypeScript strict mode MUST be enabled; `any` types are
  prohibited except with explicit justification.
- Component-based architecture with clear separation of concerns.
- Accessibility (WCAG 2.1 AA) MUST be maintained for all UI
  components.
- Dependencies MUST be kept minimal; each dependency MUST be
  justified by significant complexity reduction.

**Rationale**: Modern practices reduce bugs, improve developer
experience, and ensure the app remains maintainable as the
ecosystem evolves.

## Technology Constraints

- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Runtime**: Browser only — no Node.js server, no SSR
- **Data Storage**: Browser-native only (IndexedDB, localStorage,
  File API)
- **Deployment**: Static file hosting (no server-side logic)
- **API Communication**: Direct browser-to-WHOOP-API calls only,
  authenticated and user-initiated
- **Testing**: Vitest (unit/integration), Playwright or similar
  (e2e, if needed)

## Development Workflow

- **Feature Development**: Spec → Plan → Tasks → Implement
  (using the speckit workflow)
- **TDD Cycle**: Write failing tests → Implement → Refactor →
  Verify all tests pass
- **Code Quality**: Linting (ESLint) and formatting (Prettier)
  MUST pass before commit
- **Commits**: Atomic commits with conventional commit messages
- **Reviews**: All changes MUST be reviewed against constitution
  principles before merge

## Governance

This constitution is the highest-authority document for the
whoop-explorer project. It supersedes all other practices,
conventions, and ad-hoc decisions.

- **Amendments**: Any change to this constitution MUST be
  documented with a version bump, rationale, and migration plan
  for affected artifacts.
- **Versioning**: MAJOR for principle removals/redefinitions,
  MINOR for new principles or material expansions, PATCH for
  clarifications and wording fixes.
- **Compliance**: All PRs and code reviews MUST verify alignment
  with these principles. Violations are blocking.
- **Conflict Resolution**: When a spec, plan, or task conflicts
  with the constitution, the constitution wins. Adjust the
  downstream artifact, not the principle.

**Version**: 1.0.0 | **Ratified**: 2026-03-03 | **Last Amended**: 2026-03-03
