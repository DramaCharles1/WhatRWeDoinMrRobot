import uuid

from django.db import models


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    task_date = models.DateField()
    creator_name = models.CharField(max_length=100)
    notes = models.TextField(max_length=2000, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["task_date", "title"],
                name="uniq_task_task_date_title",
            )
        ]
        indexes = [
            models.Index(fields=["task_date"], name="idx_task_task_date"),
            models.Index(fields=["updated_at"], name="idx_task_updated_at"),
        ]

    def save(self, *args, **kwargs):
        self.title = self.title.strip()
        self.creator_name = self.creator_name.strip()
        super().save(*args, **kwargs)
