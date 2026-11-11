import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_ambiguous_query_without_selected_date_requires_clarification() -> None:
    client = APIClient()
    session = client.post("/api/v1/agent/session", {}, format="json")
    assert session.status_code == 201

    response = client.post(
        "/api/v1/agent/query",
        {
            "session_id": session.json()["session_id"],
            "question_text": "What is next?",
        },
        format="json",
    )

    assert response.status_code == 422
    assert response.json()["code"] == "clarification_required"
