import datetime as dt

import pytest
from rest_framework.test import APIClient

from apps.calendar.models import Event


@pytest.mark.django_db
def test_delete_event_success_removes_row() -> None:
    client = APIClient()
    event = Event.objects.create(
        title="Cleanup",
        event_date=dt.date(2026, 11, 14),
        is_all_day=True,
        notes="",
    )

    response = client.delete(f"/api/v1/events/{event.id}")

    assert response.status_code == 204
    assert not Event.objects.filter(id=event.id).exists()


@pytest.mark.django_db
def test_delete_event_not_found_returns_operation_specific_message() -> None:
    client = APIClient()

    response = client.delete("/api/v1/events/00000000-0000-0000-0000-000000000001")

    assert response.status_code == 404
    assert response.json()["code"] == "not_found"
    assert response.json()["message"] == "Delete failed: Event not found."
