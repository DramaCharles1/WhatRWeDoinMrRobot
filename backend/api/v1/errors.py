from rest_framework import status
from rest_framework.response import Response


ERROR_STATUS = {
    "validation_error": status.HTTP_400_BAD_REQUEST,
    "not_found": status.HTTP_404_NOT_FOUND,
}


def error_response(code: str, message: str, details: dict | None = None) -> Response:
    payload = {"code": code, "message": message, "details": details or {}}
    return Response(payload, status=ERROR_STATUS.get(code, status.HTTP_400_BAD_REQUEST))
