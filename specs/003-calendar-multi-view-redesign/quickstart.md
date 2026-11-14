# Quickstart: Validate Calendar Multi-View Redesign

## Goal

Validate that week/month/day views, event lifecycle actions, and themed UI behavior work end-to-end.

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

### 1) Component and unit validation for new views

Run frontend tests:

```bash
npm run test:component
npm run test
```

Expected outcomes:
- New or updated calendar view components/pages pass tests.
- Week/month/day state transitions and day selection behavior are asserted.
- Event detail interaction states (open/edit/delete) are asserted.

### 2) E2E flow: week -> month

Run:

```bash
npx playwright test tests/e2e/calendar-navigation.spec.ts
```

Expected outcomes:
- Calendar loads in week view by default.
- User can switch to month view.
- Month view renders day buckets with discoverable events.

### 3) E2E flow: week -> day

Run:

```bash
npx playwright test tests/e2e/calendar-navigation.spec.ts --grep "week to day"
```

Expected outcomes:
- User can select a day in week view.
- Day view opens for selected date.
- Full event list for selected day is visible.

### 4) E2E flow: weekly create -> edit -> delete same event

Run:

```bash
npx playwright test tests/e2e/calendar-navigation.spec.ts --grep "create edit delete"
```

Expected outcomes:
- Event creation succeeds from week view.
- Event edit/save persists updated data.
- Event delete removes the same event from visible calendar state.

### 5) Backend resiliency and observability validation for range retrieval

Run backend contract and integration tests:

```bash
cd backend
pytest tests/contract/test_events_list_contract.py -k range
pytest tests/integration/test_event_range_resilience.py
```

Expected outcomes:
- Invalid range requests return clear validation errors.
- Transient range retrieval failures enforce documented timeout and bounded retry behavior.
- Failure responses expose clear user-visible error messages.
- Structured logs contain request context and failure reason for range retrieval failures.

## Related Artifacts

- Specification: `spec.md`
- Implementation plan: `plan.md`
- Research decisions: `research.md`
- Data model: `data-model.md`
- API contract addendum: `contracts/calendar-views-api.yaml`
- User journey contract: `contracts/calendar-view-journeys.md`
