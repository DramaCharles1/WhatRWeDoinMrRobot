---
description: "Task list for implementing Simple Home Calendar MVP"
---

# Tasks: Simple Home Calendar MVP

**Input**: Design documents from `/specs/001-calendar-task-agent/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include automated tests because the specification has mandatory user-scenario testing and the constitution requires regression-safe automated coverage for state-changing flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling.

- [ ] T001 Align backend dependency/tooling configuration with plan requirements in `backend/pyproject.toml`.
- [ ] T002 Align frontend dependency/tooling configuration with plan requirements in `frontend/package.json`.
- [ ] T003 [P] Configure backend environment defaults for local PostgreSQL and API settings in `backend/backend/settings.py` and `.env.example`.
- [ ] T004 [P] Configure frontend API base URL wiring via environment variable in `frontend/src/services/apiClient.ts` and `.env.example`.
- [ ] T005 [P] Align local compose services to calendar MVP scope (frontend/backend/postgres only) in `infra/docker-compose.yml`.
- [ ] T006 [P] Ensure manual CI workflow contains backend/frontend test and quality-check placeholders in `.github/workflows/ci-manual.yml`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core calendar data contract, API scaffolding, and shared validation behavior required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Implement/align Event model constraints in `backend/apps/calendar/models.py` with verbatim data-model rules: `title: string, required, trimmed, non-empty, max length 200`, `event_date: date, required (ISO YYYY-MM-DD)`, `is_all_day: boolean, required, default false`, `start_time/end_time: nullable but required when is_all_day is false`, and `notes: string, optional, max length 2000`.
- [ ] T008 Create/update migration constraints and indexes in `backend/apps/calendar/migrations/0001_initial.py` with verbatim rules: `index on event_date` and database check that `all-day has no times; timed has both times with end_time > start_time`.
- [ ] T009 [P] Implement shared Event serializer input validation and canonical error messages (`Title is required.`, `End time must be later than start time.`) in `backend/apps/calendar/serializers.py`.
- [ ] T010 [P] Implement standardized API error envelope and mapping for validation/not-found cases in `backend/api/v1/errors.py`.
- [ ] T011 [P] Align versioned API routing for `/api/v1/health`, `/api/v1/events`, and `/api/v1/events/{eventId}` in `backend/api/v1/urls.py`.
- [ ] T012 [P] Add baseline backend observability for request logs and clear operation-specific failure messages in `backend/backend/middleware.py` and `backend/services/observability.py`.
- [ ] T013 [P] Define strict frontend Event DTOs matching OpenAPI schemas in `frontend/src/types/api.ts`.
- [ ] T014 [P] Implement frontend events service client for GET/POST/PATCH/DELETE endpoints in `frontend/src/services/tasksService.ts`.
- [ ] T015 Add OpenAPI contract drift guard for events endpoints and schemas in `backend/tests/contract/test_openapi_contract.py`.

**Checkpoint**: Foundation ready; user story implementation can proceed.

---

## Phase 3: User Story 1 - View the Calendar (Priority: P1) 🎯 MVP

**Goal**: A user can choose a date and reliably view ordered events or an explicit empty state for that date.

**Independent Test**: Open the calendar, change dates, and confirm only selected-date events appear with all-day events first, timed events next, and empty-state messaging when none exist.

### Tests for User Story 1

- [ ] T016 [P] [US1] Add backend contract tests for `GET /events?date=YYYY-MM-DD` success and invalid-date errors in `backend/tests/contract/test_events_list_contract.py`.
- [ ] T017 [P] [US1] Add backend integration tests for date filtering and ordering rules (all-day first, start_time ascending, creation-order tie-break) in `backend/tests/integration/test_event_day_listing.py`.
- [ ] T018 [P] [US1] Add frontend component tests for day navigation and empty-state rendering in `frontend/tests/component/calendarDayNavigation.spec.tsx`.
- [ ] T019 [P] [US1] Add end-to-end navigation test for cross-date correctness in `frontend/tests/e2e/calendar-navigation.spec.ts`.

### Implementation for User Story 1

- [ ] T020 [US1] Implement day-list endpoint behavior returning `EventListResponse` for selected date in `backend/apps/calendar/views.py`.
- [ ] T021 [P] [US1] Implement backend day-ordering service logic for FR-006a/FR-006b/FR-006c in `backend/apps/calendar/services/task_service.py`.
- [ ] T022 [P] [US1] Implement day selector controls and selected-date state transitions in `frontend/src/components/DayNavigator.tsx`.
- [ ] T023 [P] [US1] Implement selected-day event list rendering in `frontend/src/components/TaskList.tsx`.
- [ ] T024 [US1] Implement explicit empty-state component and copy for no-events day in `frontend/src/components/TaskListEmptyState.tsx`.
- [ ] T025 [US1] Integrate day navigation and list fetching into page orchestration in `frontend/src/pages/CalendarPage.tsx`.

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Create and Edit Events (Priority: P1)

**Goal**: A user can create and edit timed/all-day events with deterministic validation behavior and persisted updates.

**Independent Test**: Create a timed or all-day event, edit it, verify immediate selected-day refresh, and verify exact validation messages for empty title and invalid end-time ordering.

### Tests for User Story 2

- [ ] T026 [P] [US2] Add backend contract tests for `POST /events` and `PATCH /events/{eventId}` success and validation failures in `backend/tests/contract/test_events_write_contract.py`.
- [ ] T027 [P] [US2] Add backend integration tests for create/edit validation rules including title trimming, all-day time clearing, and end-after-start enforcement in `backend/tests/integration/test_event_crud_flows.py`.
- [ ] T028 [P] [US2] Add backend integration tests asserting exact canonical messages `Title is required.` and `End time must be later than start time.` in `backend/tests/integration/test_event_validation_messages.py`.
- [ ] T029 [P] [US2] Add frontend component tests for create/edit form behavior and validation message rendering in `frontend/tests/component/taskEditor.spec.tsx`.

### Implementation for User Story 2

- [ ] T030 [US2] Implement create/update service operations enforcing FR-016 through FR-023 in `backend/apps/calendar/services/task_service.py`.
- [ ] T031 [US2] Implement create/update handlers for events endpoints in `backend/apps/calendar/views.py`.
- [ ] T032 [P] [US2] Implement event form fields and all-day/timed input toggling in `frontend/src/components/TaskForm.tsx`.
- [ ] T033 [P] [US2] Implement event edit interaction wiring in `frontend/src/components/TaskList.tsx`.
- [ ] T034 [US2] Integrate create/edit mutations with selected-day refresh behavior in `frontend/src/pages/CalendarPage.tsx`.

**Checkpoint**: User Stories 1 and 2 both function independently and together.

---

## Phase 5: User Story 3 - Remove Events (Priority: P2)

**Goal**: A user can delete events and receive clear operation-specific failure messaging when deletion fails.

**Independent Test**: Delete an event from the selected day and confirm removal from view; when deletion fails, confirm a clear operation-specific error message is returned/displayed.

### Tests for User Story 3

- [ ] T035 [P] [US3] Add backend contract tests for `DELETE /events/{eventId}` 204 and 404 responses in `backend/tests/contract/test_events_delete_contract.py`.
- [ ] T036 [P] [US3] Add backend integration tests for delete success, not-found, and operation-specific failure message behavior in `backend/tests/integration/test_event_delete_flows.py`.
- [ ] T037 [P] [US3] Add frontend component tests for delete interaction and error message display in `frontend/tests/component/taskEditor.spec.tsx`.

### Implementation for User Story 3

- [ ] T038 [US3] Implement delete operation behavior and operation-specific error messaging in `backend/apps/calendar/services/task_service.py`.
- [ ] T039 [US3] Implement delete endpoint handling aligned with OpenAPI responses in `backend/apps/calendar/views.py`.
- [ ] T040 [US3] Integrate delete action with selected-day list update in `frontend/src/pages/CalendarPage.tsx`.

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality hardening, documentation alignment, and release readiness across stories.

- [ ] T041 [P] Normalize event-vs-task terminology in user-facing/backend docs and API notes in `README.md` and `specs/001-calendar-task-agent/quickstart.md`.
- [ ] T042 [P] Add or update backend health-check validation test for `/api/v1/health` in `backend/tests/integration/test_health_endpoint.py`.
- [ ] T043 [P] Add SC-003 timing verification test using measurement protocol (`localhost`, `n>=20`, submit-to-visible timing) in `backend/tests/integration/test_event_save_latency.py`.
- [ ] T044 Add frontend and backend quality-check task execution in manual CI workflow in `.github/workflows/ci-manual.yml`.
- [ ] T045 Run and document quickstart validation outcomes for all three user stories in `specs/001-calendar-task-agent/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1 View)**: Can begin after Phase 2.
- **US2 (P1 Create/Edit)**: Can begin after Phase 2; uses shared list/day structures from US1 but remains independently testable.
- **US3 (P2 Delete)**: Can begin after Phase 2; depends on existence of events created by US2 for meaningful independent validation.

