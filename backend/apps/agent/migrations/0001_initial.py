import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="AgentSession",
            fields=[
                (
                    "session_id",
                    models.UUIDField(
                        primary_key=True,
                        default=uuid.uuid4,
                        editable=False,
                        serialize=False,
                    ),
                ),
                ("started_at", models.DateTimeField(auto_now_add=True)),
                (
                    "status",
                    models.CharField(
                        max_length=16,
                        choices=[
                            ("active", "Active"),
                            ("unavailable", "Unavailable"),
                            ("closed", "Closed"),
                        ],
                        default="active",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="AgentQuery",
            fields=[
                (
                    "query_id",
                    models.UUIDField(
                        primary_key=True,
                        default=uuid.uuid4,
                        editable=False,
                        serialize=False,
                    ),
                ),
                ("question_text", models.TextField()),
                ("effective_date_context", models.DateField(blank=True, null=True)),
                ("response_text", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "status",
                    models.CharField(
                        max_length=32,
                        choices=[
                            ("answered", "Answered"),
                            ("clarification_required", "Clarification Required"),
                            ("error", "Error"),
                        ],
                    ),
                ),
                ("error_message", models.TextField(blank=True, default="")),
                (
                    "session",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="queries",
                        to="agent.agentsession",
                    ),
                ),
            ],
        ),
    ]
