from django.utils.deprecation import MiddlewareMixin

from backend.security import apply_security_headers
from services.observability import build_correlation_id, emit_request_metric, monotonic_ms


class RequestContextMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._started_ms = monotonic_ms()
        correlation_id = request.headers.get("X-Correlation-ID") or build_correlation_id()
        request.correlation_id = correlation_id

    def process_response(self, request, response):
        correlation_id = getattr(request, "correlation_id", build_correlation_id())
        response["X-Correlation-ID"] = correlation_id
        started_ms = getattr(request, "_started_ms", monotonic_ms())
        latency_ms = max(0, monotonic_ms() - started_ms)
        emit_request_metric(request.path, request.method, latency_ms, correlation_id)
        return apply_security_headers(response)
