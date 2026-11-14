import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_empty_title_returns_exact_message() -> None:
    client = APIClient()

    response = client.post(
        "/api/v1/events",
        {
            "title": "",
            "event_date": "2026-11-14",
            "is_all_day": True,
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.json()["message"] == "Title is required."


@pytest.mark.django_db
def test_end_time_not_after_start_returns_exact_message() -> None:
    client = APIClient()

    response = client.post(
        "/api/v1/events",
        {
            "title": "Bad time",
            "event_date": "2026-11-14",
            "is_all_day": False,
            "start_time": "11:00",
            "end_time": "10:00",
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.json()["message"] == "End time must be later than start time."
