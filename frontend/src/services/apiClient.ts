import type { ApiError } from "../types/api";

const BASE_URL = "/api/v1";

function parseApiError(payload: unknown): ApiError {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    const code = typeof record.code === "string" ? record.code : "unknown_error";
    const message =
      typeof record.message === "string" ? record.message : "Unexpected API error.";
    const details =
      typeof record.details === "object" && record.details !== null
        ? (record.details as Record<string, unknown>)
        : undefined;
    return { code, message, details };
  }

  return { code: "unknown_error", message: "Unexpected API error." };
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw parseApiError(payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
