# WhatRWeDoinMrRobot

SpeciaelFamily calendar event scheduling MVP with a Django REST backend and React frontend.

## Services

- `frontend/`: React + TypeScript calendar UI
- `backend/`: Django REST API with Event CRUD endpoints
- `infra/`: Docker Compose and observability scaffolding

## Deterministic Behaviors

- Empty event title validation message is exactly `Title is required.`
- Missing-event delete message is exactly `Delete failed: Event not found.`

## Migration Notes

- FR-026: migrating to this MVP discards legacy Task records and legacy agent/API surfaces.
- Supported API surface is Event-only: `/api/v1/health`, `/api/v1/events`, `/api/v1/events/{eventId}`.

## Quick Start

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

## Container Management

Start all containers:

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

Start only PostgreSQL (useful for local backend/frontend development):

```bash
docker compose -f infra/docker-compose.yml up -d postgres
```

Stop containers:

```bash
docker compose -f infra/docker-compose.yml down
```

## How To Run Tests

Backend (from `backend/`):

```bash
python -m pytest tests/unit tests/contract tests/integration
```

Frontend (from `frontend/`):

```bash
npm run test:component
```

## Static Code Analysis

Backend static checks (from `backend/`):

```bash
ruff check .
mypy .
python manage.py check
```

Frontend static checks (from `frontend/`):

```bash
npm run lint
npm run typecheck
```

## Swagger API Documentation

With the backend running on port `8000`, open:

- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI schema: `http://localhost:8000/api/schema/`
