# Data Model: Calendar Event E2E Coverage

## Entity: CalendarEvent

- Description: A user-visible scheduling item displayed in a day listing.
- Fields:
  - `eventId`: Unique identifier for an event.
  - `title`: User-provided event title.
  - `date`: Calendar date associated with the event.
  - `isAllDay`: Flag indicating all-day versus timed event.
  - `startTime`: Start time for timed events; absent for all-day events.
  - `endTime`: End time for timed events; absent for all-day events.
- Validation Rules:
  - `title` must be non-empty.
  - For timed events, both `startTime` and `endTime` are required.
  - For all-day events, time fields are not required.
- Relationships:
  - Included in `DayEventListing` by `date`.

## Entity: DayEventListing

- Description: Collection of `CalendarEvent` entries visible for a selected day.
- Fields:
  - `date`: The selected day context.
  - `events`: Ordered collection of events for that day.
- Validation Rules:
  - A created event must appear in the listing for its date.
  - A deleted event must not appear in subsequent listing reads.
- Relationships:
  - Aggregates zero or more `CalendarEvent` entities.

## Entity: E2ETestScenario

- Description: A deterministic validation journey executed through frontend and backend integration.
- Fields:
  - `scenarioId`: Unique scenario identifier.
  - `journeyType`: One of `create_all_day`, `create_timed`, `delete_event`.
  - `preconditions`: Required data/environment setup.
  - `actions`: Ordered user-visible steps.
  - `expectedOutcomes`: Assertions on create/list/delete behavior.
  - `cleanupSteps`: Data reset actions to keep reruns reliable.
- Validation Rules:
  - Must start from known state before actions.
  - Must include explicit assertions for success/failure at the journey stage level.
  - Must clean up any created event data.
- Relationships:
  - Operates on one or more `CalendarEvent` instances and validates `DayEventListing` outcomes.

## State Transitions

- `Planned` -> `Executed` -> `Passed` for successful scenario execution.
- `Planned` -> `Executed` -> `Failed` when assertions fail during create/list/delete stage.
- `Executed` -> `Cleaned` after cleanup steps complete, regardless of pass/fail outcome.
