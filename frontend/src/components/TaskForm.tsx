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
    <form onSubmit={handleSubmit}>
      {error ? <p>{error}</p> : null}
      <input
        aria-label="title"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="Event title"
      />
      <label>
        <input
          aria-label="is-all-day"
          type="checkbox"
          checked={isAllDay}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setIsAllDay(e.target.checked)}
        />
        All day
      </label>
      {!isAllDay ? (
        <>
          <input
            aria-label="start-time"
            type="time"
            value={startTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
          />
          <input
            aria-label="end-time"
            type="time"
            value={endTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
          />
        </>
      ) : null}
      <textarea
        aria-label="notes"
        value={notes}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
        placeholder="Notes"
      />
      <button type="submit">{editingTask ? "Save" : "Create"}</button>
    </form>
  );
}
