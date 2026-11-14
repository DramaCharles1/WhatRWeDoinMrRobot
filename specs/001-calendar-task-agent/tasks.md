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

- [X] T001 Align backend dependency/tooling configuration with plan requirements in `backend/pyproject.toml`.
- [X] T002 Align frontend dependency/tooling configuration with plan requirements in `frontend/package.json`.
- [X] T003 [P] Configure backend environment defaults for local PostgreSQL and API settings in `backend/backend/settings.py` and `.env.example`.
- [X] T004 [P] Configure frontend API base URL wiring via environment variable in `frontend/src/services/apiClient.ts` and `.env.example`.
- [X] T005 [P] Align local compose services to calendar MVP scope (frontend/backend/postgres only) in `infra/docker-compose.yml`.
- [X] T006 [P] Ensure manual CI workflow contains backend/frontend quality checks for static analysis, tests, and build validation in `.github/workflows/ci-manual.yml`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core calendar data contract, API scaffolding, and shared validation behavior required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

**Out-of-scope removal (plan.md Structure Decision)**

- [X] T007 Unapply the agent migrations on the local database (`python manage.py migrate agent zero` from `backend/`), then delete the `backend/apps/agent/` directory (models, views, services, migrations, apps).
- [X] T008 [P] Delete agent-only assets: `backend/services/ollama_client.py`, `infra/observability/agent-alerts.yml`, `infra/observability/agent-dashboard.json`, and `docs/operations/agent-alert-runbook.md`.
- [X] T009 [P] Delete frontend agent UI and tests: `frontend/src/components/AgentPanel.tsx` and `frontend/tests/component/agentPanel.spec.tsx`, and remove any `AgentPanel` usage from `frontend/src/pages/CalendarPage.tsx`.
- [X] T010 [P] Delete obsolete backend tests superseded by event tests: agent/alert tests `backend/tests/contract/test_agent_endpoints.py`, `backend/tests/integration/test_agent_answer_quality.py`, `backend/tests/integration/test_agent_query_flows.py`, `backend/tests/integration/test_agent_query_unavailable.py`, `backend/tests/integration/test_alert_validation.py`; task-era tests `backend/tests/contract/test_tasks_crud.py`, `backend/tests/integration/test_task_crud_flows.py`, `backend/tests/integration/test_task_day_listing.py`, `backend/tests/integration/test_task_save_latency.py`, `backend/tests/integration/test_task_validation_messages.py`.
- [X] T011 Remove `apps.agent` from `INSTALLED_APPS` in `backend/backend/settings.py` (depends on T007).

**Event schema (FR-026: Task data is discarded, not migrated)**

- [X] T012 Replace the Task model with the Event model in `backend/apps/calendar/models.py` using verbatim data-model rules: `title: string, required, trimmed, non-empty, max length 200`, `event_date: date, required (ISO YYYY-MM-DD)`, `is_all_day: boolean, required, default false`, `start_time/end_time: nullable but required when is_all_day is false`, and `notes: string, optional, max length 2000`. Do NOT add a unique constraint on date/title (FR-014: duplicate titles on the same day are allowed).
- [X] T013 Add new migration `backend/apps/calendar/migrations/0002_replace_task_with_event.py` that deletes the Task model/table and creates the Event model with verbatim rules: `index on event_date` and database check that `all-day has no times; timed has both times with end_time > start_time`. Do not copy task rows into events (FR-026) and do not edit `0001_initial.py`.
- [X] T014 [P] Add integration test asserting FR-026 and FR-014 at the schema level (no `calendar_task` table after migrate, two events with the same title and date can be saved, DB check rejects timed events with `end_time <= start_time`) in `backend/tests/integration/test_event_schema_migration.py`.
- [X] T015 [P] Implement shared Event serializer input validation and canonical error messages (`Title is required.`, `End time must be later than start time.`) in `backend/apps/calendar/serializers.py`, including title trimming, all-day time clearing, `YYYY-MM-DD` dates, and `HH:MM` times (FR-016 through FR-022).
- [X] T016 [P] Implement standardized API error envelope and mapping for validation/not-found cases in `backend/api/v1/errors.py`; remove the `duplicate`, `stale_operation`, `agent_unavailable`, and `clarification_required` codes.
- [X] T017 [P] Align versioned API routing to only `/api/v1/health`, `/api/v1/events`, and `/api/v1/events/{eventId}` in `backend/api/v1/urls.py`; remove `/tasks` and `/agent/*` routes.
- [X] T018 [P] Add baseline backend observability for request logs and clear operation-specific failure messages in `backend/backend/middleware.py`, `backend/services/observability.py`, `backend/services/audit.py` (replace `audit_task_event` with an event audit helper and delete `audit_agent_event`), and `backend/services/metrics_registry.py` (remove agent-specific metrics).
- [X] T019 [P] Define strict frontend Event DTOs matching OpenAPI schemas (remove agent and task DTOs) in `frontend/src/types/api.ts`.
- [X] T020 [P] Implement frontend events service client for GET/POST/PATCH/DELETE `/events` endpoints in `frontend/src/services/tasksService.ts`.
- [X] T021 Rewrite the OpenAPI contract to the Event surface (`/health`, `/events`, `/events/{eventId}`, `Event`, `EventWriteRequest`, `EventUpdateRequest`, `EventListResponse`, `ErrorResponse`; no `/tasks`, no `/agent/*`) in `specs/001-calendar-task-agent/contracts/openapi.yaml`.
- [X] T022 Add OpenAPI contract drift guard for events endpoints and schemas (assert `/events:` and `/events/{eventId}:` present, `/tasks` and `/agent` absent) in `backend/tests/contract/test_openapi_contract.py`.

