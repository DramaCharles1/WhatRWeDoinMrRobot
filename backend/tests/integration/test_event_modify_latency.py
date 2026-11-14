from __future__ import annotations

import time

import pytest
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_event_edit_latency_under_two_seconds_for_n20() -> None:
    client = APIClient()
    create_response = client.post(
        "/api/v1/events",
        {
            "title": "Edit latency source",
            "event_date": "2026-03-10",
            "is_all_day": True,
        },
        format="json",
    )
    assert create_response.status_code == status.HTTP_201_CREATED
    event_id = create_response.json()["id"]

    samples: list[float] = []
    for index in range(20):
        started = time.perf_counter()
        update_response = client.patch(
            f"/api/v1/events/{event_id}",
            {
                "title": f"Edit latency {index}",
                "event_date": "2026-03-10",
                "is_all_day": False,
                "start_time": "09:00",
                "end_time": "10:00",
                "notes": "latency check",
            },
            format="json",
        )
        elapsed_seconds = time.perf_counter() - started

        assert update_response.status_code == status.HTTP_200_OK
        samples.append(elapsed_seconds)

    assert max(samples) < 2.0


def test_event_delete_latency_under_two_seconds_for_n20() -> None:
    client = APIClient()

    samples: list[float] = []
    for index in range(20):
        create_response = client.post(
            "/api/v1/events",
            {
                "title": f"Delete latency source {index}",
                "event_date": "2026-03-10",
                "is_all_day": True,
            },
            format="json",
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        event_id = create_response.json()["id"]

        started = time.perf_counter()
        delete_response = client.delete(f"/api/v1/events/{event_id}")
        elapsed_seconds = time.perf_counter() - started

        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        samples.append(elapsed_seconds)

    assert max(samples) < 2.0
