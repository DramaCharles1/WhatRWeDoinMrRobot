# WhatRWeDoinMrRobot

SpeciaelFamily calendar task management prototype with backend-mediated local agent Q&A.

## Services

- `frontend/`: React + TypeScript calendar UI
- `backend/`: Django REST API with task CRUD and agent endpoints
- `infra/`: Docker Compose and observability scaffolding

## Deterministic Behaviors

- Empty task title validation message is exactly `Title is required.`
- Stale delete conflict message is exactly `This task was already removed in another tab.`
- Agent unavailable message is exactly `Calendar wizard guy is not home at the momen`
- Ambiguous agent questions without selected-day context return `clarification_required`

## Quick Start

```bash
docker compose -f infra/docker-compose.yml up --build -d
```
