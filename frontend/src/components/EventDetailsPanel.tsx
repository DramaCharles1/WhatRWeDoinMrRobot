import type { EventDto } from "../types/api";

export type EventDetailsMode = "view" | "confirm-delete";

type Props = {
  event: EventDto | null;
  mode: EventDetailsMode;
  onClose: () => void;
  onEdit: (event: EventDto) => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: (eventId: string) => Promise<void>;
};

export function EventDetailsPanel({
  event,
  mode,
  onClose,
  onEdit,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: Props) {
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
      {mode === "confirm-delete" ? (
        <div>
          <p role="status">Are you sure you want to delete this event?</p>
          <div className="event-details-actions">
            <button type="button" className="focus-ring" onClick={() => void onConfirmDelete(event.id)}>
              Confirm delete
            </button>
            <button type="button" className="focus-ring" onClick={onCancelDelete}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="event-details-actions">
          <button type="button" className="focus-ring" onClick={() => onEdit(event)}>
            Edit
          </button>
          <button type="button" className="focus-ring" onClick={onRequestDelete}>
            Delete
          </button>
          <button type="button" className="focus-ring" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </section>
  );
}
