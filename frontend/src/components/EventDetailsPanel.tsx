import type { EventDto } from "../types/api";

type Props = {
  event: EventDto | null;
  onClose: () => void;
  onEdit: (event: EventDto) => void;
  onDelete: (eventId: string) => Promise<void>;
};

export function EventDetailsPanel({ event, onClose, onEdit, onDelete }: Props) {
  if (!event) {
    return null;
  }

  return (
    <section aria-label="event-details-panel" className="event-details-panel">
      <h3>{event.title}</h3>
      <p>
        {event.event_date} · {event.is_all_day ? "All day" : `${event.start_time ?? ""} - ${event.end_time ?? ""}`}
      </p>
      {event.notes ? <p>{event.notes}</p> : <p>No notes.</p>}
      <div className="event-details-actions">
        <button type="button" className="focus-ring" onClick={() => onEdit(event)}>
          Edit
        </button>
        <button type="button" className="focus-ring" onClick={() => void onDelete(event.id)}>
          Delete
        </button>
        <button type="button" className="focus-ring" onClick={onClose}>
          Close
        </button>
      </div>
    </section>
  );
}
