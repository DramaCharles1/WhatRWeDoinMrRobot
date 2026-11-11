import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        primary_key=True,
                        default=uuid.uuid4,
                        editable=False,
                        serialize=False,
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("task_date", models.DateField()),
                ("creator_name", models.CharField(max_length=100)),
                ("notes", models.TextField(max_length=2000, blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "indexes": [
                    models.Index(fields=["task_date"], name="idx_task_task_date"),
                    models.Index(fields=["updated_at"], name="idx_task_updated_at"),
                ],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("task_date", "title"),
                        name="uniq_task_task_date_title",
                    ),
                ],
            },
        ),
    ]
