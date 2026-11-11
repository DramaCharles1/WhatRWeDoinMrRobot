from django.db import IntegrityError
from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=200,
        allow_blank=False,
        trim_whitespace=True,
        error_messages={"blank": "Title is required."},
    )
    creator_name = serializers.CharField(max_length=100, allow_blank=False, trim_whitespace=True)
    notes = serializers.CharField(max_length=2000, required=False, allow_blank=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "task_date",
            "creator_name",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Title is required.")
        return trimmed

    def validate_creator_name(self, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Creator name must be present for create operations.")
        return trimmed

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError({"title": ["(task_date, title) must be unique."]}) from exc
