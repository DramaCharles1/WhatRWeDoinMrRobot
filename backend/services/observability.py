import logging
import time
import uuid

from .metrics_registry import METRIC_EVENT_OPERATION_FAILURES, METRIC_HTTP_REQUEST_LATENCY_MS

logger = logging.getLogger("speciaelfamily.observability")


def build_correlation_id() -> str:
    return str(uuid.uuid4())


def emit_request_metric(path: str, method: str, latency_ms: int, correlation_id: str) -> None:
    logger.info(
        "request_metric",
        extra={
            "metric": METRIC_HTTP_REQUEST_LATENCY_MS,
            "path": path,
            "method": method,
            "latency_ms": latency_ms,
            "correlation_id": correlation_id,
        },
    )


def emit_event_failure_metric(operation: str, code: str, correlation_id: str) -> None:
    logger.info(
        "event_failure_metric",
        extra={
            "metric": METRIC_EVENT_OPERATION_FAILURES,
            "operation": operation,
            "code": code,
            "correlation_id": correlation_id,
        },
    )


def monotonic_ms() -> int:
    return int(time.perf_counter() * 1000)
