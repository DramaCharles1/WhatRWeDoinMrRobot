from __future__ import annotations

import pytest
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_created_event_persists_across_new_clients_and_refresh() -> None:
    create_client = APIClient()
    create_response = create_client.post(
        "/api/v1/events",
        {
            "title": "Persistence check",
            "event_date": "2026-04-04",
            "is_all_day": True,
            "notes": "must persist",
        },
        format="json",
    )

    assert create_response.status_code == status.HTTP_201_CREATED
    created_event = create_response.json()

    # A fresh client simulates a page refresh and backend process restart boundary.
    refreshed_client = APIClient()
    listing_response = refreshed_client.get("/api/v1/events", {"date": "2026-04-04"})

    assert listing_response.status_code == status.HTTP_200_OK
    payload = listing_response.json()
    assert payload["date"] == "2026-04-04"
    assert payload["events"] == [created_event]
