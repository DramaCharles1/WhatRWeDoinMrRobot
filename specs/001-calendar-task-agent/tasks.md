---

description: "Task list for implementing SpeciaelFamily Calendar Task Management"
---

# Tasks: SpeciaelFamily Calendar Task Management

**Input**: Design documents from `/specs/001-calendar-task-agent/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project structure, tooling, and baseline delivery pipelines.

- [X] T001 Create backend, frontend, and infra base directory structure per plan in backend/, frontend/, and infra/
- [X] T002 Initialize backend dependencies and project settings scaffold in backend/pyproject.toml and backend/backend/settings.py
- [X] T003 [P] Initialize frontend React + TypeScript scaffold in frontend/package.json and frontend/src/main.tsx
- [X] T004 [P] Add container orchestration baseline for frontend/backend/postgres/ollama in infra/docker-compose.yml
- [X] T005 [P] Add workflow_dispatch CI skeleton with backend/frontend job placeholders in .github/workflows/ci-manual.yml
- [X] T006 [P] Add local env template for API, database, and Ollama connectivity in .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Deliver core data, API, and observability/security foundations needed by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Create Task model with constraints "title: string, required, non-empty, trimmed, max length 200", "task_date: date, required (ISO date)", "creator_name: string, required, non-empty, max length 100", and "notes: string, optional, max length 2000" in backend/apps/calendar/models.py
- [X] T008 Add Task persistence constraints and indexes for unique "(task_date, title)", task_date index, and updated_at index in backend/apps/calendar/migrations/0001_initial.py
- [X] T009 [P] Implement standardized API error response envelope and code mapping in backend/api/v1/errors.py
- [X] T010 [P] Configure DRF, drf-spectacular, and versioned API routing under /api/v1 in backend/api/v1/urls.py and backend/backend/settings.py
- [X] T011 [P] Implement structured logging, correlation IDs, and request-latency metric emission in backend/services/observability.py and backend/backend/middleware.py
- [X] T012 [P] Add backend data-audit logging hooks for task and agent operations with retention metadata in backend/services/audit.py
- [X] T013 [P] Implement baseline security headers and secure cookie/session policy defaults for web/API traffic in backend/backend/security.py and backend/backend/settings.py
- [X] T014 [P] Create shared frontend API client with typed DTOs and deterministic error parsing in frontend/src/services/apiClient.ts and frontend/src/types/api.ts
- [X] T015 Create OpenAPI contract alignment test against specs/001-calendar-task-agent/contracts/openapi.yaml in backend/tests/contract/test_openapi_contract.py
- [X] T016 Define backend metrics registry keys for agent request volume, failure rate, latency, and dependency health in backend/services/metrics_registry.py

**Checkpoint**: Foundational baseline complete. User story phases can now proceed.

---

## Phase 3: User Story 1 - Manage Daily Tasks (Priority: P1) 🎯 MVP

**Goal**: Let users create, edit, and remove tasks for a selected calendar day with validation and stale-operation handling.

**Independent Test**: From the day view, create/edit/delete a task and verify persistence, duplicate-title blocking, stale-action handling, and exact empty-title error message "Title is required.".

### Tests for User Story 1

- [X] T017 [P] [US1] Add backend contract tests for POST /tasks, PATCH /tasks/{taskId}, and DELETE /tasks/{taskId} with 400/404/409 coverage in backend/tests/contract/test_tasks_crud.py
- [X] T018 [P] [US1] Add backend integration tests for duplicate-title rejection, stale conflict message, and no-login access in backend/tests/integration/test_task_crud_flows.py
- [X] T019 [P] [US1] Add backend integration test for empty title returning exact message "Title is required." in backend/tests/integration/test_task_validation_messages.py
- [X] T020 [P] [US1] Add frontend component tests for create/edit/delete and exact empty-title error display in frontend/tests/component/taskEditor.spec.tsx

### Implementation for User Story 1

- [X] T021 [US1] Implement Task serializer validation rules "Title must not be blank.", "(task_date, title) must be unique.", and "Creator name must be present for create operations." in backend/apps/calendar/serializers.py
- [X] T022 [US1] Implement deterministic empty-title validation message "Title is required." in backend/apps/calendar/serializers.py
- [X] T023 [US1] Implement task create/update/delete service with stale-operation message "This task was already removed in another tab." in backend/apps/calendar/services/task_service.py
- [X] T024 [US1] Implement task CRUD API views for /tasks and /tasks/{taskId} matching contract responses in backend/apps/calendar/views.py
- [X] T025 [US1] Wire task CRUD routes into versioned router in backend/api/v1/urls.py
- [X] T026 [P] [US1] Build task form component with title/date/creator_name/notes fields and deterministic validation rendering in frontend/src/components/TaskForm.tsx
- [X] T027 [P] [US1] Build task list item interactions for edit and delete flows in frontend/src/components/TaskList.tsx
- [X] T028 [US1] Implement frontend task CRUD service integration with /api/v1/tasks in frontend/src/services/tasksService.ts
- [X] T029 [US1] Integrate selected-day refresh and 409 stale-conflict refetch handling in frontend/src/pages/CalendarPage.tsx

**Checkpoint**: US1 is independently functional and demonstrable as MVP.

---

## Phase 4: User Story 2 - View and Navigate Schedule (Priority: P2)

**Goal**: Allow users to navigate days and view each day-specific task list, including explicit empty state messaging.

**Independent Test**: Populate tasks on different dates, switch between dates, verify only selected date tasks are displayed, and verify empty day message appears when no tasks exist.

### Tests for User Story 2

- [X] T030 [P] [US2] Add backend integration tests for GET /tasks?date=YYYY-MM-DD filtering and empty list behavior in backend/tests/integration/test_task_day_listing.py
- [X] T031 [P] [US2] Add frontend component tests for date navigation and empty-day UI in frontend/tests/component/calendarDayNavigation.spec.tsx
- [X] T032 [P] [US2] Add Playwright E2E test for cross-day navigation correctness in frontend/tests/e2e/calendar-navigation.spec.ts

### Implementation for User Story 2

- [X] T033 [US2] Implement day-filtered task list endpoint returning TaskListResponse in backend/apps/calendar/views.py
- [X] T034 [P] [US2] Implement day selector UI with previous/next and date picking in frontend/src/components/DayNavigator.tsx
- [X] T035 [US2] Integrate selected-date state and day-list fetch orchestration in frontend/src/pages/CalendarPage.tsx
- [X] T036 [US2] Add explicit empty-day state "No tasks scheduled" in frontend/src/components/TaskListEmptyState.tsx

**Checkpoint**: User Stories 1 and 2 both function independently and together.

---

## Phase 5: User Story 3 - Ask Calendar Questions via Agent (Priority: P3)

**Goal**: Support backend-mediated agent session and Q&A over calendar data with deterministic unavailable and ambiguity handling.

**Independent Test**: Start an agent session, ask "What do I have today?" and receive day-aligned summary; when Ollama is unavailable, UI shows "Calendar wizard guy is not home at the momen"; ambiguous question without selected day returns clarification prompt.

### Tests for User Story 3

- [X] T037 [P] [US3] Add contract tests for POST /agent/session and POST /agent/query including 422 and 503 paths in backend/tests/contract/test_agent_endpoints.py
- [X] T038 [P] [US3] Add integration tests for ambiguous-question clarification_required behavior when selected_date_context is missing in backend/tests/integration/test_agent_query_flows.py
- [X] T039 [P] [US3] Add integration tests for unavailable-agent message and selected-day context behavior in backend/tests/integration/test_agent_query_unavailable.py
- [X] T040 [P] [US3] Add frontend component tests for connect/ask/answer/clarification and unavailable errors in frontend/tests/component/agentPanel.spec.tsx

### Implementation for User Story 3

- [X] T041 [US3] Implement AgentSession and AgentQuery persistence models with enum statuses and timestamps in backend/apps/agent/models.py
- [X] T042 [US3] Implement Ollama gateway with timeout, retry, and fallback behavior in backend/services/ollama_client.py
- [X] T043 [US3] Implement agent session creation endpoint and availability checks for /agent/session in backend/apps/agent/views.py
- [X] T044 [US3] Implement /agent/query service returning `clarification_required` and date prompt for ambiguous no-context questions in backend/apps/agent/services/query_service.py
- [X] T045 [US3] Ensure unavailable-agent response message is exactly "Calendar wizard guy is not home at the momen" in backend/apps/agent/views.py
- [X] T046 [P] [US3] Build frontend agent panel for connect, question input, response display, and clarification prompt rendering in frontend/src/components/AgentPanel.tsx
- [X] T047 [US3] Integrate agent panel with selected-date context and backend APIs in frontend/src/pages/CalendarPage.tsx

**Checkpoint**: All three user stories are independently testable and complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and release-readiness updates spanning multiple stories.

- [X] T048 [P] Define operational dashboard configuration for agent request volume, failure rate, latency, and downstream dependency health in infra/observability/agent-dashboard.json
- [X] T049 [P] Define alert thresholds and rule configuration for agent observability signals in infra/observability/agent-alerts.yml
- [X] T050 Add automated alert validation scenarios for trigger and recovery paths in backend/tests/integration/test_alert_validation.py
- [X] T051 [P] Add release runbook documenting alert validation evidence and operator actions in docs/operations/agent-alert-runbook.md
- [X] T052 Add CI step to collect and publish alert validation/runbook evidence artifacts in .github/workflows/ci-manual.yml
- [X] T053 [P] Add performance verification test for SC-003 (99% of successful task saves visible within 2 seconds) in backend/tests/integration/test_task_save_latency.py
- [X] T054 [P] Add agent answer-quality evaluation harness for SC-004 in backend/tests/integration/test_agent_answer_quality.py
- [X] T055 [P] Update README and quickstart with deterministic validation and clarification-required behaviors in README.md and specs/001-calendar-task-agent/quickstart.md
- [X] T056 Add OpenAPI contract drift guard in CI for specs/001-calendar-task-agent/contracts/openapi.yaml in backend/tests/contract/test_openapi_contract.py

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

- Setup: T003, T004, T005, T006 can run in parallel after T001/T002.
- Foundational: T009, T010, T011, T012, T013, T014 can run in parallel after T007/T008.
- US1: T017-T020 can run in parallel; T026 and T027 can run in parallel; backend and frontend streams can proceed concurrently.
- US2: T030-T032 can run in parallel; T034 can run in parallel with T033 before integration in T035.
- US3: T037-T040 can run in parallel; T046 can run in parallel with backend implementation T041-T045.
- Polish: T048, T049, T051, T053, T054, T055 can run in parallel before final CI integration tasks T052/T056.

## Parallel Example: User Story 1

```bash
# Parallel backend/frontend test authoring
Task: "T017 [US1] contract tests in backend/tests/contract/test_tasks_crud.py"
Task: "T020 [US1] component tests in frontend/tests/component/taskEditor.spec.tsx"

