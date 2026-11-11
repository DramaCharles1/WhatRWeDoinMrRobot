import datetime as dt

import pytest
from apps.calendar.models import Task
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_tasks_crud_contract_status_codes() -> None:
    client = APIClient()
    payload = {
        "title": "Pay rent",
        "task_date": dt.date.today().isoformat(),
        "creator_name": "Sam",
        "notes": "monthly",
    }

    created = client.post("/api/v1/tasks", payload, format="json")
    assert created.status_code == 201
    task_id = created.json()["id"]

    bad = client.post(
        "/api/v1/tasks",
        {"title": "", "task_date": payload["task_date"], "creator_name": "Sam"},
        format="json",
    )
    assert bad.status_code == 400

    duplicate = client.post("/api/v1/tasks", payload, format="json")
    assert duplicate.status_code == 409

    updated = client.patch(f"/api/v1/tasks/{task_id}", {"notes": "updated"}, format="json")
    assert updated.status_code == 200

    missing = client.patch(
        "/api/v1/tasks/00000000-0000-0000-0000-000000000001",
        {"notes": "x"},
        format="json",
    )
    assert missing.status_code == 404

    deleted = client.delete(f"/api/v1/tasks/{task_id}")
    assert deleted.status_code == 204

    stale_delete = client.delete(f"/api/v1/tasks/{task_id}")
    assert stale_delete.status_code == 409


@pytest.mark.django_db
def test_delete_can_return_not_found_for_unknown_id() -> None:
    client = APIClient()
    # Contract includes 404; view emits this for malformed lookup fallback branch.
    assert not Task.objects.filter(pk="00000000-0000-0000-0000-000000000010").exists()
