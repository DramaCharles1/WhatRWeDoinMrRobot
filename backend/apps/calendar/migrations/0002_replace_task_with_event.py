# Generated manually for feature 001-calendar-task-agent

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("calendar", "0001_initial"),
    ]

    operations = [
        migrations.DeleteModel(
            name="Task",
        ),
        migrations.CreateModel(
            name="Event",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("event_date", models.DateField()),
                ("is_all_day", models.BooleanField(default=False)),
                ("start_time", models.TimeField(blank=True, null=True)),
                ("end_time", models.TimeField(blank=True, null=True)),
                ("notes", models.TextField(blank=True, default="", max_length=2000)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "indexes": [models.Index(fields=["event_date"], name="idx_event_event_date")],
                "constraints": [
                    models.CheckConstraint(
                        condition=(
                            (
                                models.Q(
                                    ("end_time__isnull", True),
                                    ("is_all_day", True),
                                    ("start_time__isnull", True),
                                )
                            )
                            | (
                                models.Q(
                                    ("end_time__isnull", False),
                                    ("is_all_day", False),
                                    ("start_time__isnull", False),
                                )
                                & models.Q(("end_time__gt", models.F("start_time")))
                            )
                        ),
                        name="chk_event_all_day_or_timed",
                    )
                ],
            },
        ),
    ]
