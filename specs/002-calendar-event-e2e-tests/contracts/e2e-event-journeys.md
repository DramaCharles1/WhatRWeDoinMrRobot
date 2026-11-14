# E2E Journey Contract: Calendar Event Flows

## Purpose

Define externally observable end-to-end behavior for required calendar event journeys validated with Playwright.

## Scope

- Create all-day event
- Create timed event
- Delete existing event

## Shared Preconditions

- Frontend service is reachable to a browser user.
- Backend service and persistence are available.
- Test run starts from a known data state for targeted titles/dates.
- Test data uses unique titles to avoid collisions across reruns.

## Journey Contract 1: Create All-Day Event

- Actor: Calendar user
- Input:
  - Event title
  - Selected date
  - All-day selection
- Steps:
  - User opens the event creation flow for a day.
  - User enters title and marks event as all-day.
  - User saves the event.
- Expected Outcomes:
  - Save operation reports success to user.
  - Event appears in the selected day listing as an all-day entry.
  - Event remains visible after listing refresh.
- Failure Signals:
  - Save action fails, validation error appears, or event missing from listing.

## Journey Contract 2: Create Timed Event

- Actor: Calendar user
- Input:
  - Event title
  - Selected date
  - Start time
  - End time
- Steps:
  - User opens event creation flow.
  - User enters title with start/end times.
  - User saves the event.
- Expected Outcomes:
  - Save operation reports success to user.
  - Event appears in selected day listing with correct time range.
  - Event remains visible with matching values after listing refresh.
- Failure Signals:
  - Save action fails, times not preserved, or event missing from listing.

## Journey Contract 3: Delete Event

- Actor: Calendar user
- Input:
  - Existing event in selected day listing
- Steps:
  - User chooses delete action for the target event.
  - User confirms delete when prompted.
- Expected Outcomes:
  - Delete operation reports success to user.
  - Event is removed from current listing.
  - Event is absent after listing refresh.
- Failure Signals:
  - Delete reports error unexpectedly, or removed event reappears.

## Non-Functional Contract Expectations

- Each scenario reports which stage failed: create, retrieve/list, or delete.
- Each scenario performs cleanup so repeated execution is stable.
- Contract validation remains local-environment compatible and does not require direct database inspection.
