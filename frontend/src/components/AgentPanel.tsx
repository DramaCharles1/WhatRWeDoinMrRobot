import { useState } from "react";

import { apiRequest } from "../services/apiClient";
import type { AgentQueryResponseDto, AgentSessionDto, ApiError } from "../types/api";

type Props = {
  selectedDate: string;
};

export function AgentPanel({ selectedDate }: Props) {
  const [session, setSession] = useState<AgentSessionDto | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  async function connect() {
    setError("");
    const response = await apiRequest<AgentSessionDto>("/agent/session", { method: "POST" });
    setSession(response);
  }

  async function askQuestion() {
    if (!session) return;
    setError("");
    try {
      const response = await apiRequest<AgentQueryResponseDto>("/agent/query", {
        method: "POST",
        body: JSON.stringify({
          session_id: session.session_id,
          question_text: question,
          selected_date_context: selectedDate,
        }),
      });
      setAnswer(response.response_text ?? "");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    }
  }

  return (
    <section>
      <h3>Calendar Wizard</h3>
      {!session ? (
        <button type="button" onClick={connect}>
          Connect
        </button>
      ) : null}
      <input
        aria-label="agent-question"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask calendar question"
      />
      <button type="button" onClick={askQuestion} disabled={!session}>
        Ask
      </button>
      {answer ? <p>{answer}</p> : null}
      {error ? <p>{error}</p> : null}
    </section>
  );
}
