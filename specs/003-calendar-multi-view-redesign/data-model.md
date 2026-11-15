# Data Model: Calendar Multi-View Redesign

## Entity: CalendarViewState

- Description: Canonical client-side state that controls what period is visible and what day is selected.
- Fields:
  - `viewMode`: One of `week`, `month`, or `day`.
  - `anchorDate`: Date that anchors current period navigation.
  - `selectedDate`: Explicitly selected date used for day-detail context.
  - `visibleRangeStart`: Start date of rendered range for active view.
  - `visibleRangeEnd`: End date of rendered range for active view.
- Validation Rules:
  - Default `viewMode` is `week` at first load.
  - `selectedDate` must always fall within the rendered range for week/month, or equal the rendered day in day view.
- Relationships:
  - Determines which `DayEventBucket` records are requested and displayed.

## Entity: DayEventBucket

- Description: One day of calendar output containing all events for that date.
- Fields:
  - `date`: ISO date for the bucket.
  - `events`: Ordered collection of `CalendarEvent` values for that date.
  - `visibleCount`: Number of events immediately rendered in compact layouts.
  - `overflowCount`: Number of additional events not shown inline but reachable via day detail.
- Validation Rules:
  - Every event for `date` must be represented in `events` even if compact rendering truncates inline display.
  - `overflowCount` must be zero in day view because full-day listing is required.
- Relationships:
  - Aggregates zero or more `CalendarEvent` entities.
  - Driven by `CalendarViewState.visibleRangeStart/End`.

## Entity: CalendarEvent

- Description: User-managed scheduling item shown in all calendar views and detail interactions.
- Fields:
  - `id`: Unique event identifier.
  - `title`: Required event title.
  - `eventDate`: Date to which the event belongs.
  - `isAllDay`: All-day indicator.
  - `startTime`: Optional time (required when not all-day).
  - `endTime`: Optional time (required when not all-day, later than `startTime`).
  - `notes`: Optional long-form event details.
  - `updatedAt`: Last-update timestamp used for refresh consistency.
- Validation Rules:
  - Title must be non-empty.
  - For timed events, both times are required and end must be later than start.
  - Create/update/delete outcomes must be reflected across all views that include `eventDate`.
- Relationships:
  - Belongs to exactly one `DayEventBucket` for a given date.
  - Can be referenced by `EventDetailState` when selected.

## Entity: EventDetailState

- Description: Interaction context for viewing/editing/deleting one selected event.
- Fields:
  - `selectedEventId`: Currently selected event identifier or null.
  - `mode`: One of `view`, `edit`, `confirm-delete`, or `closed`.
  - `originView`: View mode where the event was opened.
- Validation Rules:
  - `mode` must be `closed` when `selectedEventId` is null.
  - Save and delete actions must transition back to `view` or `closed` with synchronized calendar data.
- Relationships:
  - References one `CalendarEvent` at a time.
  - Uses `CalendarViewState` to return users to the same context after action completion.

## State Transitions

- `CalendarViewState.viewMode`: `week` <-> `month` <-> `day` via user toggle actions.
- `CalendarViewState.selectedDate`: updated by day-click or navigator controls; opening day view sets `viewMode = day`.
- `EventDetailState.mode`: `closed` -> `view` -> `edit` -> `view` (save) or `confirm-delete` -> `closed` (delete).
- Event mutation lifecycle: `Draft` -> `Saved` -> (`Updated` | `Deleted`) with all impacted buckets refreshed before interaction completes.
