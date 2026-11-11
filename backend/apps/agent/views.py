from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.v1.errors import error_response
from services.audit import audit_agent_event

from .models import AgentQuery, AgentSession
from .services.query_service import process_query


class AgentSessionView(APIView):
    def post(self, request):
        session = AgentSession.objects.create(status=AgentSession.Status.ACTIVE)
        audit_agent_event("session_start", str(session.session_id), getattr(request, "correlation_id", None))
        return Response(
            {
                "session_id": str(session.session_id),
                "status": session.status,
                "started_at": session.started_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class AgentQueryView(APIView):
    def post(self, request):
        session_id = request.data.get("session_id")
        question_text = (request.data.get("question_text") or "").strip()
        selected_date_context = request.data.get("selected_date_context")

        if not session_id or not question_text:
            return error_response("validation_error", "session_id and question_text are required.")

        try:
            session = AgentSession.objects.get(session_id=session_id, status=AgentSession.Status.ACTIVE)
        except AgentSession.DoesNotExist:
            return error_response("not_found", "Active session not found.")

        query = process_query(session, question_text, selected_date_context)
        audit_agent_event("query", str(session.session_id), getattr(request, "correlation_id", None))

        if query.status == AgentQuery.Status.CLARIFICATION_REQUIRED:
            return error_response(
                "clarification_required",
                "Please select a day or provide a date in your question.",
                {
                    "clarification_prompt": "Which day should I use for that question?",
                    "status": "clarification_required",
                },
            )

        if query.status == AgentQuery.Status.ERROR:
            return error_response("agent_unavailable", "Calendar wizard guy is not home at the momen")

        return Response(
            {
                "query_id": str(query.query_id),
                "status": query.status,
                "response_text": query.response_text,
                "error_message": query.error_message,
            },
            status=status.HTTP_200_OK,
        )
