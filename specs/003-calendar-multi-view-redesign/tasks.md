# Tasks: Calendar Multi-View Redesign

**Input**: Design documents from `specs/003-calendar-multi-view-redesign/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Unit/component and end-to-end tests are explicitly requested in the feature specification and are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared scaffolding, test entry points, and documentation anchors for this feature.

- [X] T001 Create feature validation checklist section for this workstream in `specs/003-calendar-multi-view-redesign/quickstart.md`
- [X] T002 Add component test files for view switching and day rendering in `frontend/tests/component/calendarViewSwitching.spec.tsx` and `frontend/tests/component/calendarDayView.spec.tsx`
- [X] T003 [P] Add component test file for event details interactions in `frontend/tests/component/calendarEventDetails.spec.tsx`
- [X] T004 [P] Add/reshape required E2E flow specs in `frontend/tests/e2e/calendar-navigation.spec.ts`
- [X] T005 Add backend resiliency/observability test file scaffold for range reads in `backend/tests/integration/test_event_range_resilience.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared backend/frontend foundations required before any story can be completed.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T006 Implement range query request/response serializers for `/events/range` in `backend/apps/calendar/serializers.py`
- [X] T007 Implement `/events/range` view behavior and validation in `backend/apps/calendar/views.py`
- [X] T008 Wire `/events/range` route in `backend/api/v1/urls.py`
- [X] T009 [P] Implement range-read service helper with documented timeout and bounded retry behavior in `backend/apps/calendar/services/range_queries.py`
- [X] T010 [P] Emit structured logs and clear error messages for range-read success/failure paths in `backend/apps/calendar/views.py`
- [X] T011 [P] Add API schema entries for `/events/range` and error shapes in `specs/003-calendar-multi-view-redesign/contracts/calendar-views-api.yaml`
- [X] T012 [P] Extend API DTO types to include `EventRangeResponse` and `DayEvents` in `frontend/src/types/api.ts`
- [X] T013 [P] Add range list client method and error propagation in `frontend/src/services/tasksService.ts`
- [X] T014 Create calendar boundary helpers (week/month/day ranges) in `frontend/src/services/calendarDateRanges.ts`
- [X] T015 Create day-bucket mapping helper that enforces verbatim constraints "Every event for `date` must be represented in `events` even if compact rendering truncates inline display." and "`overflowCount` must be zero in day view because full-day listing is required." in `frontend/src/services/calendarBuckets.ts`
- [X] T016 Add backend contract coverage for `/events/range` success and invalid-parameter cases in `backend/tests/contract/test_events_list_contract.py`
- [X] T017 Add backend integration coverage for timeout/retry execution paths and logged failure context in `backend/tests/integration/test_event_range_resilience.py`

**Checkpoint**: Shared range-read API, resilience, observability, and frontend data plumbing are ready.

---

## Phase 3: User Story 1 - Navigate Calendar Views (Priority: P1) 🎯 MVP

**Goal**: Deliver current-week default and complete navigation between week, month, and day with correct day-level visibility.

**Independent Test**: Start on calendar page, verify current-week default, switch week->month, switch week->day, and verify selected day lists its events.

### Tests for User Story 1

- [X] T018 [P] [US1] Add component tests for default week mode and mode switch controls in `frontend/tests/component/calendarViewSwitching.spec.tsx`
- [X] T019 [P] [US1] Add component tests for day selection and day-view list behavior in `frontend/tests/component/calendarDayView.spec.tsx`
- [X] T020 [US1] Add Playwright assertions for week->month and week->day transitions in `frontend/tests/e2e/calendar-navigation.spec.ts`

### Implementation for User Story 1

