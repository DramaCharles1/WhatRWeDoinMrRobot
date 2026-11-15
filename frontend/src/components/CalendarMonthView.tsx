import type { DayEventBucket } from "../services/calendarBuckets";
import type { EventDto } from "../types/api";

type Props = {
  buckets: DayEventBucket[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAddEvent: (date: string) => void;
  onOpenEvent: (event: EventDto) => void;
};

export function CalendarMonthView({ buckets, selectedDate, onSelectDate, onAddEvent, onOpenEvent }: Props) {
  return (
    <section aria-label="month-view" className="calendar-grid month-grid">
      {buckets.map((bucket) => (
        <article key={bucket.date} className="calendar-cell">
          <button
            className="focus-ring day-select"
            type="button"
            aria-current={bucket.date === selectedDate ? "date" : undefined}
            aria-label={`select-day-${bucket.date}`}
            onClick={() => onSelectDate(bucket.date)}
          >
            {bucket.date}
          </button>
          <ul>
            {bucket.events.slice(0, bucket.visibleCount).map((event) => (
              <li key={event.id}>
                <button type="button" className="focus-ring event-pill" onClick={() => onOpenEvent(event)}>
                  {event.title}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="focus-ring"
            aria-label={`add-event-${bucket.date}`}
            onClick={() => onAddEvent(bucket.date)}
          >
            Add event
          </button>
          {bucket.overflowCount > 0 ? <p>{bucket.overflowCount} more</p> : null}
        </article>
      ))}
    </section>
  );
}
