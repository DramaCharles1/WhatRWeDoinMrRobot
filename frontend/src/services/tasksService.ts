import { apiRequest } from "./apiClient";
import type { TaskDto, TaskListResponse } from "../types/api";

export type TaskInput = {
  title: string;
  task_date: string;
  creator_name: string;
  notes?: string;
};

export async function listTasksByDate(date: string): Promise<TaskListResponse> {
  return apiRequest<TaskListResponse>(`/tasks?date=${encodeURIComponent(date)}`);
}

export async function createTask(input: TaskInput): Promise<TaskDto> {
  return apiRequest<TaskDto>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTask(taskId: string, input: Partial<TaskInput>): Promise<TaskDto> {
  return apiRequest<TaskDto>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  return apiRequest<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}
