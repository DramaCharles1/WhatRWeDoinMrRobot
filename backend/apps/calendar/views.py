from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from api.v1.errors import error_response
from services.audit import audit_event_action
from services.observability import emit_event_failure_metric

from .models import Event
from .serializers import EventSerializer, EventUpdateSerializer, EventWriteSerializer
from .services.task_service import (
    DeleteEventError,
    create_event,
    delete_event,
    list_events_by_date,
    update_event,
)


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, _request):
        return Response({"status": "ok"})


class EventListCreateView(APIView):
    def get(self, request):
        date_param = request.query_params.get("date")
        if not date_param:
            emit_event_failure_metric("list", "validation_error", getattr(request, "correlation_id", ""))
            return error_response("validation_error", "date query parameter is required.")

        try:
            validated_date = EventWriteSerializer().fields["event_date"].to_internal_value(date_param)
        except ValidationError:
            emit_event_failure_metric("list", "validation_error", getattr(request, "correlation_id", ""))
            return error_response("validation_error", "date query parameter must be a valid ISO date.")

        queryset = list_events_by_date(validated_date)
        payload = EventSerializer(queryset, many=True).data
        return Response({"date": date_param, "events": payload})

    def post(self, request):
        serializer = EventWriteSerializer(data=request.data)
        if not serializer.is_valid():
            details = serializer.errors
            if "title" in details and "Title is required." in details["title"]:
                emit_event_failure_metric("create", "validation_error", getattr(request, "correlation_id", ""))
                return error_response("validation_error", "Title is required.", details)
            if "end_time" in details and "End time must be later than start time." in details["end_time"]:
                emit_event_failure_metric("create", "validation_error", getattr(request, "correlation_id", ""))
                return error_response("validation_error", "End time must be later than start time.", details)
            emit_event_failure_metric("create", "validation_error", getattr(request, "correlation_id", ""))
            return error_response("validation_error", "Validation failed.", details)

        event = create_event(serializer.validated_data)
        audit_event_action("create", str(event.id), getattr(request, "correlation_id", None))
        return Response(EventSerializer(event).data, status=status.HTTP_201_CREATED)


class EventDetailView(APIView):
    def patch(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            emit_event_failure_metric("update", "not_found", getattr(request, "correlation_id", ""))
            return error_response("not_found", "Event not found.")

        serializer = EventUpdateSerializer(event, data=request.data, partial=True)
        if not serializer.is_valid():
            details = serializer.errors
            if "title" in details and "Title is required." in details["title"]:
                emit_event_failure_metric("update", "validation_error", getattr(request, "correlation_id", ""))
                return error_response("validation_error", "Title is required.", details)
            if "end_time" in details and "End time must be later than start time." in details["end_time"]:
                emit_event_failure_metric("update", "validation_error", getattr(request, "correlation_id", ""))
                return error_response("validation_error", "End time must be later than start time.", details)
            emit_event_failure_metric("update", "validation_error", getattr(request, "correlation_id", ""))
            return error_response("validation_error", "Validation failed.", details)

        updated = update_event(event_id, serializer.validated_data)
        audit_event_action("update", str(updated.id), getattr(request, "correlation_id", None))
        return Response(EventSerializer(updated).data)

    def delete(self, request, event_id):
        try:
            delete_event(event_id)
        except DeleteEventError as exc:
            emit_event_failure_metric("delete", "not_found", getattr(request, "correlation_id", ""))
            return error_response("not_found", str(exc))

        audit_event_action("delete", str(event_id), getattr(request, "correlation_id", None))
        return Response(status=status.HTTP_204_NO_CONTENT)
