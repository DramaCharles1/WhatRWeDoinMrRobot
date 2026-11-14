# Tasks: Calendar Event E2E Coverage

**Input**: Design documents from `specs/002-calendar-event-e2e-tests/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: End-to-end tests are explicitly requested in the feature specification and are included for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install and wire Playwright into the existing frontend workspace.

- [ ] T001 Add Playwright test dependency and E2E scripts in `frontend/package.json`
- [ ] T002 Create Playwright configuration for local frontend/backend URLs in `frontend/playwright.config.ts`
- [ ] T003 [P] Add `.gitignore` entries for Playwright artifacts (`test-results`, `playwright-report`) in `frontend/.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build reusable test utilities and deterministic data handling required by all user stories.

**⚠️ CRITICAL**: No user story implementation should begin until this phase is complete.

- [ ] T004 Create browser fixture and base navigation helper in `frontend/tests/e2e/support/fixtures.ts`
- [ ] T005 [P] Create event form interaction helpers in `frontend/tests/e2e/support/eventForm.ts`
- [ ] T006 [P] Create day-list assertion helpers in `frontend/tests/e2e/support/dayListAssertions.ts` with explicit checks quoting constraints: "A created event must appear in the listing for its date." and "A deleted event must not appear in subsequent listing reads."
- [ ] T007 Create backend cleanup helper in `frontend/tests/e2e/support/eventCleanup.ts` that enforces data-model validation rules verbatim: "`title` must be non-empty.", "For timed events, both `startTime` and `endTime` are required.", and "For all-day events, time fields are not required."
- [ ] T008 Create deterministic test-data generator for titles/dates/times in `frontend/tests/e2e/support/testData.ts`
- [ ] T009 Add common stage-aware error wrapper for create/retrieve/delete diagnostics in `frontend/tests/e2e/support/stageReporting.ts`

**Checkpoint**: Shared Playwright infrastructure and deterministic cleanup are ready.

---

## Phase 3: User Story 1 - Create All-Day Event Journey (Priority: P1)  🎯 MVP

**Goal**: Validate that an all-day event can be created through the UI and persists in day listings.

**Independent Test**: Run only the US1 spec and verify all-day creation succeeds and remains visible after list refresh.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add all-day event creation E2E scenario in `frontend/tests/e2e/event-create-all-day.spec.ts`
- [ ] T011 [US1] Add all-day persistence-after-refresh scenario in `frontend/tests/e2e/event-create-all-day.spec.ts`

### Implementation for User Story 1

- [ ] T012 [P] [US1] Extend page interaction helper for all-day toggle and save flow in `frontend/tests/e2e/support/eventForm.ts`
- [ ] T013 [P] [US1] Extend assertion helper for all-day row verification in `frontend/tests/e2e/support/dayListAssertions.ts`
- [ ] T014 [US1] Wire stage-level failure reporting (`create` and `retrieve/list`) for US1 scenarios in `frontend/tests/e2e/event-create-all-day.spec.ts`
- [ ] T015 [US1] Add per-test cleanup hook for all-day events using shared cleanup helper in `frontend/tests/e2e/event-create-all-day.spec.ts`

**Checkpoint**: User Story 1 is independently testable and satisfies MVP scope.

---

## Phase 4: User Story 2 - Create Timed Event Journey (Priority: P2)

**Goal**: Validate that timed events can be created and displayed with the expected time range.

**Independent Test**: Run only the US2 spec and verify timed event creation and refreshed listing preserve title and times.

### Tests for User Story 2

- [ ] T016 [P] [US2] Add timed event creation E2E scenario in `frontend/tests/e2e/event-create-timed.spec.ts`
- [ ] T017 [US2] Add timed event persistence-after-refresh scenario in `frontend/tests/e2e/event-create-timed.spec.ts`

### Implementation for User Story 2

- [ ] T018 [P] [US2] Extend form helper with timed start/end entry paths in `frontend/tests/e2e/support/eventForm.ts`
- [ ] T019 [P] [US2] Extend listing assertions for exact time-range display in `frontend/tests/e2e/support/dayListAssertions.ts`
- [ ] T020 [US2] Enforce timed-event constraint in test flow with explicit check for "For timed events, both `startTime` and `endTime` are required." in `frontend/tests/e2e/event-create-timed.spec.ts`
- [ ] T021 [US2] Wire stage-level failure reporting (`create` and `retrieve/list`) and cleanup hooks for US2 in `frontend/tests/e2e/event-create-timed.spec.ts`

**Checkpoint**: User Story 2 is independently testable without dependence on US1 execution.

---

## Phase 5: User Story 3 - Delete Event Journey (Priority: P3)

**Goal**: Validate that deleting an event removes it from current and refreshed day listings.

**Independent Test**: Run only the US3 spec and verify event deletion succeeds and deleted event is absent after refresh.

### Tests for User Story 3

- [ ] T022 [P] [US3] Add delete-existing-event E2E scenario in `frontend/tests/e2e/event-delete.spec.ts`
- [ ] T023 [US3] Add delete-persistence-after-refresh E2E scenario in `frontend/tests/e2e/event-delete.spec.ts`

### Implementation for User Story 3