**Checkpoint**: Foundation ready; user story implementation can proceed.

---

## Phase 3: User Story 1 - View the Calendar (Priority: P1) 🎯 MVP

**Goal**: A user can choose a date and reliably view ordered events or an explicit empty state for that date.

**Independent Test**: Open the calendar, change dates, and confirm only selected-date events appear with all-day events first, timed events next, and empty-state messaging when none exist.

### Tests for User Story 1

- [ ] T023 [P] [US1] Add backend contract tests for `GET /events?date=YYYY-MM-DD` success and invalid-date errors in `backend/tests/contract/test_events_list_contract.py`.
- [ ] T024 [P] [US1] Add backend integration tests for date filtering and ordering rules (all-day first, start_time ascending, creation-order tie-break) in `backend/tests/integration/test_event_day_listing.py`.
- [ ] T025 [P] [US1] Update frontend component tests for day navigation and empty-state rendering in `frontend/tests/component/calendarDayNavigation.spec.tsx`.
- [ ] T026 [P] [US1] Update end-to-end navigation test for cross-date correctness in `frontend/tests/e2e/calendar-navigation.spec.ts`.

### Implementation for User Story 1

- [ ] T027 [US1] Implement day-list endpoint behavior returning `EventListResponse` for selected date (400 for missing/invalid date) in `backend/apps/calendar/views.py`.
- [ ] T028 [P] [US1] Implement backend day-ordering service logic for FR-006a/FR-006b/FR-006c in `backend/apps/calendar/services/task_service.py`.
- [ ] T029 [P] [US1] Implement day selector controls and selected-date state transitions in `frontend/src/components/DayNavigator.tsx`.
- [ ] T030 [P] [US1] Implement selected-day event list rendering (all-day label or start-end times) in `frontend/src/components/TaskList.tsx`.
- [ ] T031 [US1] Implement explicit empty-state component and copy for no-events day in `frontend/src/components/TaskListEmptyState.tsx`.
- [ ] T032 [US1] Integrate day navigation and list fetching (with loading and error states) into page orchestration in `frontend/src/pages/CalendarPage.tsx`.

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Create and Edit Events (Priority: P1)

**Goal**: A user can create and edit timed/all-day events with deterministic validation behavior and persisted updates.

**Independent Test**: Create a timed or all-day event, edit it, verify immediate selected-day refresh, and verify exact validation messages for empty title and invalid end-time ordering.

### Tests for User Story 2

- [ ] T033 [P] [US2] Add backend contract tests for `POST /events` and `PATCH /events/{eventId}` success and validation failures (including 201 for a duplicate title on the same day per FR-014) in `backend/tests/contract/test_events_write_contract.py`.
- [ ] T034 [P] [US2] Add backend integration tests for create/edit validation rules including title trimming, all-day time clearing, and end-after-start enforcement in `backend/tests/integration/test_event_crud_flows.py`.
- [ ] T035 [P] [US2] Add backend integration tests asserting exact canonical messages `Title is required.` and `End time must be later than start time.` in `backend/tests/integration/test_event_validation_messages.py`.
- [ ] T036 [P] [US2] Update frontend component tests for create/edit form behavior and validation message rendering in `frontend/tests/component/taskEditor.spec.tsx`.

### Implementation for User Story 2

- [ ] T037 [US2] Implement create/update service operations enforcing FR-014 and FR-016 through FR-023 (no uniqueness check, no `creator_name`) in `backend/apps/calendar/services/task_service.py`.
- [ ] T038 [US2] Implement create/update handlers for events endpoints (remove IntegrityError/409 duplicate handling) in `backend/apps/calendar/views.py`.
- [ ] T039 [P] [US2] Implement event form fields and all-day/timed input toggling in `frontend/src/components/TaskForm.tsx`.
- [ ] T040 [P] [US2] Implement event edit interaction wiring in `frontend/src/components/TaskList.tsx`.
- [ ] T041 [US2] Integrate create/edit mutations with selected-day refresh behavior in `frontend/src/pages/CalendarPage.tsx`.

**Checkpoint**: User Stories 1 and 2 both function independently and together.

---

## Phase 5: User Story 3 - Remove Events (Priority: P2)

**Goal**: A user can delete events and receive clear operation-specific failure messaging when deletion fails.

**Independent Test**: Delete an event from the selected day and confirm removal from view; when deletion fails, confirm a clear operation-specific error message is returned/displayed.

### Tests for User Story 3

