from __future__ import annotations

from datetime import date

from django.db.models import Case, F, IntegerField, Value, When

from apps.calendar.models import Event


class DeleteEventError(Exception):
    pass


def list_events_by_date(selected_date: date):
    return (
        Event.objects.filter(event_date=selected_date)
        .annotate(
            day_bucket=Case(
                When(is_all_day=True, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            )
        )
        .order_by("day_bucket", "start_time", "created_at", F("id").asc())
    )


def create_event(payload: dict) -> Event:
    return Event.objects.create(**payload)


def update_event(event_id, updates: dict) -> Event:
    event = Event.objects.get(pk=event_id)
    for key, value in updates.items():
        setattr(event, key, value)
    event.save()
    return event


def delete_event(event_id) -> None:
    deleted, _ = Event.objects.filter(pk=event_id).delete()
    if deleted == 0:
        raise DeleteEventError("Delete failed: Event not found.")
