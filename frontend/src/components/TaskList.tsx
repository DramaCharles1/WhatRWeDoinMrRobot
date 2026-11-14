import type { EventDto } from "../types/api";

type Props = {
  tasks: EventDto[];
  onEdit: (task: EventDto) => void;
  onDelete: (taskId: string) => Promise<void>;
};

export function TaskList({ tasks, onEdit, onDelete }: Props) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <strong>{task.title}</strong>
          <p>
            {task.is_all_day ? "All day" : `${task.start_time ?? ""} - ${task.end_time ?? ""}`}
          </p>
          <button onClick={() => onEdit(task)} type="button">
            Edit
          </button>
          <button onClick={() => onDelete(task.id)} type="button">
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
