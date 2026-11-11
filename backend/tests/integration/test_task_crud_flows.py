import datetime as dt

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_duplicate_title_rejection_and_stale_conflict_message() -> None:
    client = APIClient()
    date = dt.date.today().isoformat()
    payload = {"title": "Pickup kids", "task_date": date, "creator_name": "Mia"}

    first = client.post("/api/v1/tasks", payload, format="json")
    assert first.status_code == 201

    duplicate = client.post("/api/v1/tasks", payload, format="json")
    assert duplicate.status_code == 409

    task_id = first.json()["id"]
    assert client.delete(f"/api/v1/tasks/{task_id}").status_code == 204

    stale = client.delete(f"/api/v1/tasks/{task_id}")
    assert stale.status_code == 409
    assert stale.json()["message"] == "This task was already removed in another tab."
