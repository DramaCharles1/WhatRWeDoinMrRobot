import datetime as dt

import pytest
from rest_framework.test import APIClient

from apps.calendar.models import Event


@pytest.mark.django_db
def test_list_events_by_date_contract_success() -> None:
    client = APIClient()

    response = client.get(f"/api/v1/events?date={dt.date.today().isoformat()}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["date"] == dt.date.today().isoformat()
    assert isinstance(payload["events"], list)


@pytest.mark.django_db
def test_list_events_by_date_contract_missing_or_invalid_date_errors() -> None:
    client = APIClient()

    missing = client.get("/api/v1/events")
    assert missing.status_code == 400
    assert missing.json()["code"] == "validation_error"

    invalid = client.get("/api/v1/events?date=2026-99-99")
    assert invalid.status_code == 400
    assert invalid.json()["code"] == "validation_error"


@pytest.mark.django_db
def test_list_events_by_range_contract_success() -> None:
    client = APIClient()
    Event.objects.create(
        title="Range contract",
        event_date=dt.date(2026, 11, 14),
        is_all_day=True,
        notes="",
    )

    response = client.get("/api/v1/events/range?start_date=2026-11-14&end_date=2026-11-16")

    assert response.status_code == 200
    payload = response.json()
    assert payload["start_date"] == "2026-11-14"
    assert payload["end_date"] == "2026-11-16"
    assert isinstance(payload["days"], list)
    assert len(payload["days"]) == 3
    assert payload["days"][0]["date"] == "2026-11-14"
    assert payload["days"][0]["events"][0]["title"] == "Range contract"


@pytest.mark.django_db
def test_list_events_by_range_contract_invalid_parameter_errors() -> None:
    client = APIClient()

    missing = client.get("/api/v1/events/range")
    assert missing.status_code == 400
    assert missing.json()["code"] == "validation_error"

    invalid_date = client.get("/api/v1/events/range?start_date=bad&end_date=2026-11-16")
    assert invalid_date.status_code == 400
    assert invalid_date.json()["code"] == "validation_error"

    reversed_range = client.get(
        "/api/v1/events/range?start_date=2026-11-16&end_date=2026-11-14"
    )
    assert reversed_range.status_code == 400
    assert reversed_range.json()["code"] == "validation_error"
