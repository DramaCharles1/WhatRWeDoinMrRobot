from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.v1.errors import error_response
from services.audit import audit_task_event

from .models import Task
from .serializers import TaskSerializer
from .services.task_service import StaleTaskError, delete_task, list_tasks_by_date, update_task


class TaskListCreateView(APIView):
    def get(self, request):
        date = request.query_params.get("date")
        if not date:
            return error_response("validation_error", "date query parameter is required.")

        queryset = list_tasks_by_date(date)
        payload = TaskSerializer(queryset, many=True).data
        return Response({"date": date, "tasks": payload})

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if not serializer.is_valid():
            details = serializer.errors
            if "title" in details and "Title is required." in details["title"]:
                return error_response("validation_error", "Title is required.", details)
            if "creator_name" in details:
                return error_response(
                    "validation_error",
                    "Creator name must be present for create operations.",
                    details,
                )
            return error_response("validation_error", "Title must not be blank.", details)

        try:
            task = serializer.save()
        except IntegrityError:
            return error_response("duplicate", "(task_date, title) must be unique.")
        except Exception:
            return error_response("duplicate", "(task_date, title) must be unique.")

        audit_task_event("create", str(task.id), getattr(request, "correlation_id", None))
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    def patch(self, request, task_id):
        serializer = TaskSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response("validation_error", "Validation failed.", serializer.errors)

        try:
            task = update_task(task_id, serializer.validated_data)
        except Task.DoesNotExist:
            return error_response("not_found", "Task not found.")
        except IntegrityError:
            return error_response("duplicate", "(task_date, title) must be unique.")

        audit_task_event("update", str(task.id), getattr(request, "correlation_id", None))
        return Response(TaskSerializer(task).data)

    def delete(self, request, task_id):
        try:
            delete_task(task_id)
        except StaleTaskError as exc:
            return error_response("stale_operation", str(exc))

        audit_task_event("delete", str(task_id), getattr(request, "correlation_id", None))
        return Response(status=status.HTTP_204_NO_CONTENT)
