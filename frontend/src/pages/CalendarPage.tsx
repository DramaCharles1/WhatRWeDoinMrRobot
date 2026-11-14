import { useCallback, useEffect, useMemo, useState } from "react";

import { DayNavigator } from "../components/DayNavigator";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { TaskListEmptyState } from "../components/TaskListEmptyState";
import { createEvent, deleteEvent, listEventsByDate, updateEvent } from "../services/tasksService";
import type { ApiError, EventDto } from "../types/api";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [tasks, setTasks] = useState<EventDto[]>([]);
  const [editingTask, setEditingTask] = useState<EventDto | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(
    async (date = selectedDate) => {
      setIsLoading(true);
      try {
        const response = await listEventsByDate(date);
        setTasks(response.events);
        setError("");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate],
  );

  useEffect(() => {
    refresh().catch((err: ApiError) => {
      setError(err.message);
      setTasks([]);
    });
  }, [refresh]);

  const heading = useMemo(() => `Tasks for ${selectedDate}`, [selectedDate]);

  return (
    <main>
      <h1>SpeciaelFamily Calendar</h1>
      <DayNavigator selectedDate={selectedDate} onChange={setSelectedDate} />
      <h2>{heading}</h2>
      {error ? <p>{error}</p> : null}
      {isLoading ? <p>Loading events...</p> : null}
      <TaskForm
        selectedDate={selectedDate}
        editingTask={editingTask}
        onSubmit={async (input) => {
          try {
            if (editingTask) {
              await updateEvent(editingTask.id, input);
              setEditingTask(null);
            } else {
              await createEvent(input);
            }
            await refresh(selectedDate);
          } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message);
            await refresh(selectedDate);
          }
        }}
      />
      {!isLoading && tasks.length === 0 ? <TaskListEmptyState /> : null}
      {!isLoading && tasks.length > 0 ? (
        <TaskList
          tasks={tasks}
          onEdit={(task) => setEditingTask(task)}
          onDelete={async (taskId) => {
            try {
              await deleteEvent(taskId);
              await refresh(selectedDate);
            } catch (err) {
              const apiError = err as ApiError;
              setError(apiError.message);
              await refresh(selectedDate);
            }
          }}
        />
      ) : null}
    </main>
  );
}
