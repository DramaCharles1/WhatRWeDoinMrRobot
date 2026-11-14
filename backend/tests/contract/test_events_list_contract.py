import datetime as dt

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_list_events_by_date_contract_success() -> None:
    client = APIClient()

    response = client.get(f"/api/v1/events?date={dt.date.today().isoformat()}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["date"] == dt.date.today().isoformat()
    assert isinstance(payload["events"], list)


@pytest.mark.django_db
def test_list_events_by_date_contract_missing_or_invalid_date_errors() -> None:
    client = APIClient()

    missing = client.get("/api/v1/events")
    assert missing.status_code == 400
    assert missing.json()["code"] == "validation_error"

    invalid = client.get("/api/v1/events?date=2026-99-99")
    assert invalid.status_code == 400
    assert invalid.json()["code"] == "validation_error"
