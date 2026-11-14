# Quickstart: Validate Calendar Event E2E Coverage

## Goal

Run Playwright end-to-end validation for the required user journeys:

- Create all-day event
- Create timed event
- Delete event

## Prerequisites

- Backend and frontend dependencies installed.
- Local PostgreSQL, backend, and frontend services running.
- Browser runtime installed for Playwright.

## Environment Setup

1. Start infrastructure services from repository root:

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

4. Install Playwright runtime in `frontend/` (one-time per environment):

```bash
npm install -D @playwright/test
npx playwright install
```

## Run Validation

From `frontend/`, run only E2E specs:

```bash
npx playwright test tests/e2e
```

## Expected Outcomes

- The suite reports three passing journeys aligned with `contracts/e2e-event-journeys.md`.
- Reports clearly indicate failing stage (create, retrieve/list, delete) if a regression occurs.
- No residual event test data blocks immediate rerun.

## Troubleshooting

- If backend connectivity fails, verify backend is reachable on `http://localhost:8000`.
- If frontend page cannot load, verify Vite is reachable on `http://localhost:5173`.
- If tests are flaky due to stale data, clear targeted test records and rerun with unique titles.

## Related Artifacts

- Specification: `spec.md`
- Implementation plan: `plan.md`
- Research decisions: `research.md`
- Data model: `data-model.md`
- Journey contract: `contracts/e2e-event-journeys.md`
