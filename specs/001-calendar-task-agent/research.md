# Phase 0 Research: Simple Home Calendar MVP

No open clarifications remain; the spec and the supplied architecture/tooling requirements resolve
all technical unknowns.

## Decision 1: Architecture
- Decision: Client-server with three components: React + TypeScript frontend, Django + DRF
  backend, PostgreSQL database. Frontend and backend communicate only via REST; the frontend never
  accesses the database.
- Rationale: Simple, conventional, and matches the constitution's backend-defined contract rule.
- Alternatives considered:
  - Server-rendered Django templates: rejected; a React UI is the chosen frontend.
  - Direct frontend-to-database access: rejected; violates the architecture constraint.

## Decision 2: Frontend stack
- Decision: React, TypeScript (strict), Vite, React Router, ESLint, Prettier, Vitest, React Testing
  Library.
- Rationale: Small, well-supported toolchain; strict typing guards the REST payload shapes.
- Alternatives considered:
  - Additional state libraries (Redux, etc.): rejected; React state/hooks are sufficient.
  - E2E framework (Playwright): deferred; component tests cover MVP flows.

## Decision 3: Frontend structure and API access
- Decision: Reusable components separated from application-specific pages; a single small API
  client module using `fetch`; backend base URL from a Vite environment variable
  (`VITE_API_BASE_URL`). Loading, error, and empty states in every data-driven view; responsive
  layout for desktop, tablet, and mobile.
- Rationale: Straightforward, avoids unnecessary abstraction, easy to test and configure.
- Alternatives considered:
  - HTTP client library (axios): rejected as unnecessary.
  - Hardcoded API URL: rejected; breaks across environments.

## Decision 4: Backend stack
- Decision: Python, Django, Django REST Framework, Django ORM, Ruff, mypy, pytest, pytest-django,
  coverage.py. Endpoints, serializers, and business rules kept in separate, small modules.
- Rationale: Established Django conventions; serializers hold validation; minimal layering.
- Alternatives considered:
  - FastAPI: rejected; Django/DRF is the chosen stack.
  - Extra service/repository layers: rejected as unnecessary for one entity.

## Decision 5: Event model
- Decision: Single `Event` entity with title, date, `is_all_day`, nullable `start_time` and
  `end_time`, optional notes, and created/updated timestamps. All-day events are single-day and
  have no times; timed events require both times with end after start.
- Rationale: Directly satisfies FR-003, FR-004, FR-013, FR-015 with minimal schema.
- Alternatives considered:
  - Start/end datetimes with time zones: rejected; time-zone handling is out of MVP scope.
  - Recurrence fields: rejected; out of scope.

## Decision 6: Day ordering
- Decision: Backend returns a day's events ordered all-day first, then by `start_time`, then by
  `created_at` (creation order tie-breaker). The frontend renders the list as received.
- Rationale: Single source of ordering truth; deterministic and testable (FR-006a/b/c).
- Alternatives considered:
  - Frontend-side sorting: rejected; duplicates logic and risks divergence.

## Decision 7: Duplicates and validation
- Decision: Duplicate titles on the same day are allowed (no unique constraint). Title is required
  and trimmed; time rules are validated in the serializer and mirrored by a database check
  constraint where practical.
- Rationale: Matches FR-014 and FR-008/FR-013.
- Alternatives considered:
  - Unique (date, title) constraint: rejected by spec decision.

## Decision 8: Persistence
- Decision: PostgreSQL via Django ORM and migrations; data survives refreshes and restarts.
- Rationale: Required by FR-012; PostgreSQL is the specified database.
- Alternatives considered:
  - SQLite or browser storage: rejected; PostgreSQL is specified and backend is the source of truth.

## Decision 9: Testing and quality gates
- Decision: Backend unit, integration, and API contract tests with pytest/pytest-django; coverage
  via coverage.py; Ruff and mypy as lint/type gates. Frontend component and unit tests with
  Vitest + React Testing Library; ESLint and Prettier checks. Test and setup instructions are
  documented in `quickstart.md`.
- Rationale: Satisfies constitution principles III and the documentation/quality-gate rules.
- Alternatives considered:
  - Manual-only verification: rejected; constitution requires automated tests.

## Decision 10: Local operations
- Decision: Run on localhost/local network only. Backend emits basic structured logs, returns
  clear JSON error bodies, and exposes `GET /api/v1/health`. Docker Compose is optional for
  starting PostgreSQL (and the stack) locally.
- Rationale: Meets constitution principles IV and V without dashboards or alerting.
- Alternatives considered:
  - Metrics/dashboards/alerts: rejected as out of MVP scope.

## Decision 11: Breaking-change governance for Task-to-Event cutover
- Decision: Use explicit feature-level approval artifacts for the intentional API/schema break,
  recorded in both `spec.md` and `plan.md` (rationale, consumer impact, rollback/mitigation,
  and reviewer sign-off requirement).
- Rationale: Satisfies constitution delivery constraint requiring backward compatibility unless a
  breaking change is explicitly approved.
- Alternatives considered:
  - Constitution amendment: rejected; unnecessary for a single feature-level break.
  - Backward-compatibility shim: rejected; adds complexity outside MVP scope.