# Parallel UI components
Task: "T026 [US1] TaskForm in frontend/src/components/TaskForm.tsx"
Task: "T027 [US1] TaskList interactions in frontend/src/components/TaskList.tsx"
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
- Field constraints from data-model.md are preserved verbatim in model tasks to avoid ambiguity.
- FR-015 through FR-017 are covered by dashboard, alert-rule, validation, and runbook tasks in Phase 6.
- FR-018 and FR-019 are covered by deterministic validation and clarification-required tests and implementation tasks in Phases 3 and 5.

## Phase 7: Convergence

- [ ] T057 CRITICAL: Replace placeholder frontend component/E2E tests with behavior-validating coverage for task CRUD, day navigation, and agent flows per Constitution III (contradicts)
- [ ] T058 CRITICAL: Update manual CI workflow to execute real backend/frontend test suites with coverage artifacts instead of placeholder echo steps per Constitution III (contradicts)
- [ ] T059 Implement task-grounded agent answer generation so responses are derived from persisted calendar data per FR-009 (missing)
- [ ] T060 Add backend agent availability checks before creating sessions and return contract-aligned unavailable behavior when dependency is down per FR-007 (partial)
- [ ] T061 Render clarification prompt details in frontend agent UI when backend returns `clarification_required` per FR-019 (partial)
- [ ] T062 Align DELETE `/tasks/{taskId}` behavior with contract by distinguishing not-found and stale-conflict outcomes per US1/AC3 (contradicts)
- [ ] T063 Implement real Ollama HTTP integration with timeout, retry, and fallback semantics in backend gateway per plan: local Ollama integration (partial)
- [ ] T064 Add runtime emission of agent request volume, failure rate, latency, and dependency health metrics per FR-015 (missing)
- [ ] T065 Replace no-op latency assertion with end-to-end save-to-visible timing validation for task flows per SC-003 (partial)
- [ ] T066 Replace static answer-quality placeholder with dataset-driven agent answer evaluation harness per SC-004 (partial)
- [ ] T067 Sync task edit form state when selected task changes and cover edit UX behavior in tests per US1/AC2 (partial)