- [ ] T042 [P] [US3] Add backend contract tests for `DELETE /events/{eventId}` 204 and 404 responses in `backend/tests/contract/test_events_delete_contract.py`.
- [ ] T043 [P] [US3] Add backend integration tests for delete success, not-found, and operation-specific failure message behavior in `backend/tests/integration/test_event_delete_flows.py`.
- [ ] T044 [P] [US3] Add frontend component tests for delete interaction and error message display in `frontend/tests/component/taskEditor.spec.tsx`.

### Implementation for User Story 3

- [ ] T045 [US3] Implement delete operation behavior (404 for unknown id) and operation-specific error messaging in `backend/apps/calendar/services/task_service.py`.
- [ ] T046 [US3] Implement delete endpoint handling aligned with OpenAPI responses in `backend/apps/calendar/views.py`.
- [ ] T047 [US3] Integrate delete action with selected-day list update in `frontend/src/pages/CalendarPage.tsx`.

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality hardening, documentation alignment, and release readiness across stories.

- [ ] T048 [P] Normalize event-vs-task terminology and remove agent references in user-facing/backend docs and API notes in `README.md` and `specs/001-calendar-task-agent/quickstart.md`, and document that existing task data is discarded on migrate (FR-026).
- [ ] T049 [P] Add or update backend health-check validation test for `/api/v1/health` in `backend/tests/integration/test_health_endpoint.py`.
- [ ] T050 [P] Add SC-003 timing verification test using measurement protocol (`localhost`, `n>=20`, submit-to-visible timing) in `backend/tests/integration/test_event_save_latency.py`.
- [ ] T051 Add frontend and backend quality-gate execution including lint/static analysis, type-checks, and full build validation (`ruff check .`, `mypy .`, `python manage.py check`, `npm run lint`, `npx tsc --noEmit`, `npm run build`) in `.github/workflows/ci-manual.yml`.
- [ ] T052 [P] Add frontend component accessibility tests for keyboard navigation, visible focus states, and labeled validation messages in `frontend/tests/component/taskAccessibility.spec.tsx`.
- [ ] T053 [P] Add responsive layout tests for core flows at 360px and 1280px viewports in `frontend/tests/component/calendarResponsive.spec.tsx`.
- [ ] T054 Implement accessibility semantics for core controls and form validation messaging in `frontend/src/components/DayNavigator.tsx`, `frontend/src/components/TaskForm.tsx`, and `frontend/src/components/TaskList.tsx`.
- [ ] T055 Implement responsive layout refinements for 360px and 1280px core flows in `frontend/src/pages/CalendarPage.tsx` and `frontend/src/components/TaskList.tsx`.
- [ ] T056 Run the full SC-005 quality gates and document quickstart validation outcomes for all three user stories in `specs/001-calendar-task-agent/quickstart.md`.
- [ ] T057 [P] Add SC-001 timing verification test using measurement protocol (`localhost`, `n>=20`, submit-to-visible timing) for event creation in `backend/tests/integration/test_event_create_latency.py`.
- [ ] T058 [P] Add SC-002 timing verification tests using measurement protocol (`localhost`, `n>=20`, submit-to-visible timing) for event edit and delete flows in `backend/tests/integration/test_event_modify_latency.py`.
- [ ] T059 [P] Add integration test validating FR-012 persistence after backend restart and page refresh in `backend/tests/integration/test_event_persistence_restart.py`.
- [ ] T060 Verify and preserve FR-027 breaking-change approval artifacts (rationale, consumer impact, rollback/mitigation, reviewer sign-off) in `specs/001-calendar-task-agent/spec.md` and `specs/001-calendar-task-agent/plan.md` before implementation merge.

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
- Foundational removal: T008-T010 in parallel after T007; T011 after T007.
- Foundational Event schema: T012 then T013 sequentially; T014-T020 in parallel after T013; T021 then T022.
- US1: T023-T026 in parallel; T028-T031 in parallel before T032 integration.
- US2: T033-T036 in parallel; T039-T040 in parallel before T041 integration.
- US3: T042-T044 in parallel before T045-T047 sequence.
- Polish: T048-T050, T052-T053, and T057-T059 can run in parallel before T051, T054-T056, and T060.

## Parallel Example: User Story 2

```bash
# Parallel test authoring
Task: "T033 [US2] contract tests in backend/tests/contract/test_events_write_contract.py"
Task: "T036 [US2] component tests in frontend/tests/component/taskEditor.spec.tsx"

# Parallel UI implementation
Task: "T039 [US2] event form toggling in frontend/src/components/TaskForm.tsx"
Task: "T040 [US2] edit interaction wiring in frontend/src/components/TaskList.tsx"
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
- Agent-specific features are out of scope; T007-T011 remove the existing agent code, and FR-026 (discard legacy Task data) is implemented by T012-T014.
- Duplicate titles on the same day are allowed (FR-014); the legacy unique (task_date, title) constraint and 409 duplicate handling must not be carried over.
- SC-001 and SC-002 timing outcomes are explicitly covered by T057 and T058; FR-012 restart persistence is explicitly covered by T059; FR-027 governance evidence is explicitly preserved by T060.
