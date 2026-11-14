import type { EventDto } from "../types/api";

type Props = {
  tasks: EventDto[];
  onEdit: (task: EventDto) => void;
  onDelete: (taskId: string) => Promise<void>;
};

export function TaskList({ tasks, onEdit, onDelete }: Props) {
  return (
    <ul className="event-list" aria-label="event-list">
      {tasks.map((task) => (
        <li key={task.id} className="event-list-item">
          <strong>{task.title}</strong>
          <p>
            {task.is_all_day ? "All day" : `${task.start_time ?? ""} - ${task.end_time ?? ""}`}
          </p>
          <button
            className="focus-ring"
            aria-label={`edit-${task.id}`}
            onClick={() => onEdit(task)}
            type="button"
          >
            Edit
          </button>
          <button
            className="focus-ring"
            aria-label={`delete-${task.id}`}
            onClick={() => onDelete(task.id)}
            type="button"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
