from __future__ import annotations

import time
from dataclasses import dataclass
from datetime import date

from django.db import OperationalError
from django.db.models import Case, F, IntegerField, Value, When

from apps.calendar.models import Event

# Keep timeout and retries explicit and centralized for observability and tests.
DEFAULT_RANGE_READ_TIMEOUT_SECONDS = 0.25
DEFAULT_RANGE_READ_MAX_RETRIES = 2


class RangeQueryTimeoutError(Exception):
    pass


class RangeQueryServiceUnavailableError(Exception):
    pass


@dataclass(frozen=True)
class RangeQueryResult:
    events: list[Event]
    attempts: int
    elapsed_ms: int


def _fetch_events_once(start_date: date, end_date: date) -> list[Event]:
    return list(
        Event.objects.filter(event_date__gte=start_date, event_date__lte=end_date)
        .annotate(
            day_bucket=Case(
                When(is_all_day=True, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            )
        )
        .order_by("event_date", "day_bucket", "start_time", "created_at", F("id").asc())
    )


def list_events_by_range(
    start_date: date,
    end_date: date,
    *,
    timeout_seconds: float | None = None,
    max_retries: int | None = None,
) -> RangeQueryResult:
    timeout = (
        timeout_seconds
        if timeout_seconds is not None
        else DEFAULT_RANGE_READ_TIMEOUT_SECONDS
    )
    retries = max_retries if max_retries is not None else DEFAULT_RANGE_READ_MAX_RETRIES
    total_attempts = retries + 1

    last_error: Exception | None = None

    for attempt in range(1, total_attempts + 1):
        started = time.monotonic()
        try:
            events = _fetch_events_once(start_date, end_date)
        except OperationalError as exc:
            last_error = exc
            if attempt >= total_attempts:
                raise RangeQueryServiceUnavailableError(
                    "Unable to load events for this date range. Please try again."
                ) from exc
            continue

        elapsed = time.monotonic() - started
        if elapsed > timeout:
            last_error = RangeQueryTimeoutError(
                f"Range query exceeded timeout ({timeout:.3f}s)."
            )
            if attempt >= total_attempts:
                raise last_error
            continue

        return RangeQueryResult(events=events, attempts=attempt, elapsed_ms=int(elapsed * 1000))

    if isinstance(last_error, Exception):
        raise last_error

    raise RangeQueryServiceUnavailableError(
        "Unable to load events for this date range. Please try again."
    )