- [ ] T024 [P] [US3] Extend page helper for event row delete action and confirmation handling in `frontend/tests/e2e/support/dayListAssertions.ts`
- [ ] T025 [US3] Add scenario-local setup that creates a disposable event before delete in `frontend/tests/e2e/event-delete.spec.ts`
- [ ] T026 [US3] Wire stage-level failure reporting (`delete` and `retrieve/list`) plus final cleanup guard in `frontend/tests/e2e/event-delete.spec.ts`

**Checkpoint**: User Story 3 is independently testable and verifies delete behavior end to end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation and ensure repeatable execution in local workflows.

- [ ] T027 [P] Update frontend test command documentation for Playwright in `README.md`
- [ ] T028 [P] Align quickstart run commands and troubleshooting with final scripts in `specs/002-calendar-event-e2e-tests/quickstart.md`
- [ ] T029 Run complete E2E validation and capture outcome notes in `specs/002-calendar-event-e2e-tests/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies, start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all story work.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2.
- **Phase 5 (US3)**: Depends on Phase 2.
- **Phase 6 (Polish)**: Depends on completion of selected story phases.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2/US3.
- **US2 (P2)**: No dependency on US1/US3.
- **US3 (P3)**: No dependency on US1/US2 (its setup creates its own disposable event).

### Within Each User Story

- Write story test scenarios first, run and confirm failing baseline.
- Implement shared helper deltas for that story.
- Add stage-aware reporting and cleanup hooks.
- Re-run story-specific spec until passing.

### Parallel Opportunities

- Phase 1: T003 can run alongside T001-T002.
- Phase 2: T005, T006, T008 can run in parallel after T004 starts structure.
- US1: T012 and T013 parallel, then T014-T015.
- US2: T018 and T019 parallel, then T020-T021.
- US3: T022 and T024 parallel before T025-T026 sequencing.
- Polish: T027 and T028 parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel helper work for US1
T012 -> frontend/tests/e2e/support/eventForm.ts
T013 -> frontend/tests/e2e/support/dayListAssertions.ts

# Then complete scenario-specific wiring
T014 -> frontend/tests/e2e/event-create-all-day.spec.ts
T015 -> frontend/tests/e2e/event-create-all-day.spec.ts
```

## Parallel Example: User Story 2

```bash
# Parallel helper work for US2
T018 -> frontend/tests/e2e/support/eventForm.ts
T019 -> frontend/tests/e2e/support/dayListAssertions.ts

# Then finalize scenario checks
T020 -> frontend/tests/e2e/event-create-timed.spec.ts
T021 -> frontend/tests/e2e/event-create-timed.spec.ts
```

## Parallel Example: User Story 3

```bash
# Parallelizable delete flow preparation
T022 -> frontend/tests/e2e/event-delete.spec.ts
T024 -> frontend/tests/e2e/support/dayListAssertions.ts

# Then complete disposable setup and reporting
T025 -> frontend/tests/e2e/event-delete.spec.ts
T026 -> frontend/tests/e2e/event-delete.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) end to end.
3. Validate all-day create + refresh behavior independently.
4. Demo and merge MVP if schedule requires partial delivery.

### Incremental Delivery

1. Foundation complete (Phases 1-2).
2. Add US1 and validate.
3. Add US2 and validate.
4. Add US3 and validate.
5. Finish polish tasks and run full E2E suite.

### Parallel Team Strategy

1. One developer finalizes Playwright setup/foundation.
2. After Phase 2, split by story owner:
   - Dev A: US1
   - Dev B: US2
   - Dev C: US3
3. Rejoin for polish and full suite execution.

---

## Notes

- `[P]` tasks are file-separated and dependency-safe for parallel work.
- `[USx]` labels provide traceability back to spec user stories.
- Every story is independently executable and testable after Phase 2.
- Keep test data isolated via unique titles and cleanup hooks to satisfy repeatability requirements.

## Phase 7: Convergence

- [ ] T030 Implement all-day create and post-refresh E2E coverage in `frontend/tests/e2e/event-create-all-day.spec.ts` per US1/AC1, US1/AC2, FR-001, FR-002 (missing)
- [ ] T031 Implement timed create and post-refresh E2E coverage in `frontend/tests/e2e/event-create-timed.spec.ts` per US2/AC1, US2/AC2, FR-003, FR-004 (missing)
- [ ] T032 Implement delete flow and post-refresh absence E2E coverage in `frontend/tests/e2e/event-delete.spec.ts` per US3/AC1, US3/AC2, FR-005, FR-006 (missing)
- [ ] T033 Add deterministic E2E fixtures/helpers in `frontend/tests/e2e/support/fixtures.ts`, `frontend/tests/e2e/support/eventForm.ts`, `frontend/tests/e2e/support/dayListAssertions.ts`, `frontend/tests/e2e/support/eventCleanup.ts`, `frontend/tests/e2e/support/testData.ts`, and `frontend/tests/e2e/support/stageReporting.ts` per FR-007 and plan: constraints decision (missing)
- [ ] T034 Add Playwright dependency/scripts in `frontend/package.json`, add runner configuration in `frontend/playwright.config.ts`, and add artifact ignores in `frontend/.gitignore` per plan: testing decision and T001-T003 intent (missing)
- [ ] T035 Document E2E prerequisites and run command in `README.md` per FR-009 and SC-005 (missing)
- [ ] T036 Review whether `frontend/tests/e2e/calendar-navigation.spec.ts` should be retained as out-of-scope coverage and either justify it in `specs/002-calendar-event-e2e-tests/tasks.md` notes or remove it per spec scope (unrequested)
