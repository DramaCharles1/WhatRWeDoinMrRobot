from __future__ import annotations

import time
from statistics import mean

import pytest
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_submit_to_visible_round_trip_under_two_seconds_for_n20() -> None:
    client = APIClient()
    samples: list[float] = []

    for index in range(20):
        date_value = f"2026-01-{(index % 10) + 10:02d}"
        title_value = f"SC003-latency-{index}"

        started = time.perf_counter()
        create_response = client.post(
            "/api/v1/events",
            {
                "title": title_value,
                "event_date": date_value,
                "is_all_day": True,
            },
            format="json",
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        created_id = create_response.json()["id"]

        list_response = client.get("/api/v1/events", {"date": date_value})
        assert list_response.status_code == status.HTTP_200_OK
        event_ids = {event["id"] for event in list_response.json()["events"]}
        assert created_id in event_ids

        elapsed_seconds = time.perf_counter() - started
        samples.append(elapsed_seconds)

    assert max(samples) < 2.0
    assert mean(samples) < 1.0
