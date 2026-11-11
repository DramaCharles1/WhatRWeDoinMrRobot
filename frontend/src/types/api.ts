export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type TaskDto = {
  id: string;
  title: string;
  task_date: string;
  creator_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type TaskListResponse = {
  date: string;
  tasks: TaskDto[];
};

export type AgentSessionDto = {
  session_id: string;
  status: "active" | "unavailable" | "closed";
  started_at: string;
};

export type AgentQueryResponseDto = {
  query_id: string;
  status: "answered" | "clarification_required" | "error";
  response_text?: string;
  clarification_prompt?: string;
  error_message?: string;
};
