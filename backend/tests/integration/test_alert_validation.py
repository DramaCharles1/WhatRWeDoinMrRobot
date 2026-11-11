from pathlib import Path


def test_alert_config_exists_for_trigger_and_recovery() -> None:
    path = Path(__file__).resolve().parents[3] / "infra/observability/agent-alerts.yml"
    content = path.read_text(encoding="utf-8")
    assert "AgentFailureRateHigh" in content
    assert "AgentLatencyHigh" in content
    assert "AgentDependencyDown" in content
