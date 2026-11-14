import uuid

from django.db import models


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    event_date = models.DateField()
    is_all_day = models.BooleanField(default=False)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(max_length=2000, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["event_date"], name="idx_event_event_date"),
        ]
        constraints = [
            models.CheckConstraint(
                name="chk_event_all_day_or_timed",
                condition=(
                    models.Q(
                        ("end_time__isnull", True),
                        ("is_all_day", True),
                        ("start_time__isnull", True),
                    )
                    | (
                        models.Q(
                            ("end_time__isnull", False),
                            ("is_all_day", False),
                            ("start_time__isnull", False),
                        )
                        & models.Q(end_time__gt=models.F("start_time"))
                    )
                ),
            )
        ]

    def save(self, *args, **kwargs):
        self.title = self.title.strip()
        if self.is_all_day:
            self.start_time = None
            self.end_time = None
        super().save(*args, **kwargs)
