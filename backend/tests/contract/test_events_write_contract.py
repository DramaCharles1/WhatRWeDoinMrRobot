import datetime as dt

import pytest
from rest_framework.test import APIClient

from apps.calendar.models import Event


@pytest.mark.django_db
def test_create_event_contract_success_and_duplicate_title_allowed() -> None:
    client = APIClient()
    date = dt.date(2026, 11, 14).isoformat()

    payload = {
        "title": "School pickup",
        "event_date": date,
        "is_all_day": False,
        "start_time": "15:00",
        "end_time": "16:00",
        "notes": "Gate B",
    }

    first = client.post("/api/v1/events", payload, format="json")
    second = client.post("/api/v1/events", payload, format="json")

    assert first.status_code == 201
    assert second.status_code == 201


@pytest.mark.django_db
def test_create_event_contract_validation_failure() -> None:
    client = APIClient()

    response = client.post(
        "/api/v1/events",
        {
            "title": "",
            "event_date": dt.date(2026, 11, 14).isoformat(),
            "is_all_day": False,
            "start_time": "11:00",
            "end_time": "10:00",
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.json()["code"] == "validation_error"


@pytest.mark.django_db
def test_patch_event_contract_success_and_validation_failure() -> None:
    client = APIClient()

    event = Event.objects.create(
        title="Doctor",
        event_date=dt.date(2026, 11, 14),
        is_all_day=False,
        start_time=dt.time(10, 0),
        end_time=dt.time(11, 0),
        notes="",
    )

    success = client.patch(
        f"/api/v1/events/{event.id}",
        {
            "title": "Doctor follow-up",
            "start_time": "10:30",
            "end_time": "11:30",
        },
        format="json",
    )
    invalid = client.patch(
        f"/api/v1/events/{event.id}",
        {
            "start_time": "14:00",
            "end_time": "12:00",
        },
        format="json",
    )

    assert success.status_code == 200
    assert success.json()["title"] == "Doctor follow-up"
    assert invalid.status_code == 400
    assert invalid.json()["code"] == "validation_error"
