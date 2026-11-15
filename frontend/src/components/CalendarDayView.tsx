import { TaskListEmptyState } from "./TaskListEmptyState";
import type { EventDto } from "../types/api";

type Props = {
  selectedDate: string;
  events: EventDto[];
  onAddEvent: () => void;
  onOpenEvent: (event: EventDto) => void;
};

export function CalendarDayView({ selectedDate, events, onAddEvent, onOpenEvent }: Props) {
  return (
    <section aria-label="day-view">
      <h3>Day view for {selectedDate}</h3>
      {events.length === 0 ? (
        <TaskListEmptyState onAddEvent={onAddEvent} />
      ) : (
        <ul aria-label="day-view-events">
          {events.map((event) => (
            <li key={event.id}>
              <button type="button" className="focus-ring event-pill" onClick={() => onOpenEvent(event)}>
                {event.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
