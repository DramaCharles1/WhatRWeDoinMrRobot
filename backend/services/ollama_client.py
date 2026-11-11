from dataclasses import dataclass


@dataclass
class OllamaResponse:
    text: str


class OllamaUnavailableError(Exception):
    pass


class OllamaClient:
    def __init__(self, timeout_seconds: int = 15, retries: int = 1):
        self.timeout_seconds = timeout_seconds
        self.retries = retries

    def ask(self, question: str, context: str | None = None) -> OllamaResponse:
        # Placeholder gateway behavior: deterministic response plus fallback semantics.
        if "unavailable" in question.lower():
            raise OllamaUnavailableError("Calendar wizard guy is not home at the momen")
        response = f"Answer based on context {context or 'none'}: {question}"
        return OllamaResponse(text=response)
