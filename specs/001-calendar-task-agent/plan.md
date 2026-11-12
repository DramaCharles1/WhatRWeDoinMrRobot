# Implementation Plan: Simple Home Calendar MVP

**Branch**: `001-calendar-task-agent` | **Date**: 2026-11-12 | **Spec**: `specs/001-calendar-task-agent/spec.md`

**Input**: Feature specification from `specs/001-calendar-task-agent/spec.md`

## Summary

Deliver a minimal home calendar using a straightforward client-server architecture: a React +
TypeScript frontend, a Django REST Framework backend, and a PostgreSQL database. Scope is limited
to essential planning: choose a day, list its events, create/edit/delete events (timed or
all-day), deterministic ordering, and persistence. No login, no automation, and no agent features.
The frontend talks to the backend exclusively through a REST API and never to the database.

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript 5.x strict mode + Node.js 20 LTS (frontend)

**Primary Dependencies**:
- Frontend: React, TypeScript, Vite, React Router, ESLint, Prettier, Vitest, React Testing Library
- Backend: Django, Django REST Framework, Ruff, mypy, pytest, pytest-django, coverage.py

**Storage**: PostgreSQL (accessed only by the backend through the Django ORM)

**Testing**: Vitest + React Testing Library (frontend unit/component); pytest + pytest-django
(backend unit, integration, API contract); coverage.py for backend coverage

**Target Platform**: Localhost / local network; desktop, tablet, and mobile browsers

**Project Type**: Web application (frontend + backend + database)

**Performance Goals**: Meet spec success criteria SC-001 to SC-004 (fast create/edit/delete and
in-place updates without page refresh)

**Constraints**:
- REST-only communication between frontend and backend; no direct database access from frontend
- Backend API base URL configured through frontend environment variables
- Simple state management (React state/hooks only); no extra state libraries
- Loading, error, and empty states in all data-driven views
- No authentication; not exposed to the public internet

**Scale/Scope**: One shared home calendar; single entity (Event); one frontend app, one backend API,
one database

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-Design Gate Review:
- Principle I (User-First Calendar Experience): PASS. Responsive, minimal day-view workflow.
- Principle II (Simple, Backend-Defined Data Contracts): PASS. Versioned REST contract owned by
  the backend; frontend uses it exclusively.
- Principle III (Testable Task Workflows): PASS. Create/edit/delete/list, validation, and ordering
  are covered by automated tests at backend and frontend levels.
- Principle IV (Reliable Integrations and Observability): PASS. Basic structured logs, clear error
  messages, and a health endpoint; no dashboards required.
- Principle V (Security and Data Boundaries): PASS. Local-only deployment, no sensitive data.

Post-Design Gate Review:
- PASS. Research, data model, API contract, and quickstart stay within MVP scope and satisfy the
  constitution (documented setup, documented testing, enforced quality tooling).

## Project Structure

### Documentation (this feature)

```text
specs/001-calendar-task-agent/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── apps/
│   └── calendar/        # models, serializers, views, event ordering logic
├── api/
│   └── v1/              # URL routing and error handling
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── manage.py

frontend/
├── src/
│   ├── components/      # reusable UI pieces
│   ├── pages/           # application-specific pages (calendar page)
│   ├── services/        # REST API client
│   └── types/
└── tests/
    ├── unit/
    └── component/

infra/
└── docker-compose.yml   # optional local PostgreSQL / full-stack startup
```

**Structure Decision**: Keep the existing frontend/backend split. The agent app, agent endpoints,
Ollama client, observability dashboards, and alert assets are out of scope and are to be removed
during implementation. Reusable components are separated from application-specific pages.


## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
