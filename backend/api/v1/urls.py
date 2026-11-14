from django.urls import path

from apps.calendar.views import EventDetailView, EventListCreateView, HealthView

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("events", EventListCreateView.as_view(), name="events"),
    path("events/<uuid:event_id>", EventDetailView.as_view(), name="event-detail"),
]
