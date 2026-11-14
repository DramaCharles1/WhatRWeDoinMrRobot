from __future__ import annotations

import time

import pytest
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_event_create_latency_under_two_seconds_for_n20() -> None:
    client = APIClient()
    samples: list[float] = []

    for index in range(20):
        started = time.perf_counter()
        response = client.post(
            "/api/v1/events",
            {
                "title": f"Create latency {index}",
                "event_date": "2026-03-10",
                "is_all_day": True,
            },
            format="json",
        )
        elapsed_seconds = time.perf_counter() - started

        assert response.status_code == status.HTTP_201_CREATED
        samples.append(elapsed_seconds)

    assert max(samples) < 2.0
