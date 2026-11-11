# Phase 0 Research: SpeciaelFamily Calendar Task Management

## Decision 1: Frontend stack and runtime
- Decision: Use React 18 with TypeScript on Node.js 20 LTS for the web frontend.
- Rationale: React has mature ecosystem support for component testing and Playwright E2E workflows,
  while TypeScript improves interface correctness for REST and agent-response payloads.
- Alternatives considered:
  - Vue: viable but lower team alignment for current requirement set.
  - Server-rendered templates only: rejected due to richer interaction needs for day-view editing
    and agent question flows.

## Decision 2: Backend and API style
- Decision: Use Django 5 + Django REST Framework to expose versioned REST endpoints.
- Rationale: Django supports fast model-driven APIs, clear validation, and proven integration with
  PostgreSQL; DRF supports serializer-level rules for title uniqueness and stale-operation checks.
- Alternatives considered:
  - FastAPI: strong option but less direct integration with Django admin/model workflows.
  - GraphQL: rejected because requirement explicitly mandates REST.

## Decision 3: API documentation and contract governance
- Decision: Generate OpenAPI 3.1 contract and publish Swagger UI from backend.
- Rationale: Contract-first API docs satisfy interface clarity requirement and improve CI checks for
  backward compatibility.
- Alternatives considered:
  - Hand-written markdown API docs only: rejected due to drift risk.
  - Postman-only contract: rejected because OpenAPI is explicitly required.

## Decision 4: Persistence and data constraints
- Decision: Use PostgreSQL 16 with unique constraint on (task_date, title).
- Rationale: Enforces same-day uniqueness at database level while backend validation provides
  user-facing errors.
- Alternatives considered:
  - SQLite: rejected for production-like concurrency behavior needs.
  - In-memory storage: rejected due to persistence requirements.

## Decision 5: Agent integration pattern
- Decision: Backend mediates all agent requests and routes prompt context to local Ollama models.
- Rationale: Preserves constitutional requirement that frontend never directly calls agent runtime;
  enables consistent error handling and observability.
- Alternatives considered:
  - Frontend-direct Ollama calls: rejected for policy/control reasons.
  - Hosted external LLM: rejected because requirement specifies local Ollama.

## Decision 6: Ambiguous question handling
- Decision: For ambiguous date context (for example "What is next?"), default to selected calendar
  day; if no selected day exists, request clarification and do not guess beyond today.
- Rationale: Minimizes user confusion while preserving predictable behavior and testability.
- Alternatives considered:
  - Always infer "today": rejected because it ignores explicit calendar context.
  - Return hard error only: rejected because clarification prompt is more usable.

## Decision 7: Test strategy and coverage
- Decision: Enforce conventional pyramid: unit -> component -> integration -> E2E (Playwright),
  and collect both line and branch coverage in CI artifacts.
- Rationale: Balances fast feedback with behavior confidence across API/UI/agent boundaries.
- Alternatives considered:
  - E2E-heavy strategy: rejected due to slow feedback and brittle tests.
  - Unit-only strategy: rejected because integration and agent paths are high risk.

## Decision 8: Containerization and local orchestration
- Decision: Containerize frontend, backend, and supporting services with Docker; orchestrate with
  Docker Compose including PostgreSQL and Ollama containers.
- Rationale: Consistent local/dev execution and reproducible CI test environments.
- Alternatives considered:
  - Native host-only setup: rejected due to dependency drift.
  - Kubernetes-first setup: rejected as unnecessary for initial scope.

## Decision 9: CI execution model
- Decision: Create manually triggered CI workflow (`workflow_dispatch`) that runs lint checks,
  contract checks, tests by pyramid stage, and coverage report publication.
- Rationale: Meets initial requirement while allowing controlled rollout of quality gates.
- Alternatives considered:
  - Always-on push CI only: deferred until baseline pipeline stabilizes.
  - No CI: rejected due to quality and governance risks.

## Decision 10: Code quality guardrails
- Decision: Standardize formatting/linting/type checks and PR quality gates for both frontend and
  backend; enforce minimum branch and line coverage thresholds per project area.
- Rationale: Reduces regression risk and supports constitutional compliance review.
- Alternatives considered:
  - Reviewer-only quality process: rejected due to inconsistency.
  - Coverage without thresholds: rejected because it weakens signal value.
