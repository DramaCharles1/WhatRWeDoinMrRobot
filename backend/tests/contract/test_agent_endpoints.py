import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_agent_endpoints_contract_paths() -> None:
    client = APIClient()

    session = client.post("/api/v1/agent/session", {}, format="json")
    assert session.status_code in {201, 503}

    missing_context = client.post(
        "/api/v1/agent/query",
        {"session_id": "00000000-0000-0000-0000-000000000001", "question_text": "What is next?"},
        format="json",
    )
    assert missing_context.status_code in {422, 503, 404}