- [X] T021 [P] [US1] Create view mode switcher UI in `frontend/src/components/CalendarViewSwitcher.tsx`
- [X] T022 [P] [US1] Create week grid rendering component in `frontend/src/components/CalendarWeekView.tsx`
- [X] T023 [P] [US1] Create month grid rendering component in `frontend/src/components/CalendarMonthView.tsx`
- [X] T024 [P] [US1] Create day view component with complete selected-day event rendering in `frontend/src/components/CalendarDayView.tsx`
- [X] T025 [US1] Refactor page state to include `viewMode`, `anchorDate`, and `selectedDate` in `frontend/src/pages/CalendarPage.tsx`
- [X] T026 [US1] Integrate day and range fetch orchestration for all view modes in `frontend/src/pages/CalendarPage.tsx`
- [X] T027 [US1] Enforce verbatim `CalendarViewState` constraints "Default `viewMode` is `week` at first load." and "`selectedDate` must always fall within the rendered range for week/month, or equal the rendered day in day view." in `frontend/src/pages/CalendarPage.tsx`
- [X] T028 [US1] Ensure empty selected-day states still provide add-event affordance in `frontend/src/components/CalendarDayView.tsx` and `frontend/src/components/TaskListEmptyState.tsx`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Manage Events From Any View (Priority: P1)

**Goal**: Support create/view/edit/delete event lifecycle from week, month, and day while preserving synchronized state.

**Independent Test**: In week view, create one event, open details, edit and save, delete the same event, then confirm consistency when switching to month/day.

### Tests for User Story 2

- [X] T029 [P] [US2] Add component coverage for event details panel states (view/edit/confirm-delete/closed) in `frontend/tests/component/calendarEventDetails.spec.tsx`
- [X] T030 [US2] Add Playwright flow for create->edit->save->delete in week view in `frontend/tests/e2e/calendar-navigation.spec.ts`
- [X] T031 [P] [US2] Add backend integration coverage that mutations are reflected in both `/events` and `/events/range` reads in `backend/tests/integration/test_event_crud_flows.py`

### Implementation for User Story 2

- [X] T032 [P] [US2] Create event details panel component with edit/delete actions in `frontend/src/components/EventDetailsPanel.tsx`
- [X] T033 [US2] Add event selection and detail mode state transitions in `frontend/src/pages/CalendarPage.tsx`
- [X] T034 [US2] Add add-event entry points in week, month, and day views in `frontend/src/components/CalendarWeekView.tsx`, `frontend/src/components/CalendarMonthView.tsx`, and `frontend/src/components/CalendarDayView.tsx`
- [X] T035 [US2] Adapt form flows for create/edit from all views in `frontend/src/components/TaskForm.tsx`
- [X] T036 [US2] Enforce verbatim `CalendarEvent` constraints "Title must be non-empty.", "For timed events, both times are required and end must be later than start.", and "Create/update/delete outcomes must be reflected across all views that include `eventDate`." in `frontend/src/components/TaskForm.tsx` and `frontend/src/pages/CalendarPage.tsx`
- [X] T037 [US2] Refresh impacted day/range buckets after create/update/delete without page reload in `frontend/src/pages/CalendarPage.tsx`

**Checkpoint**: User Story 2 is independently functional and testable with full lifecycle coverage.

---

## Phase 5: User Story 3 - Experience Themed Visual Design (Priority: P2)

**Goal**: Apply a cohesive playful visual language across views while keeping mobile/desktop readability and usability.

**Independent Test**: Validate week/month/day on desktop and mobile breakpoints, including typography, theme colors, and readable interactive states.

### Tests for User Story 3

- [X] T038 [P] [US3] Add responsive and themed rendering checks across view modes in `frontend/tests/component/calendarResponsive.spec.tsx`
- [X] T039 [US3] Add accessibility checks for themed controls and focus states in `frontend/tests/component/taskAccessibility.spec.tsx`

### Implementation for User Story 3

- [X] T040 [P] [US3] Define calendar theme tokens (palette, typography, motif accents) in `frontend/src/pages/CalendarPage.css`
- [X] T041 [US3] Apply themed layout and typography to page-level containers in `frontend/src/pages/CalendarPage.tsx` and `frontend/src/pages/CalendarPage.css`
- [X] T042 [US3] Apply themed motif accents in week/month/day surfaces in `frontend/src/components/CalendarWeekView.tsx`, `frontend/src/components/CalendarMonthView.tsx`, and `frontend/src/components/CalendarDayView.tsx`
- [X] T043 [US3] Ensure mobile and desktop readability/focus behavior for interactive controls in `frontend/src/pages/CalendarPage.css`

**Checkpoint**: User Story 3 is independently testable and meets visual direction expectations.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, compliance evidence, and full validation.

