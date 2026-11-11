import uuid

from django.db import models


class AgentSession(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        UNAVAILABLE = "unavailable", "Unavailable"
        CLOSED = "closed", "Closed"

    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    started_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)


class AgentQuery(models.Model):
    class Status(models.TextChoices):
        ANSWERED = "answered", "Answered"
        CLARIFICATION_REQUIRED = "clarification_required", "Clarification Required"
        ERROR = "error", "Error"

    query_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AgentSession, on_delete=models.CASCADE, related_name="queries")
    question_text = models.TextField()
    effective_date_context = models.DateField(null=True, blank=True)
    response_text = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=32, choices=Status.choices)
    error_message = models.TextField(blank=True, default="")
