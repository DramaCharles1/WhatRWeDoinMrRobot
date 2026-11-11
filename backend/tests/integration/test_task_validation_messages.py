import datetime as dt

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_empty_title_returns_exact_message() -> None:
    client = APIClient()
    response = client.post(
        "/api/v1/tasks",
        {
            "title": "",
            "task_date": dt.date.today().isoformat(),
            "creator_name": "Alex",
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.json()["message"] == "Title is required."