- [ ] T044 [P] Update journey contract with implemented controls and expected outcomes in `specs/003-calendar-multi-view-redesign/contracts/calendar-view-journeys.md`
- [ ] T045 [P] Update quickstart with final backend/frontend test commands and expected outputs in `specs/003-calendar-multi-view-redesign/quickstart.md`
- [ ] T046 Add stakeholder visual signoff checklist and approval record for SC-006 in `specs/003-calendar-multi-view-redesign/checklists/visual-signoff.md`
- [ ] T047 Run and document backend contract/integration validation for range observability + timeout/retry in `specs/003-calendar-multi-view-redesign/tasks.md`
- [ ] T048 Run and document frontend component/unit validation in `specs/003-calendar-multi-view-redesign/tasks.md`
- [ ] T049 Run and document required Playwright E2E flows in `specs/003-calendar-multi-view-redesign/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies, start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and uses US1 rendering foundations.
- **Phase 5 (US3)**: Depends on stable US1/US2 UI surfaces.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: MVP story after foundational phase.
- **US2 (P1)**: Starts after foundational phase and integrates with US1 view components.
- **US3 (P2)**: Starts once major US1/US2 interaction surfaces are stable.

### Within Each User Story

- Tests first (and verify failing baseline where applicable).
- Build components/services.
- Integrate orchestration logic.
- Re-run story-specific tests before moving on.

### Parallel Opportunities

- Setup: `T003`, `T004` can run in parallel after `T001`.
- Foundational: `T009`, `T010`, `T011`, `T012`, `T013` can run in parallel after `T006`-`T008` scaffold.
- US1: `T021`-`T024` parallel before integration tasks `T025`-`T028`.
- US2: `T029`, `T031`, `T032` parallel before integration tasks `T033`-`T037`.
- US3: `T038`, `T040` parallel before `T041`-`T043` integration.
- Polish: `T044`, `T045`, `T046` parallel before execution evidence tasks `T047`-`T049`.

---

## Parallel Example: User Story 1

```bash
# Parallel component build
T021 -> frontend/src/components/CalendarViewSwitcher.tsx
T022 -> frontend/src/components/CalendarWeekView.tsx
T023 -> frontend/src/components/CalendarMonthView.tsx
T024 -> frontend/src/components/CalendarDayView.tsx

# Then orchestrate and enforce constraints
T025 -> frontend/src/pages/CalendarPage.tsx
T026 -> frontend/src/pages/CalendarPage.tsx
T027 -> frontend/src/pages/CalendarPage.tsx
```

## Parallel Example: User Story 2

```bash
# Parallel test and component setup
T029 -> frontend/tests/component/calendarEventDetails.spec.tsx
T031 -> backend/tests/integration/test_event_crud_flows.py
T032 -> frontend/src/components/EventDetailsPanel.tsx

# Then integrate lifecycle behavior
T033 -> frontend/src/pages/CalendarPage.tsx
T036 -> frontend/src/components/TaskForm.tsx
T037 -> frontend/src/pages/CalendarPage.tsx
```

## Parallel Example: User Story 3

```bash
# Parallel theming setup
T038 -> frontend/tests/component/calendarResponsive.spec.tsx
T040 -> frontend/src/pages/CalendarPage.css

# Then apply and verify final themed UI behavior
T041 -> frontend/src/pages/CalendarPage.tsx
T042 -> frontend/src/components/CalendarWeekView.tsx
T043 -> frontend/src/pages/CalendarPage.css
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate default week, week->month, and week->day behavior independently.
4. Demo MVP before adding lifecycle/theming expansion.

### Incremental Delivery

1. Setup + Foundational complete.
2. Deliver US1 and validate.
3. Deliver US2 and validate.
4. Deliver US3 and validate.
5. Complete polish and final validation evidence tasks.

### Parallel Team Strategy

1. Team completes Phase 1 and Phase 2 together.
2. After foundational completion:
   - Developer A: US1 navigation architecture
   - Developer B: US2 event lifecycle and consistency
   - Developer C: US3 themed UI and accessibility
3. Rejoin for Phase 6 validation and documentation.

---

## Notes

- `[P]` tasks are file-separated and dependency-safe for concurrent work.
- `[USx]` labels trace story scope for implementation and testing.
- All tasks include concrete file paths and are directly executable.
- FR-015/FR-016 and SC-007/SC-008 are explicitly covered by foundational and validation tasks (`T009`, `T010`, `T017`, `T047`).
