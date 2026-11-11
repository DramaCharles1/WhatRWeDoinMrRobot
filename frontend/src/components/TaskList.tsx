import type { TaskDto } from "../types/api";

type Props = {
  tasks: TaskDto[];
  onEdit: (task: TaskDto) => void;
  onDelete: (taskId: string) => Promise<void>;
};

export function TaskList({ tasks, onEdit, onDelete }: Props) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <strong>{task.title}</strong>
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
