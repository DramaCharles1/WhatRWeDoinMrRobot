import logging
from datetime import UTC, datetime

logger = logging.getLogger("speciaelfamily.audit")


def audit_event_action(action: str, event_id: str | None, correlation_id: str | None) -> None:
    logger.info(
        "event_audit",
        extra={
            "action": action,
            "event_id": event_id,
            "correlation_id": correlation_id,
            "retention": "90d",
            "recorded_at": datetime.now(UTC).isoformat(),
        },
    )
