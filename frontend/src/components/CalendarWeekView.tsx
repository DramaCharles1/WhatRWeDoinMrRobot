import type { DayEventBucket } from "../services/calendarBuckets";

type Props = {
  buckets: DayEventBucket[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export function CalendarWeekView({ buckets, selectedDate, onSelectDate }: Props) {
  return (
    <section aria-label="week-view" className="calendar-grid week-grid">
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
              <li key={event.id}>{event.title}</li>
            ))}
          </ul>
          {bucket.overflowCount > 0 ? <p>{bucket.overflowCount} more</p> : null}
        </article>
      ))}
    </section>
  );
}
