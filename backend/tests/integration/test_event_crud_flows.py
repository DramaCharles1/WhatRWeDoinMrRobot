import datetime as dt

import pytest
from rest_framework.test import APIClient

from apps.calendar.models import Event


@pytest.mark.django_db
def test_create_event_trims_title_and_allows_duplicate_title_same_day() -> None:
    client = APIClient()
    payload = {
        "title": "  Groceries  ",
        "event_date": "2026-11-14",
        "is_all_day": True,
        "notes": "weekly",
    }

    first = client.post("/api/v1/events", payload, format="json")
    second = client.post("/api/v1/events", payload, format="json")

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["title"] == "Groceries"

    count = Event.objects.filter(title="Groceries", event_date="2026-11-14").count()
    assert count == 2


@pytest.mark.django_db
def test_all_day_event_clears_times_on_create_and_update() -> None:
    client = APIClient()

    created = client.post(
        "/api/v1/events",
        {
            "title": "School holiday",
            "event_date": "2026-11-14",
            "is_all_day": True,
            "start_time": "08:00",
            "end_time": "09:00",
            "notes": "",
        },
        format="json",
    )
    assert created.status_code == 201
    event_id = created.json()["id"]
    assert created.json()["start_time"] is None
    assert created.json()["end_time"] is None

    updated = client.patch(
        f"/api/v1/events/{event_id}",
        {
            "is_all_day": True,
            "start_time": "12:00",
            "end_time": "13:00",
        },
        format="json",
    )
    assert updated.status_code == 200
    assert updated.json()["start_time"] is None
    assert updated.json()["end_time"] is None


@pytest.mark.django_db
def test_timed_event_requires_end_after_start() -> None:
    client = APIClient()

    invalid_create = client.post(
        "/api/v1/events",
        {
            "title": "Bad create",
            "event_date": "2026-11-14",
            "is_all_day": False,
            "start_time": "11:00",
            "end_time": "10:00",
        },
        format="json",
    )
    assert invalid_create.status_code == 400

    event = Event.objects.create(
        title="Bad update",
        event_date=dt.date(2026, 11, 14),
        is_all_day=False,
        start_time=dt.time(9, 0),
        end_time=dt.time(10, 0),
        notes="",
    )

    invalid_update = client.patch(
        f"/api/v1/events/{event.id}",
        {
            "start_time": "13:00",
            "end_time": "12:00",
        },
        format="json",
    )
    assert invalid_update.status_code == 400


@pytest.mark.django_db
def test_update_event_trims_title() -> None:
    client = APIClient()
    event = Event.objects.create(
        title="Original",
        event_date=dt.date(2026, 11, 14),
        is_all_day=True,
        notes="",
    )

    response = client.patch(
        f"/api/v1/events/{event.id}",
        {
            "title": "  Updated title  ",
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated title"
