# Data Model: Simple Home Calendar MVP

## Entity: Event

Purpose: A single calendar item on one date, either all-day or with a start and end time.

Fields:
- `id`: UUID, immutable, system-generated
- `title`: string, required, trimmed, non-empty, max length 200
- `event_date`: date, required (ISO `YYYY-MM-DD`)
- `is_all_day`: boolean, required, default `false`
- `start_time`: time, nullable (required when `is_all_day` is `false`)
- `end_time`: time, nullable (required when `is_all_day` is `false`)
- `notes`: string, optional, max length 2000, default empty
- `created_at`: datetime (UTC), system-generated, never changes after creation
- `updated_at`: datetime (UTC), system-generated, updated on every save

Validation Rules:
- Title must not be blank (FR-008). User-facing message: `Title is required.`
- If `is_all_day` is `true`: `start_time` and `end_time` MUST be empty (they are hidden in the UI
  and cleared on save) (FR-015).
- If `is_all_day` is `false`: `start_time` and `end_time` are both required and `end_time` MUST be
  later than `start_time` (FR-013).
- Events never span multiple dates; one `event_date` per event.
- Duplicate titles on the same date are allowed (FR-014); no uniqueness constraint.

State/Transition Notes:
- Created -> Updated (any number of times) -> Deleted.
- Editing an event never changes `created_at`, so creation-order tie-breaking stays stable.
- Deleted events are permanently removed (no soft delete in MVP).

## Read Model: Calendar Day

Purpose: The ordered list of events for a selected date.

Fields:
- `date`: date
- `events`: ordered list of Event

Ordering (FR-006a/b/c), applied by the backend:
1. All-day events first.
2. Timed events by `start_time` ascending.
3. Ties broken by `created_at` ascending (creation order).

Returns an empty `events` list when no events exist for the date.

## Relationships

- Calendar Day 1 -> N Event (by `event_date`). There is no User/account entity in the MVP.

## Indexing and Constraints

- Index on `event_date` for day-view retrieval.
- Database check constraint mirroring the time rules (all-day has no times; timed has both times
  with `end_time > start_time`).
