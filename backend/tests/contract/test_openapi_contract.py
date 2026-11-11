from pathlib import Path


def test_openapi_contract_exists() -> None:
    contract_path = Path(__file__).resolve().parents[3] / "specs/001-calendar-task-agent/contracts/openapi.yaml"
    assert contract_path.exists(), "OpenAPI contract file must exist"


def test_openapi_contract_has_required_paths() -> None:
    contract_path = Path(__file__).resolve().parents[3] / "specs/001-calendar-task-agent/contracts/openapi.yaml"
    content = contract_path.read_text(encoding="utf-8")
    assert "/tasks:" in content
    assert "/tasks/{taskId}:" in content
    assert "/agent/session:" in content
    assert "/agent/query:" in content
