# Contract: Calendar View and Event Journeys

## Purpose

Define externally observable user behavior for multi-view navigation and event lifecycle management.

## Shared Preconditions

- Calendar frontend is reachable in browser.
- Backend API is reachable and returns event data for target dates.
- Test scenarios use deterministic event titles/dates to prevent collisions.

## Journey 1: Week to Month Switch

- Actor: Calendar user
- Steps:
  - User lands on calendar page.
  - User confirms week view is active by default.
  - User switches to month view using view controls.
- Expected Outcomes:
  - Active view updates to month.
  - Month grid shows each day in the visible month.
  - Days with events show discoverable event entries or count indicators leading to event details/day view.
- Failure Signals:
  - Week is not default on load.
  - Month switch control fails or month day/event rendering is missing.

## Journey 2: Week to Day Switch

- Actor: Calendar user
- Steps:
  - User starts in week view.
  - User selects a day from week context.
- Expected Outcomes:
  - Day view opens for selected date.
  - Full event list for that date is visible.
  - Add-event action remains available in day view.
- Failure Signals:
  - Selected day does not open day view.
  - Day view omits events that appear in week context.

## Journey 3: Weekly Create/Edit/Delete Lifecycle

- Actor: Calendar user
- Steps:
  - User creates an event from week view.
  - User opens the same event details and edits fields.
  - User saves changes.
  - User deletes the same event and confirms deletion.
- Expected Outcomes:
  - Create action adds event to week/day buckets for the target date.
  - Edit action persists updated values and refreshes visible event entry.
  - Delete action removes event from all relevant views.
  - No manual page refresh is required at any step.
- Failure Signals:
  - Any mutation reports success but rendered state does not update.
  - Edited values do not persist.
  - Deleted event remains visible after action completion.

## Cross-Journey UX Contract

- Add-event entry point is present in week, month, and day views.
- Selecting any event exposes detail actions for view, edit, and delete.
- Empty day states remain explicit and include an add-event affordance.
- Interaction behavior remains usable on desktop and mobile layouts.
