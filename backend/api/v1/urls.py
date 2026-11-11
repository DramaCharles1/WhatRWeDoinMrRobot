from django.urls import path

from apps.agent.views import AgentQueryView, AgentSessionView
from apps.calendar.views import TaskDetailView, TaskListCreateView

urlpatterns = [
	path("tasks", TaskListCreateView.as_view(), name="tasks"),
	path("tasks/<uuid:task_id>", TaskDetailView.as_view(), name="task-detail"),
	path("agent/session", AgentSessionView.as_view(), name="agent-session"),
	path("agent/query", AgentQueryView.as_view(), name="agent-query"),
]
