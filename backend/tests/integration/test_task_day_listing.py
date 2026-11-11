import datetime as dt

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_get_tasks_by_day_filters_results_and_returns_empty_list() -> None:
    client = APIClient()
    today = dt.date.today().isoformat()
    tomorrow = (dt.date.today() + dt.timedelta(days=1)).isoformat()

    client.post(
        "/api/v1/tasks",
        {"title": "Today task", "task_date": today, "creator_name": "Mia"},
        format="json",
    )
    client.post(
        "/api/v1/tasks",
        {"title": "Tomorrow task", "task_date": tomorrow, "creator_name": "Mia"},
        format="json",
    )

    today_res = client.get(f"/api/v1/tasks?date={today}")
    assert today_res.status_code == 200
    assert len(today_res.json()["tasks"]) == 1

    empty_day = (dt.date.today() + dt.timedelta(days=7)).isoformat()
    empty_res = client.get(f"/api/v1/tasks?date={empty_day}")
    assert empty_res.status_code == 200
    assert empty_res.json()["tasks"] == []
