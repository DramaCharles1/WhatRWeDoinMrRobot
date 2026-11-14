import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import type { EventDto, EventWriteRequest } from "../types/api";

type Props = {
  selectedDate: string;
  onSubmit: (input: EventWriteRequest) => Promise<void>;
  editingTask?: EventDto | null;
};

export function TaskForm({ selectedDate, onSubmit, editingTask }: Props) {
  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [isAllDay, setIsAllDay] = useState(editingTask?.is_all_day ?? true);
  const [startTime, setStartTime] = useState(editingTask?.start_time ?? "");
  const [endTime, setEndTime] = useState(editingTask?.end_time ?? "");
  const [notes, setNotes] = useState(editingTask?.notes ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(editingTask?.title ?? "");
    setIsAllDay(editingTask?.is_all_day ?? true);
    setStartTime(editingTask?.start_time ?? "");
    setEndTime(editingTask?.end_time ?? "");
    setNotes(editingTask?.notes ?? "");
    setError("");
  }, [editingTask]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    if (!isAllDay) {
      if (!startTime || !endTime || endTime <= startTime) {
        setError("End time must be later than start time.");
        return;
      }
    }

    setError("");
    await onSubmit({
      title: trimmedTitle,
      event_date: selectedDate,
      is_all_day: isAllDay,
      start_time: isAllDay ? null : startTime,
      end_time: isAllDay ? null : endTime,
      notes,
    });

    if (!editingTask) {
      setTitle("");
      setIsAllDay(true);
      setStartTime("");
      setEndTime("");
      setNotes("");
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error ? (
        <p id="task-form-error" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      <label htmlFor="event-title" className="field-label">
        Title
      </label>
      <input
        id="event-title"
        className="focus-ring"
        aria-label="title"
        aria-describedby={error ? "task-form-error" : undefined}
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="Event title"
      />
      <label>
        <input
          className="focus-ring"
          aria-label="is-all-day"
          type="checkbox"
          checked={isAllDay}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setIsAllDay(e.target.checked)}
        />
        All day
      </label>
      {!isAllDay ? (
        <>
          <label htmlFor="event-start-time" className="field-label">
            Start time
          </label>
          <input
            id="event-start-time"
            className="focus-ring"
            aria-label="start-time"
            aria-describedby={error ? "task-form-error" : undefined}
            type="time"
            value={startTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
          />
          <label htmlFor="event-end-time" className="field-label">
            End time
          </label>
          <input
            id="event-end-time"
            className="focus-ring"
            aria-label="end-time"
            aria-describedby={error ? "task-form-error" : undefined}
            type="time"
            value={endTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
          />
        </>
      ) : null}
      <label htmlFor="event-notes" className="field-label">
        Notes
      </label>
      <textarea
        id="event-notes"
        className="focus-ring"
        aria-label="notes"
        value={notes}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
        placeholder="Notes"
      />
      <button className="focus-ring" type="submit">
        {editingTask ? "Save" : "Create"}
      </button>
    </form>
  );
}
