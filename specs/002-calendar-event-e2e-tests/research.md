# Research: Calendar Event E2E Coverage

## Decision 1: Use Playwright as the end-to-end runner

- Decision: Adopt `@playwright/test` as the browser automation framework for this feature.
- Rationale: It provides reliable user-flow automation, rich assertion APIs, deterministic retries/timeouts, and artifact capture (trace/screenshot/video) that supports requirement FR-008 for clear failure diagnostics.
- Alternatives considered:
  - Cypress: Strong option, but would introduce a second E2E stack when Playwright is explicitly requested.
  - Pure API integration tests only: Does not validate frontend-to-backend user journey behavior end to end.

## Decision 2: Validate journeys through UI actions with backend-observable outcomes

- Decision: Author tests that create/delete events through the frontend and assert outcomes via the day listing shown to the user.
- Rationale: This matches user value and constitution principles by verifying the complete flow, not just isolated API calls.
- Alternatives considered:
  - Seed and verify only via direct API calls in tests: Faster but weakens end-to-end confidence in form flow and UI wiring.
  - Direct database assertions: Violates desired abstraction and increases coupling to storage internals.

## Decision 3: Enforce deterministic test data isolation

- Decision: Use unique event titles per test run and enforce per-test cleanup so scenarios are repeatable from known state.
- Rationale: Prevents cross-test contamination and supports stable reruns required by FR-007 and SC-002.
- Alternatives considered:
  - Shared static fixture data: Simpler setup but fragile under parallel/duplicate execution.
  - Global cleanup only at suite end: Increases risk of cascading failures when a single test aborts early.

## Decision 4: Keep execution scoped to local service topology

- Decision: Run tests against the existing local frontend/backend services (localhost) and keep environment assumptions local-network only.
- Rationale: Aligns with constitution security boundaries and current project setup where backend and frontend are already run locally.
- Alternatives considered:
  - External hosted test environment: Out of scope for this local MVP and adds unnecessary operational overhead.
  - Browser-mocked backend: Useful for component testing, but not valid for this true end-to-end scope.

## Decision 5: Define journey-level contract expectations in documentation

- Decision: Add a dedicated contract artifact that maps each E2E journey to preconditions, user actions, and expected outcomes.
- Rationale: Provides an explicit, reviewable interface contract for test behavior without introducing implementation details into the spec.
- Alternatives considered:
  - Keep expectations only in test code: Harder to review against spec before implementation.
  - Duplicate full API schema in this feature: Redundant with existing API contract assets.
