import pytest
from django.db import IntegrityError, connection

from apps.calendar.models import Event


@pytest.mark.django_db
def test_task_table_removed_after_event_schema_migration() -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT to_regclass('public.calendar_task')")
        row = cursor.fetchone()
    assert row is not None
    assert row[0] is None


@pytest.mark.django_db
def test_duplicate_titles_on_same_day_are_allowed() -> None:
    Event.objects.create(
        title="Groceries",
        event_date="2026-11-14",
        is_all_day=True,
        start_time=None,
        end_time=None,
        notes="",
    )
    Event.objects.create(
        title="Groceries",
        event_date="2026-11-14",
        is_all_day=True,
        start_time=None,
        end_time=None,
        notes="second",
    )
    assert Event.objects.filter(title="Groceries", event_date="2026-11-14").count() == 2


@pytest.mark.django_db
def test_db_check_rejects_timed_event_with_end_not_after_start() -> None:
    with pytest.raises(IntegrityError):
        Event.objects.create(
            title="Bad timing",
            event_date="2026-11-14",
            is_all_day=False,
            start_time="12:00",
            end_time="11:00",
            notes="",
        )