### Dependency Graph

- Phase 1 -> Phase 2 -> {Phase 3, Phase 4, Phase 5} -> Phase 6
- Preferred delivery order: Phase 3 (US1) -> Phase 4 (US2) -> Phase 5 (US3)

---

## Parallel Opportunities

- Setup: T003-T006 in parallel after T001-T002.
- Foundational: T009-T014 in parallel after T007-T008.
- US1: T016-T019 in parallel; T021-T024 in parallel before T025 integration.
- US2: T026-T029 in parallel; T032-T033 in parallel before T034 integration.
- US3: T035-T037 in parallel before T038-T040 sequence.
- Polish: T041-T043 can run in parallel before workflow/documentation finalization tasks.

## Parallel Example: User Story 2

```bash
# Parallel test authoring
Task: "T026 [US2] contract tests in backend/tests/contract/test_events_write_contract.py"
Task: "T029 [US2] component tests in frontend/tests/component/taskEditor.spec.tsx"

# Parallel UI implementation
Task: "T032 [US2] event form toggling in frontend/src/components/TaskForm.tsx"
Task: "T033 [US2] edit interaction wiring in frontend/src/components/TaskList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 (view and navigate day schedule).
2. Deliver US2 (create/edit) without regressing US1.
3. Deliver US3 (delete) without regressing US1/US2.
4. Complete Phase 6 polish and workflow hardening.

### Parallel Team Strategy

1. Team completes Setup + Foundational.
2. Then split by stream:
   - Backend stream: service and endpoint implementation tasks.
   - Frontend stream: UI components and page orchestration tasks.
   - QA stream: contract/integration/component/E2E tasks.

---

## Notes

- All tasks use required checklist format: `- [ ] T### [P] [US#] Description with file path`.
- `[US#]` labels are used only for user story phase tasks.
- Data-model field constraints are quoted verbatim in foundational model tasks.
- Agent-specific work is intentionally excluded to align with current spec/plan/constitution scope.
