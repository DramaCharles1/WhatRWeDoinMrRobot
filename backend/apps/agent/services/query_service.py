from dataclasses import dataclass

from apps.agent.models import AgentQuery, AgentSession
from services.ollama_client import OllamaClient, OllamaUnavailableError


@dataclass
class QueryResult:
    status: str
    response_text: str | None = None
    clarification_prompt: str | None = None
    error_message: str | None = None


def _is_ambiguous(question: str) -> bool:
    markers = ["what is next", "what's next", "what do i have", "next"]
    normalized = question.lower().strip()
    return any(marker in normalized for marker in markers)


def process_query(
    session: AgentSession,
    question_text: str,
    selected_date_context: str | None,
    client: OllamaClient | None = None,
) -> AgentQuery:
    if _is_ambiguous(question_text) and not selected_date_context:
        return AgentQuery.objects.create(
            session=session,
            question_text=question_text,
            effective_date_context=None,
            status=AgentQuery.Status.CLARIFICATION_REQUIRED,
            response_text="",
            error_message="",
        )

    ollama = client or OllamaClient()
    try:
        answer = ollama.ask(question_text, selected_date_context)
    except OllamaUnavailableError as exc:
        return AgentQuery.objects.create(
            session=session,
            question_text=question_text,
            effective_date_context=selected_date_context,
            status=AgentQuery.Status.ERROR,
            response_text="",
            error_message=str(exc),
        )

    return AgentQuery.objects.create(
        session=session,
        question_text=question_text,
        effective_date_context=selected_date_context,
        status=AgentQuery.Status.ANSWERED,
        response_text=answer.text,
        error_message="",
    )
