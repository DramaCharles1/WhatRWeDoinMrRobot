import { useState, type ChangeEvent, type FormEvent } from "react";

import type { EventDto, EventWriteRequest } from "../types/api";

type Props = {
  selectedDate: string;
  onSubmit: (input: EventWriteRequest) => Promise<void>;
  editingTask?: EventDto | null;
};

export function TaskForm({ selectedDate, onSubmit, editingTask }: Props) {
  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [notes, setNotes] = useState(editingTask?.notes ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    await onSubmit({
      title,
      event_date: selectedDate,
      is_all_day: true,
      notes,
    });
    setTitle("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit}>
      {error ? <p>{error}</p> : null}
      <input
        aria-label="title"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="Task title"
      />
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
