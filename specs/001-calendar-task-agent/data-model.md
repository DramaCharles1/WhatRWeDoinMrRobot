# Data Model: SpeciaelFamily Calendar Task Management

## Entity: Task

Purpose: Represents a calendar task on a specific day in a shared, login-free calendar context.

Fields:
- `id`: UUID, immutable
- `title`: string, required, non-empty, trimmed, max length 200
- `task_date`: date, required (ISO date)
- `creator_name`: string, required, non-empty, max length 100
- `notes`: string, optional, max length 2000
- `created_at`: datetime (UTC), system-generated
- `updated_at`: datetime (UTC), system-generated

Validation Rules:
- Title must not be blank.
- `(task_date, title)` must be unique.
- Creator name must be present for create operations.

State/Transition Notes:
- Created -> Updated -> Deleted
- Update/delete requests against missing tasks are rejected as stale operations with user-facing
  message: `This task was already removed in another tab.`

## Entity: CalendarDay

Purpose: Read model for all tasks assigned to a selected date.

Fields:
- `date`: date
- `tasks`: ordered collection of Task summaries

Validation Rules:
- Returns empty `tasks` when no entries exist for the selected day.

## Entity: AgentSession

Purpose: Tracks a user-initiated question-answer exchange context for calendar queries.

Fields:
- `session_id`: UUID
- `started_at`: datetime (UTC)
- `status`: enum (`active`, `unavailable`, `closed`)

Validation Rules:
- Session must be active for query submission.

## Entity: AgentQuery

Purpose: Represents a natural-language question and response derived from calendar task data.

Fields:
- `query_id`: UUID
- `session_id`: UUID (FK -> AgentSession)
- `question_text`: string, required, non-empty
- `effective_date_context`: date, nullable
- `response_text`: string, nullable
- `created_at`: datetime (UTC)
- `status`: enum (`answered`, `clarification_required`, `error`)
- `error_message`: string, nullable

Validation Rules:
- If question is ambiguous and no selected day exists, mark status as `clarification_required`.
- If agent connection is unavailable, status is `error` with message:
  `Calendar wizard guy is not home at the momen`.

## Relationships

- `CalendarDay` 1 -> N `Task` (by `task_date`)
- `AgentSession` 1 -> N `AgentQuery`

## Derived/Indexing Considerations

- Unique index on `(task_date, title)`.
- Index on `task_date` for day-view retrieval.
- Index on `updated_at` for conflict/staleness handling and sorting.
