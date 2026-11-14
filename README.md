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
