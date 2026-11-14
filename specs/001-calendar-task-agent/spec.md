# Feature Specification: Simple Home Calendar MVP

**Feature Branch**: `001-calendar-task-agent`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "Create a minimal home calendar application. The app should let a user quickly view a calendar, create events, edit them, and remove them. The interface should stay simple and easy to use. Keep the first version small and focused on essential date planning needs. No login, no automation, no extra platform features."

## Clarifications

### Session 2026-11-12

- Q: Which validation contract should the spec adopt for create/edit event fields to close the CHK001 completeness gap? -> A: Explicit MVP contract: title required and trimmed with max length 200; details optional with max length 2000; date format `YYYY-MM-DD`; timed events use `HH:MM` 24-hour local time; edit enforces the same validation rules as create.
- Q: Should FR-010 be rewritten with measurable UI clarity criteria so "simple" is no longer subjective? -> A: Keep FR-010 qualitative only.
- Q: Should the spec require deterministic validation message text for both required title and invalid timed range cases? -> A: Require exact canonical messages for both cases.
- Q: Which measurement protocol should the spec adopt for SC-001 to SC-003 so the thresholds are objectively verifiable without hidden assumptions? -> A: Add protocol measured on localhost, sample size n>=20 per flow, timing starts at submit action, timing ends when update is visible in selected day view, and SC-003 includes successful save/update attempts only.
- Q: How should acceptance scenarios be mapped to requirement IDs to satisfy traceability for CHK008? -> A: Add `Maps to:` requirement ID tags beneath each acceptance scenario.
- Q: What recovery behavior should be required when create/update/delete fails so users can continue safely without losing context? -> A: Require only a clear error message; no retained inputs, retry control, or reconciliation behavior is required.
- Q: Which minimum non-functional requirement set should the MVP spec include to make accessibility and responsiveness explicit and testable? -> A: Add explicit MVP NFRs for keyboard access, visible focus states, labeled form controls/errors, and responsive usability at 360px and 1280px without horizontal scrolling in core flows.

### Session 2026-11-14

- Q: Should static code analysis be enforced as a required quality gate before merge? -> A: Yes. Static analysis, type checking, and successful production builds are required for both backend and frontend before merge; failing any gate blocks delivery.
- Q: When the code moves from the current Task model to the Event model, what should happen to any task records already in the database? → A: Discard old task data; replace the Task table with a new Event table (no data migration).
- Q: Which governance path should this feature use to permit the Task to Event breaking API/schema change while staying constitution-compliant? -> A: Add explicit breaking-change approval in this feature docs (spec and plan) with rationale, impact, rollback/mitigation, and reviewer sign-off requirement.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the Calendar (Priority: P1)

As a user, I can open the calendar and see the schedule for a chosen date so I can understand what is planned for the day.

**Why this priority**: The core value of a calendar is to show what matters for a given day or time period.

**Independent Test**: A user can open the app, switch to a date, and confirm the correct events appear for that day.

**Acceptance Scenarios**:

1. **Given** the user opens the calendar, **When** they select a date, **Then** the app shows the events scheduled for that date.
	Maps to: FR-002, FR-006
2. **Given** no events are scheduled for a selected date, **When** the date is opened, **Then** the app shows a clear empty state.
	Maps to: FR-007
3. **Given** the user moves between dates, **When** they choose another day, **Then** the visible events update to match the newly selected date.
	Maps to: FR-002, FR-006

---

### User Story 2 - Create and Edit Events (Priority: P1)

As a user, I can create and update simple calendar events so I can keep my schedule current without friction.

**Why this priority**: Event creation and editing are the main day-to-day actions needed by a home calendar.

**Independent Test**: A user can add an event with a title and date, then edit and save changes without leaving the calendar flow.

**Acceptance Scenarios**:

1. **Given** the user is viewing a date, **When** they create an event with a title and either (a) start and end times or (b) all-day selected, **Then** the event is added to the selected day.
	Maps to: FR-003, FR-015
2. **Given** an existing event is visible, **When** the user edits its title, time settings, or details, **Then** the updated event replaces the previous version.
	Maps to: FR-004, FR-020
3. **Given** a user tries to save an event without a title, **When** they submit the form, **Then** the save is blocked and a clear validation message appears.
	Maps to: FR-008, FR-021

---

### User Story 3 - Remove Events (Priority: P2)

As a user, I can delete an event when it is no longer needed so the calendar stays accurate.

**Why this priority**: Event removal keeps the calendar useful and prevents stale items from remaining on the schedule.

**Independent Test**: A user can remove an event and confirm it is no longer shown in the selected day.

**Acceptance Scenarios**:

1. **Given** an event exists in the calendar, **When** the user deletes it, **Then** it disappears from the selected day view.
	Maps to: FR-005
2. **Given** the user deletes an event, **When** the calendar refreshes, **Then** the remaining events are displayed without the removed item.
	Maps to: FR-005, FR-012

---

### Edge Cases

