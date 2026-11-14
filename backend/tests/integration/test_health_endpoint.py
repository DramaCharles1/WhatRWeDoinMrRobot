from __future__ import annotations

from rest_framework import status
from rest_framework.test import APIClient


def test_health_endpoint_returns_expected_payload() -> None:
    client = APIClient()

    response = client.get("/api/v1/health")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "ok"}
