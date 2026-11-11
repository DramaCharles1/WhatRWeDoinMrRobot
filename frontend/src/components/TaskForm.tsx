import { useState, type ChangeEvent, type FormEvent } from "react";

import type { TaskDto } from "../types/api";
import type { TaskInput } from "../services/tasksService";

type Props = {
  selectedDate: string;
  onSubmit: (input: TaskInput) => Promise<void>;
  editingTask?: TaskDto | null;
};

export function TaskForm({ selectedDate, onSubmit, editingTask }: Props) {
  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [creatorName, setCreatorName] = useState(editingTask?.creator_name ?? "");
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
      task_date: selectedDate,
      creator_name: creatorName,
      notes,
    });
    setTitle("");
    setCreatorName("");
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
      <input
        aria-label="creator_name"
        value={creatorName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCreatorName(e.target.value)}
        placeholder="Creator"
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
