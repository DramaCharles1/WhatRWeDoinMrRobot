import { useEffect, useMemo, useState } from "react";

import { AgentPanel } from "../components/AgentPanel";
import { DayNavigator } from "../components/DayNavigator";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { TaskListEmptyState } from "../components/TaskListEmptyState";
import { createTask, deleteTask, listTasksByDate, updateTask } from "../services/tasksService";
import type { ApiError, TaskDto } from "../types/api";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [error, setError] = useState("");

  async function refresh(date = selectedDate) {
    const response = await listTasksByDate(date);
    setTasks(response.tasks);
  }

  useEffect(() => {
    refresh().catch((err: ApiError) => setError(err.message));
  }, [selectedDate]);

  const heading = useMemo(() => `Tasks for ${selectedDate}`, [selectedDate]);

  return (
    <main>
      <h1>SpeciaelFamily Calendar</h1>
      <DayNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
      <h2>{heading}</h2>
      {error ? <p>{error}</p> : null}
      <TaskForm
        selectedDate={selectedDate}
        editingTask={editingTask}
        onSubmit={async (input) => {
          try {
            if (editingTask) {
              await updateTask(editingTask.id, input);
              setEditingTask(null);
            } else {
              await createTask(input);
            }
            await refresh(selectedDate);
          } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message);
            if (apiError.code === "stale_operation") {
              await refresh(selectedDate);
            }
          }
        }}
      />
      {tasks.length === 0 ? <TaskListEmptyState /> : null}
      {tasks.length > 0 ? (
        <TaskList
          tasks={tasks}
          onEdit={(task) => setEditingTask(task)}
          onDelete={async (taskId) => {
            try {
              await deleteTask(taskId);
              await refresh(selectedDate);
            } catch (err) {
              const apiError = err as ApiError;
              setError(apiError.message);
              if (apiError.code === "stale_operation") {
                await refresh(selectedDate);
              }
            }
          }}
        />
      ) : null}
      <AgentPanel selectedDate={selectedDate} />
    </main>
  );
}
