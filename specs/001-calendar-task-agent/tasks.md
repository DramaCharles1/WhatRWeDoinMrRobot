---

description: "Task list for implementing SpeciaelFamily Calendar Task Management"
---

# Tasks: SpeciaelFamily Calendar Task Management

**Input**: Design documents from `/specs/001-calendar-task-agent/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize repository structure and baseline tooling for frontend, backend, and infra services.

- [ ] T001 Create backend and frontend base directories per plan in backend/, frontend/, and infra/
- [ ] T002 Initialize Django backend dependencies and settings scaffold in backend/pyproject.toml and backend/backend/settings.py
- [ ] T003 [P] Initialize React + TypeScript frontend scaffold in frontend/package.json and frontend/src/main.tsx
- [ ] T004 [P] Create Docker orchestration skeleton for frontend/backend/postgres/ollama in infra/docker-compose.yml
- [ ] T005 [P] Add manually triggered CI workflow skeleton with workflow_dispatch in .github/workflows/ci-manual.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared contracts, persistence, observability, and API wiring required before user stories.

**CRITICAL**: Complete this phase before starting user story implementation.

- [ ] T006 Create Task persistence model with constraints "title: string, required, non-empty, trimmed, max length 200", "task_date: date, required (ISO date)", "creator_name: string, required, non-empty, max length 100", and "notes: string, optional, max length 2000" in backend/apps/calendar/models.py
- [ ] T007 Add database constraints and indexes for unique "(task_date, title)", task_date index, and updated_at index in backend/apps/calendar/migrations/0001_initial.py
- [ ] T008 [P] Implement shared API error envelope and conflict code mapping in backend/api/v1/errors.py
- [ ] T009 [P] Configure DRF, drf-spectacular, and versioned API router at /api/v1 in backend/api/v1/urls.py and backend/backend/settings.py
- [ ] T010 [P] Implement structured logging, correlation ID middleware, and request timing metrics in backend/services/observability.py and backend/backend/middleware.py
- [ ] T011 Create OpenAPI alignment check and snapshot validation against specs/001-calendar-task-agent/contracts/openapi.yaml in backend/tests/contract/test_openapi_contract.py
- [ ] T012 [P] Create shared frontend API client, typed DTOs, and error parsing for backend contracts in frontend/src/services/apiClient.ts and frontend/src/types/api.ts

**Checkpoint**: Foundation complete. User stories can now be implemented and tested independently.

---

## Phase 3: User Story 1 - Manage Daily Tasks (Priority: P1) 🎯 MVP

**Goal**: Let users create, edit, and remove tasks for a selected calendar day with validation and stale-operation handling.

**Independent Test**: From the day view, create a task with title/date/creator, edit it, then delete it; verify updates persist and stale delete/edit shows "This task was already removed in another tab." with list refresh.

### Tests for User Story 1

- [ ] T013 [P] [US1] Add backend contract tests for POST /tasks, PATCH /tasks/{taskId}, and DELETE /tasks/{taskId} including 400/404/409 paths in backend/tests/contract/test_tasks_crud.py
- [ ] T014 [P] [US1] Add backend integration tests for non-empty title, same-day duplicate title rejection, and stale operation conflict message in backend/tests/integration/test_task_crud_flows.py
- [ ] T015 [P] [US1] Add frontend component tests for create/edit/delete task flows and validation errors in frontend/tests/component/taskEditor.spec.tsx

### Implementation for User Story 1

- [ ] T016 [US1] Implement Task serializers with validation rules "Title must not be blank.", "(task_date, title) must be unique.", and "Creator name must be present for create operations." in backend/apps/calendar/serializers.py
- [ ] T017 [US1] Implement task create/update/delete service with stale-operation rejection message "This task was already removed in another tab." in backend/apps/calendar/services/task_service.py
- [ ] T018 [US1] Implement task CRUD API views for /tasks and /tasks/{taskId} responses matching openapi.yaml in backend/apps/calendar/views.py
- [ ] T019 [US1] Wire task CRUD routes into API v1 router in backend/api/v1/urls.py
- [ ] T020 [P] [US1] Build task form component with fields title/date/creator_name/notes and client-side required checks in frontend/src/components/TaskForm.tsx
- [ ] T021 [P] [US1] Build task list item/editor interactions for inline update and remove actions in frontend/src/components/TaskList.tsx
- [ ] T022 [US1] Implement frontend task CRUD service methods calling /api/v1/tasks endpoints in frontend/src/services/tasksService.ts
- [ ] T023 [US1] Integrate optimistic refresh and stale-conflict fallback to refetch selected day after 409 in frontend/src/pages/CalendarPage.tsx

**Checkpoint**: User Story 1 is independently functional and can be demoed as MVP.

---

## Phase 4: User Story 2 - View and Navigate Schedule (Priority: P2)

**Goal**: Allow users to navigate days and view each day-specific task list, including explicit empty state messaging.

**Independent Test**: Populate tasks on different dates, switch between dates, verify only selected date tasks are displayed, and verify empty day message appears when no tasks exist.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add backend integration tests for date-filtered list endpoint GET /tasks?date=YYYY-MM-DD in backend/tests/integration/test_task_day_listing.py
- [ ] T025 [P] [US2] Add frontend component tests for date navigation and empty-state rendering in frontend/tests/component/calendarDayNavigation.spec.tsx
- [ ] T026 [P] [US2] Add Playwright E2E scenario for cross-day navigation correctness in frontend/tests/e2e/calendar-navigation.spec.ts

### Implementation for User Story 2

- [ ] T027 [US2] Implement day-filtered task list endpoint returning TaskListResponse in backend/apps/calendar/views.py
- [ ] T028 [P] [US2] Implement calendar day selector UI with previous/next and direct date selection in frontend/src/components/DayNavigator.tsx
- [ ] T029 [US2] Integrate selected-date state management and day list fetching in frontend/src/pages/CalendarPage.tsx
- [ ] T030 [US2] Add explicit no-task state "No tasks scheduled" for empty day responses in frontend/src/components/TaskListEmptyState.tsx

**Checkpoint**: User Stories 1 and 2 both function independently and together.

---

## Phase 5: User Story 3 - Ask Calendar Questions via Agent (Priority: P3)

**Goal**: Support backend-mediated agent session and Q&A over calendar data with deterministic unavailable and ambiguity handling.

**Independent Test**: Start an agent session, ask "What do I have today?" and receive day-aligned summary; when Ollama is unavailable, UI shows "Calendar wizard guy is not home at the momen"; ambiguous question without selected day returns clarification prompt.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add contract tests for POST /agent/session and POST /agent/query including 422 and 503 responses in backend/tests/contract/test_agent_endpoints.py
- [ ] T032 [P] [US3] Add integration tests for ambiguity handling, selected-day default context, and unavailable-agent error text in backend/tests/integration/test_agent_query_flows.py
- [ ] T033 [P] [US3] Add frontend component tests for agent connect, ask, answer, clarification, and unavailable error rendering in frontend/tests/component/agentPanel.spec.tsx

### Implementation for User Story 3

- [ ] T034 [US3] Implement AgentSession and AgentQuery models with status enums and timestamps in backend/apps/agent/models.py
- [ ] T035 [US3] Implement Ollama gateway with timeout/retry/fallback behavior and structured error metadata in backend/services/ollama_client.py
- [ ] T036 [US3] Implement agent session creation API and availability checks for /agent/session in backend/apps/agent/views.py
- [ ] T037 [US3] Implement /agent/query pipeline that uses selected day context and returns clarification_required for ambiguous questions without date context in backend/apps/agent/services/query_service.py
- [ ] T038 [US3] Ensure unavailable agent response message is exactly "Calendar wizard guy is not home at the momen" in backend/apps/agent/views.py
- [ ] T039 [P] [US3] Build frontend agent panel UI for connect, question entry, response display, and clarification prompt in frontend/src/components/AgentPanel.tsx
- [ ] T040 [US3] Integrate agent panel with calendar selected day context and backend endpoints in frontend/src/pages/CalendarPage.tsx

**Checkpoint**: All three user stories are independently testable and complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and release-readiness updates spanning multiple stories.

- [ ] T041 [P] Update README and feature docs with local run, API docs, and agent behavior notes in README.md and specs/001-calendar-task-agent/quickstart.md
- [ ] T042 Add CI jobs for backend/frontend lint, tests, Playwright, and line+branch coverage artifacts in .github/workflows/ci-manual.yml
- [ ] T043 [P] Add contract drift guard that fails CI on OpenAPI mismatch with specs/001-calendar-task-agent/contracts/openapi.yaml in backend/tests/contract/test_openapi_contract.py
- [ ] T044 Run and document quickstart validation scenarios including stale conflict and agent unavailable behavior in specs/001-calendar-task-agent/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies.
- Foundational (Phase 2): Depends on Setup.
- User Story phases (Phases 3-5): Depend on Foundational completion.
- Polish (Phase 6): Depends on completion of desired user stories.

### User Story Dependencies

- US1 (P1): Starts after Phase 2; no dependency on other stories.
- US2 (P2): Starts after Phase 2; can run independently but reuses CalendarPage integrations from US1.
- US3 (P3): Starts after Phase 2; depends on task data availability from US1 for meaningful answers.

### Dependency Graph

- Phase 1 -> Phase 2 -> {Phase 3, Phase 4, Phase 5} -> Phase 6
- Preferred delivery order: Phase 3 (MVP) -> Phase 4 -> Phase 5

---

## Parallel Opportunities

- Setup: T003, T004, T005 can run in parallel after T001/T002 starts structure.
- Foundational: T008, T009, T010, T012 can run in parallel once model baseline (T006/T007) is in place.
- US1: T013-T015 can run in parallel; T020 and T021 can run in parallel; backend (T016-T019) and frontend (T020-T023) streams can proceed concurrently.
- US2: T024-T026 parallelize tests; T028 can run in parallel with T027 before integration in T029.
- US3: T031-T033 parallelize tests; T039 can run in parallel with backend service/API implementation T034-T038.

## Parallel Example: User Story 1

```bash
# Parallel backend/frontend test authoring
Task: "T013 [US1] contract tests in backend/tests/contract/test_tasks_crud.py"
Task: "T015 [US1] component tests in frontend/tests/component/taskEditor.spec.tsx"

# Parallel UI components
Task: "T020 [US1] TaskForm in frontend/src/components/TaskForm.tsx"
Task: "T021 [US1] TaskList interactions in frontend/src/components/TaskList.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 (task CRUD) as MVP.
2. Deliver US2 (navigation/day visibility) without regressing US1.
3. Deliver US3 (agent Q&A) with robust unavailable/ambiguity handling.
4. Complete Polish and CI hardening.

### Team Parallelization Strategy

1. Shared team completes Setup + Foundational.
2. Then split by stream:
   - Backend: CRUD + agent services.
   - Frontend: calendar UI + agent panel.
   - QA/quality: contract/integration/component/E2E tests and CI.

---

## Notes

- All tasks use required checklist format: `- [ ] T### [P] [US#] Description with file path`.
- `[US#]` labels are only applied to user story phases.
- Field constraints from data-model.md are preserved in implementation tasks to avoid ambiguity.
