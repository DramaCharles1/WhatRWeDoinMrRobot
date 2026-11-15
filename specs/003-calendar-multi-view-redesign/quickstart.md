# Quickstart: Validate Calendar Multi-View Redesign

## Goal

Validate that week/month/day views, event lifecycle actions, and themed UI behavior work end-to-end.

## Phase 1 Setup Checklist (Workstream Anchor)

- [x] Confirm scaffold tests exist for view switching, day view rendering, event detail interactions, and range resilience.
- [x] Confirm Playwright spec includes placeholders for week->month, week->day, and weekly create/edit/delete flows.
- [x] Confirm this checklist is updated to `[x]` only after foundational and story tasks land.

## Prerequisites

- Python and Node dependencies installed.
- PostgreSQL available locally (Docker or local service).
- Backend and frontend services running.

## Environment Setup

1. Start PostgreSQL from repository root:

```bash
docker compose -f infra/docker-compose.yml up -d postgres
```

2. Start backend from `backend/`:

```bash
pip install -e .[dev]
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

3. Start frontend from `frontend/`:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

4. Install Playwright browsers in `frontend/` (one-time):

```bash
npx playwright install
```

## Validation Scenarios

### 1) Frontend component/unit validation for new views

Run from `frontend/`:

```bash
npm run test:component
npm run test
```

Expected outcomes:
- Exit code is `0` for both commands.
- Vitest reports passing suites for updated calendar components/pages.
- Week/month/day state transitions and day selection behavior are asserted.
- Event detail interaction states (open/edit/delete) are asserted.

### 2) Required Playwright E2E flow: week -> month

Run from `frontend/`:

```bash
npx playwright test tests/e2e/calendar-navigation.spec.ts
```

Expected outcomes:
- Exit code is `0`.
- Calendar loads in week view by default.
- User can switch to month view.
- Month view renders day buckets with discoverable events.

### 3) Required Playwright E2E flow: week -> day

Run from `frontend/`:

```bash
npx playwright test tests/e2e/calendar-navigation.spec.ts --grep "week to day"
```

Expected outcomes:
- Exit code is `0`.
- User can select a day in week view.
- Day view opens for selected date.
- Full event list for selected day is visible.

### 4) Required Playwright E2E flow: weekly create -> edit -> delete same event

Run from `frontend/`:

```bash
npx playwright test tests/e2e/calendar-navigation.spec.ts --grep "create edit delete"
```

Expected outcomes:
- Exit code is `0`.
- Event creation succeeds from week view.
- Event edit/save persists updated data.
- Event delete removes the same event from visible calendar state.

### 5) Backend contract/integration validation for range observability and retry/timeout

Run from `backend/`:

```bash
pytest tests/contract/test_events_list_contract.py -k range
pytest tests/integration/test_event_range_resilience.py
```

Expected outcomes:
- Exit code is `0` for both commands.
- Invalid range requests return clear validation errors.
- Transient range retrieval failures enforce documented timeout and bounded retry behavior.
- Failure responses expose clear user-visible error messages.
- Structured logs contain request context and failure reason for range retrieval failures.

## Final Validation Commands (Phase 6)

Use this exact command sequence before release signoff:

```bash
# backend/
pytest tests/contract/test_events_list_contract.py -k range
pytest tests/integration/test_event_range_resilience.py

# frontend/
npm run test:component
npm run test
npx playwright test tests/e2e/calendar-navigation.spec.ts
```

Expected aggregate outcome:
- All commands return exit code `0`.
- No failing tests in backend contract/integration, frontend component/unit, or required Playwright flows.

## Related Artifacts

- Specification: `spec.md`
- Implementation plan: `plan.md`
- Research decisions: `research.md`
- Data model: `data-model.md`
- API contract addendum: `contracts/calendar-views-api.yaml`
- User journey contract: `contracts/calendar-view-journeys.md`
