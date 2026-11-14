import datetime as dt

import pytest
from rest_framework.test import APIClient

from apps.calendar.models import Event


@pytest.mark.django_db
def test_delete_event_contract_204() -> None:
    client = APIClient()
    event = Event.objects.create(
        title="Delete me",
        event_date=dt.date(2026, 11, 14),
        is_all_day=True,
        notes="",
    )

    response = client.delete(f"/api/v1/events/{event.id}")

    assert response.status_code == 204


@pytest.mark.django_db
def test_delete_event_contract_404_for_unknown_id() -> None:
    client = APIClient()

    response = client.delete("/api/v1/events/00000000-0000-0000-0000-000000000001")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"
