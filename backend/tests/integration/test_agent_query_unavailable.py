import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_agent_unavailable_message_and_selected_day_context() -> None:
    client = APIClient()
    session = client.post("/api/v1/agent/session", {}, format="json")
    assert session.status_code == 201

    response = client.post(
        "/api/v1/agent/query",
        {
            "session_id": session.json()["session_id"],
            "question_text": "unavailable now",
            "selected_date_context": "2026-11-11",
        },
        format="json",
    )

    assert response.status_code == 503
    assert response.json()["message"] == "Calendar wizard guy is not home at the momen"
