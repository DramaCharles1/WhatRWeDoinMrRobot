from rest_framework import status
from rest_framework.response import Response


ERROR_STATUS = {
    "validation_error": status.HTTP_400_BAD_REQUEST,
    "not_found": status.HTTP_404_NOT_FOUND,
    "duplicate": status.HTTP_409_CONFLICT,
    "stale_operation": status.HTTP_409_CONFLICT,
    "agent_unavailable": status.HTTP_503_SERVICE_UNAVAILABLE,
    "clarification_required": status.HTTP_422_UNPROCESSABLE_ENTITY,
}


def error_response(code: str, message: str, details: dict | None = None) -> Response:
    payload = {"code": code, "message": message, "details": details or {}}
    return Response(payload, status=ERROR_STATUS.get(code, status.HTTP_400_BAD_REQUEST))
