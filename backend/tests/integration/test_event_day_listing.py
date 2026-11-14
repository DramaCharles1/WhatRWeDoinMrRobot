import datetime as dt

import pytest
from rest_framework.test import APIClient

from apps.calendar.models import Event


@pytest.mark.django_db
def test_day_listing_filters_by_selected_date() -> None:
    client = APIClient()
    target_day = dt.date(2026, 11, 14)
    other_day = dt.date(2026, 11, 15)

    Event.objects.create(title="Today", event_date=target_day, is_all_day=True, notes="")
    Event.objects.create(title="Tomorrow", event_date=other_day, is_all_day=True, notes="")

    response = client.get(f"/api/v1/events?date={target_day.isoformat()}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["date"] == target_day.isoformat()
    assert [event["title"] for event in payload["events"]] == ["Today"]


@pytest.mark.django_db
def test_day_listing_orders_all_day_then_start_time_then_creation_order() -> None:
    client = APIClient()
    day = dt.date(2026, 11, 14)

    all_day_1 = Event.objects.create(
        title="All day first", event_date=day, is_all_day=True, notes=""
    )
    all_day_2 = Event.objects.create(
        title="All day second", event_date=day, is_all_day=True, notes=""
    )

    early = Event.objects.create(
        title="09:00",
        event_date=day,
        is_all_day=False,
        start_time=dt.time(9, 0),
        end_time=dt.time(9, 30),
        notes="",
    )
    timed_a = Event.objects.create(
        title="10:00 A",
        event_date=day,
        is_all_day=False,
        start_time=dt.time(10, 0),
        end_time=dt.time(10, 30),
        notes="",
    )
    timed_b = Event.objects.create(
        title="10:00 B",
        event_date=day,
        is_all_day=False,
        start_time=dt.time(10, 0),
        end_time=dt.time(11, 0),
        notes="",
    )

    response = client.get(f"/api/v1/events?date={day.isoformat()}")

    assert response.status_code == 200
    ids = [entry["id"] for entry in response.json()["events"]]
    assert ids == [
        str(all_day_1.id),
        str(all_day_2.id),
        str(early.id),
        str(timed_a.id),
        str(timed_b.id),
    ]
