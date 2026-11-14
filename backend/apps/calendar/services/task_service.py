from __future__ import annotations

from datetime import date

from apps.calendar.models import Event


def list_events_by_date(selected_date: date):
    return Event.objects.filter(event_date=selected_date).order_by("-is_all_day", "start_time", "created_at")


def create_event(payload: dict) -> Event:
    return Event.objects.create(**payload)


def update_event(event_id, updates: dict) -> Event:
    event = Event.objects.get(pk=event_id)
    for key, value in updates.items():
        setattr(event, key, value)
    event.save()
    return event


def delete_event(event_id) -> None:
    event = Event.objects.get(pk=event_id)
    event.delete()