- If a user submits an event with no title (or only whitespace), the app MUST block the save and show the exact message `Title is required.`.
- The app MUST allow duplicate event titles on the same day.
- If an event is not marked all-day, the app MUST require both start time and end time, the end time MUST be later than the start time, and when invalid it MUST show the exact message `End time must be later than start time.`.
- If an event is marked all-day, it MUST apply to exactly one selected date, and start/end time fields MUST be hidden in the form.
- In day view ordering, all-day events MUST appear before timed events.
- If multiple timed events have the same start time, they MUST be ordered by creation order.
- If the selected date has no events, the app MUST show an empty-state message instead of a blank area.
- If the user leaves the form without saving, the app MUST keep the calendar state unchanged.
- If create, update, or delete fails, the app MUST show a clear operation-specific error message; no additional recovery behavior is required in MVP.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a simple web-based calendar interface for viewing a selected date.
- **FR-002**: The system MUST allow users to choose a date from the calendar to view events for that day.
- **FR-003**: The system MUST allow users to create a calendar event with a non-empty title, a date, and either (a) start and end times or (b) an all-day marker.
- **FR-004**: The system MUST allow users to edit the title, date, time settings (start/end or all-day), and details of an existing event.
- **FR-005**: The system MUST allow users to remove an existing event from the calendar.
- **FR-006**: The system MUST display all scheduled events for the selected day in a clear, readable list.
- **FR-006a**: The system MUST display events in chronological order for the selected day.
- **FR-006b**: The system MUST display all-day events before timed events in the selected day view.
- **FR-006c**: The system MUST preserve creation order as the tie-breaker when timed events share the same start time.
- **FR-007**: The system MUST show a clear empty state when a selected day has no events.
- **FR-008**: The system MUST require a user to provide a title before saving a new or edited event.
- **FR-009**: The system MUST support a simple user flow for creating, editing, and deleting events without login or account setup.
- **FR-010**: The system MUST keep the interface simple, with easy-to-understand controls for date selection and event management. For MVP, this requirement is intentionally qualitative and evaluated alongside SC-004 usability outcomes.
- **FR-011**: The system MUST keep the feature set limited to essential calendar planning for the first release.
- **FR-012**: The system MUST persist created, edited, and deleted events so calendar data remains consistent after page refreshes and application restarts.
- **FR-013**: The system MUST validate that non-all-day events have an end time later than the start time.
- **FR-014**: The system MUST allow duplicate event titles on the same day.
- **FR-015**: The system MUST treat all-day events as single-day events and hide start/end time inputs when all-day is selected.
- **FR-016**: The system MUST trim leading and trailing whitespace from event titles and enforce a maximum title length of 200 characters for create and edit operations.
- **FR-017**: The system MUST treat event details as optional and enforce a maximum details length of 2000 characters for create and edit operations.
- **FR-018**: The system MUST require event dates in ISO format `YYYY-MM-DD` for create and edit operations.
- **FR-019**: The system MUST require timed event start and end values in `HH:MM` 24-hour format interpreted in local calendar time.
- **FR-020**: The system MUST apply identical validation rules for create and edit operations across title, date, timed/all-day mode, and details fields.
- **FR-021**: When title validation fails because the submitted value is empty after trimming, the system MUST return the exact validation message `Title is required.`.
- **FR-022**: When timed-event validation fails because `end_time` is not later than `start_time`, the system MUST return the exact validation message `End time must be later than start time.`.
- **FR-023**: When create, update, or delete operations fail, the system MUST return a clear operation-specific error message. No additional recovery requirements (input retention, retry action, or automatic reconcile) are mandated for MVP.
- **FR-024**: The system MUST provide keyboard-accessible interaction for core calendar controls (date navigation, event create/edit/delete actions), visible focus indicators for interactive elements, and accessible labels for form fields and validation messages.
- **FR-025**: The system MUST support responsive usability for core flows at viewport widths of 360px and 1280px, without horizontal scrolling in day navigation and event create/edit/delete interactions.
- **FR-026**: When the Event schema replaces the prior Task schema, the system MUST discard existing task records and MUST NOT migrate them into events; the Task table is removed and a new Event table is created.
- **FR-027**: Because replacing Task with Event is a breaking API/schema change, this feature MUST include explicit approval artifacts in `spec.md` and `plan.md` before implementation: the breaking-change rationale, consumer impact, rollback/mitigation approach, and required reviewer sign-off.

### Key Entities *(include if feature involves data)*

- **Event**: A scheduled item with a required title (trimmed, max 200), a required date in `YYYY-MM-DD` format, and either (a) start and end times in `HH:MM` 24-hour local time or (b) an all-day marker for exactly one date, plus optional details (max 2000).
- **Calendar Day**: A selected date containing zero or more scheduled events.
- **User**: A local user of the application, with no account system required for the MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new event in under 30 seconds from a selected date view.
- **SC-002**: Users can edit or delete an event in under 30 seconds once it is visible on the page.
- **SC-003**: 95% of tested event saves and updates are reflected in the selected day view without a page refresh.
- **SC-004**: 90% of users can complete a basic event-creation flow without needing instructions or help.
- **SC-005**: All required backend and frontend quality gates pass before merge, including static analysis, type checking, and successful production builds.

### Measurement Protocol

- SC-001 to SC-003 measurements MUST be captured in localhost test runs.
- For each measured flow, sample size MUST be at least 20 attempts (`n>=20`).
- For SC-001 and SC-002 timing, measurement MUST start at user submit action and end when the resulting update is visible in the selected day view.
- For SC-003, the denominator MUST include only successful save/update attempts.
- For SC-005, the implementation MUST pass clean local runs of: backend `ruff check .`, `mypy .`, `python manage.py check`; frontend `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
