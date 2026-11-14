from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "event_date",
            "is_all_day",
            "start_time",
            "end_time",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EventWriteSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=200,
        allow_blank=False,
        trim_whitespace=True,
        error_messages={"blank": "Title is required."},
    )
    event_date = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d"])
    is_all_day = serializers.BooleanField(required=True)
    start_time = serializers.TimeField(
        format="%H:%M", input_formats=["%H:%M"], required=False, allow_null=True
    )
    end_time = serializers.TimeField(
        format="%H:%M", input_formats=["%H:%M"], required=False, allow_null=True
    )
    notes = serializers.CharField(max_length=2000, required=False, allow_blank=True)

    class Meta:
        model = Event
        fields = ["title", "event_date", "is_all_day", "start_time", "end_time", "notes"]

    def validate_title(self, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Title is required.")
        return trimmed

    def validate(self, attrs):
        is_all_day = attrs.get("is_all_day", False)
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if is_all_day:
            attrs["start_time"] = None
            attrs["end_time"] = None
            return attrs

        if start_time is None or end_time is None:
            raise serializers.ValidationError(
                {
                    "end_time": ["End time must be later than start time."],
                }
            )

        if end_time <= start_time:
            raise serializers.ValidationError(
                {
                    "end_time": ["End time must be later than start time."],
                }
            )

        return attrs


class EventUpdateSerializer(EventWriteSerializer):
    class Meta(EventWriteSerializer.Meta):
        pass

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("partial", True)
        super().__init__(*args, **kwargs)

    def validate(self, attrs):
        # Apply the same validation contract as create using merged values.
        instance = self.instance
        merged = {
            "title": attrs.get("title", getattr(instance, "title", "")),
            "event_date": attrs.get("event_date", getattr(instance, "event_date", None)),
            "is_all_day": attrs.get("is_all_day", getattr(instance, "is_all_day", False)),
            "start_time": attrs.get("start_time", getattr(instance, "start_time", None)),
            "end_time": attrs.get("end_time", getattr(instance, "end_time", None)),
            "notes": attrs.get("notes", getattr(instance, "notes", "")),
        }
        validated = super().validate(merged)
        attrs["is_all_day"] = validated["is_all_day"]
        attrs["start_time"] = validated["start_time"]
        attrs["end_time"] = validated["end_time"]
        return attrs
