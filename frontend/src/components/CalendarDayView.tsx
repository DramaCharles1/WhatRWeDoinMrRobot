import { TaskListEmptyState } from "./TaskListEmptyState";
import type { EventDto } from "../types/api";

type Props = {
  selectedDate: string;
  events: EventDto[];
  onAddEvent: () => void;
};

export function CalendarDayView({ selectedDate, events, onAddEvent }: Props) {
  return (
    <section aria-label="day-view">
      <h3>Day view for {selectedDate}</h3>
      {events.length === 0 ? (
        <TaskListEmptyState onAddEvent={onAddEvent} />
      ) : (
        <ul aria-label="day-view-events">
          {events.map((event) => (
            <li key={event.id}>{event.title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
