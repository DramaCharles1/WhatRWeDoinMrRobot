from dataclasses import dataclass

from apps.calendar.models import Task


@dataclass
class StaleTaskError(Exception):
    message: str = "This task was already removed in another tab."


def list_tasks_by_date(task_date):
    return Task.objects.filter(task_date=task_date).order_by("created_at")


def create_task(payload: dict) -> Task:
    return Task.objects.create(**payload)


def update_task(task_id, updates: dict) -> Task:
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist as exc:
        raise Task.DoesNotExist("Task not found.") from exc

    for key, value in updates.items():
        setattr(task, key, value)
    task.save()
    return task


def delete_task(task_id) -> None:
    deleted, _ = Task.objects.filter(pk=task_id).delete()
    if deleted == 0:
        raise StaleTaskError()
