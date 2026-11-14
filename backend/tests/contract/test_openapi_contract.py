from pathlib import Path


def _resolve_contract_path() -> Path:
    # Support local monorepo runs and containerized backend-only mounts.
    explicit = (
        Path(__file__).resolve().parents[3] / "specs/001-calendar-task-agent/contracts/openapi.yaml"
    )
    if explicit.exists():
        return explicit

    for parent in Path(__file__).resolve().parents:
        candidate = parent / "specs/001-calendar-task-agent/contracts/openapi.yaml"
        if candidate.exists():
            return candidate

    return explicit


def test_openapi_contract_exists() -> None:
    contract_path = _resolve_contract_path()
    assert contract_path.exists(), "OpenAPI contract file must exist"


def test_openapi_contract_has_required_paths() -> None:
    contract_path = _resolve_contract_path()
    content = contract_path.read_text(encoding="utf-8")
    assert "/events:" in content
    assert "/events/{eventId}:" in content
    assert "/tasks:" not in content
    assert "/agent" not in content
