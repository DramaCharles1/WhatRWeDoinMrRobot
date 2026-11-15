import datetime as dt
import logging

import pytest
from django.db import OperationalError
from rest_framework.test import APIClient

from apps.calendar.models import Event
from apps.calendar.services import range_queries


@pytest.mark.django_db
def test_range_read_retries_transient_backend_failures_within_bound(monkeypatch) -> None:
    client = APIClient()
    Event.objects.create(
        title="Retry me",
        event_date=dt.date(2026, 11, 14),
        is_all_day=True,
        notes="",
    )

    attempts = {"count": 0}
    original_fetch = range_queries._fetch_events_once

    def flaky_fetch(start_date: dt.date, end_date: dt.date):
        attempts["count"] += 1
        if attempts["count"] == 1:
            raise OperationalError("temporary backend fault")
        return original_fetch(start_date, end_date)

    monkeypatch.setattr(range_queries, "_fetch_events_once", flaky_fetch)

    response = client.get("/api/v1/events/range?start_date=2026-11-14&end_date=2026-11-14")

    assert response.status_code == 200
    assert attempts["count"] == 2
    payload = response.json()
    assert payload["days"][0]["events"][0]["title"] == "Retry me"


@pytest.mark.django_db
def test_range_read_surfaces_structured_failure_context_after_timeout(
    monkeypatch, caplog
) -> None:
    client = APIClient()

    class SlowMonotonic:
        def __init__(self):
            self.value = 0.0

        def __call__(self):
            self.value += 0.5
            return self.value

    monkeypatch.setattr(range_queries, "time", type("_Time", (), {"monotonic": SlowMonotonic()}))
    monkeypatch.setattr(range_queries, "DEFAULT_RANGE_READ_TIMEOUT_SECONDS", 0.01)
    monkeypatch.setattr(range_queries, "DEFAULT_RANGE_READ_MAX_RETRIES", 1)
    monkeypatch.setattr(range_queries, "_fetch_events_once", lambda _s, _e: [])

    caplog.set_level(logging.INFO, logger="speciaelfamily.observability")
    response = client.get("/api/v1/events/range?start_date=2026-11-14&end_date=2026-11-14")

    assert response.status_code == 503
    payload = response.json()
    assert payload["code"] == "timeout"
    assert payload["message"] == "Unable to load events for this date range. Please try again."

    log_records = [r for r in caplog.records if r.getMessage() == "range_read_failure"]
    assert log_records
    assert any(getattr(r, "operation", "") == "range_read" for r in log_records)
    assert any(getattr(r, "code", "") == "timeout" for r in log_records)
