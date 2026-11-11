import logging
from datetime import datetime, timezone

logger = logging.getLogger("speciaelfamily.audit")


def audit_task_event(action: str, task_id: str | None, correlation_id: str | None) -> None:
    logger.info(
        "task_audit",
        extra={
            "action": action,
            "task_id": task_id,
            "correlation_id": correlation_id,
            "retention": "90d",
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        },
    )


def audit_agent_event(action: str, session_id: str | None, correlation_id: str | None) -> None:
    logger.info(
        "agent_audit",
        extra={
            "action": action,
            "session_id": session_id,
            "correlation_id": correlation_id,
            "retention": "30d",
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        },
    )
