import { useCallback, useEffect, useMemo, useState } from "react";
import "./CalendarPage.css";

import { CalendarDayView } from "../components/CalendarDayView";
import { CalendarMonthView } from "../components/CalendarMonthView";
import { CalendarViewSwitcher } from "../components/CalendarViewSwitcher";
import { CalendarWeekView } from "../components/CalendarWeekView";
import { DayNavigator } from "../components/DayNavigator";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { TaskListEmptyState } from "../components/TaskListEmptyState";
import { EventDetailsPanel } from "../components/EventDetailsPanel";
import { buildDayBuckets, type DayEventBucket } from "../services/calendarBuckets";
import { getRangeForView, type CalendarViewMode } from "../services/calendarDateRanges";
import {
  createEvent,
  deleteEvent,
  listEventsByDate,
  listEventsByRange,
  updateEvent,
} from "../services/tasksService";
import type { ApiError, EventDto } from "../types/api";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CalendarPage() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(todayIso());
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [dayBuckets, setDayBuckets] = useState<DayEventBucket[]>([]);
  const [tasks, setTasks] = useState<EventDto[]>([]);
  const [editingTask, setEditingTask] = useState<EventDto | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const visibleRange = useMemo(() => getRangeForView(viewMode, anchorDate), [viewMode, anchorDate]);

  const loadCalendarData = useCallback(
    async (
      date = selectedDate,
      rangeStart = visibleRange.startDate,
      rangeEnd = visibleRange.endDate,
      mode: CalendarViewMode = viewMode,
      clearError = true,
    ) => {
      setIsLoading(true);
      try {
        const [dayResponse, rangeResponse] = await Promise.all([
          listEventsByDate(date),
          listEventsByRange(rangeStart, rangeEnd),
        ]);
        setTasks(dayResponse.events);
        setDayBuckets(
          buildDayBuckets({
            startDate: rangeResponse.start_date,
            endDate: rangeResponse.end_date,
            days: rangeResponse.days,
            viewMode: mode,
          }),
        );
        if (clearError) {
          setError("");
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        setTasks([]);
        setDayBuckets([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate, visibleRange.startDate, visibleRange.endDate, viewMode],
  );

  useEffect(() => {
    loadCalendarData().catch(() => undefined);
  }, [loadCalendarData]);

  useEffect(() => {
    // Keep selection constraints explicit: day mode uses a single-day range, week/month must contain selected day.
    if (viewMode === "day") {
      if (anchorDate !== selectedDate) {
        setAnchorDate(selectedDate);
      }
      return;
    }

    if (selectedDate < visibleRange.startDate || selectedDate > visibleRange.endDate) {
      setAnchorDate(selectedDate);
    }
  }, [viewMode, selectedDate, anchorDate, visibleRange.startDate, visibleRange.endDate]);

  const heading = useMemo(() => `Tasks for ${selectedDate}`, [selectedDate]);

  const handleAddEvent = useCallback(() => {
    setEditingTask(null);
    const titleInput = document.getElementById("event-title") as HTMLInputElement | null;
    titleInput?.focus();
  }, []);

  const handleViewModeChange = useCallback(
    (nextViewMode: CalendarViewMode) => {
      setViewMode(nextViewMode);
      if (nextViewMode === "day") {
        setAnchorDate(selectedDate);
      }
    },
    [selectedDate],
  );

  const handleNavigatorChange = useCallback(
    (nextDate: string) => {
      setSelectedDate(nextDate);
      if (viewMode === "day") {
        setAnchorDate(nextDate);
        return;
      }

      if (nextDate < visibleRange.startDate || nextDate > visibleRange.endDate) {
        setAnchorDate(nextDate);
      }
    },
    [viewMode, visibleRange.startDate, visibleRange.endDate],
  );

  const openDayForDate = useCallback((date: string) => {
    setSelectedDate(date);
    setAnchorDate(date);
    setViewMode("day");
  }, []);

  const handleOpenDetails = useCallback((task: EventDto) => {
    setSelectedEvent(task);
  }, []);

  const handleEditFromDetails = useCallback((task: EventDto) => {
    setSelectedEvent(null);
    setEditingTask(task);
  }, []);

  const handleDeleteFromDetails = useCallback(
    async (taskId: string) => {
      try {
        await deleteEvent(taskId);
        setSelectedEvent(null);
        await loadCalendarData();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        await loadCalendarData(selectedDate, visibleRange.startDate, visibleRange.endDate, viewMode, false);
      }
    },
    [loadCalendarData, selectedDate, visibleRange.startDate, visibleRange.endDate, viewMode],
  );

  const handleEditTask = useCallback((task: EventDto) => {
    setSelectedEvent(null);
    setEditingTask(task);
  }, []);

  return (
    <main className="calendar-page" aria-label="calendar-page">
      <h1>SpeciaelFamily Calendar</h1>
      <CalendarViewSwitcher viewMode={viewMode} onChange={handleViewModeChange} />
      <DayNavigator selectedDate={selectedDate} onChange={handleNavigatorChange} />
      <h2>{heading}</h2>
      {error ? <p>{error}</p> : null}
      {isLoading ? <p>Loading events...</p> : null}
      {!isLoading && viewMode === "week" ? (
        <CalendarWeekView
          buckets={dayBuckets}
          selectedDate={selectedDate}
          onSelectDate={openDayForDate}
          onOpenEvent={handleOpenDetails}
        />
      ) : null}
      {!isLoading && viewMode === "month" ? (
        <CalendarMonthView
          buckets={dayBuckets}
          selectedDate={selectedDate}
          onSelectDate={openDayForDate}
          onOpenEvent={handleOpenDetails}
        />
      ) : null}
      {!isLoading && viewMode === "day" ? (
        <CalendarDayView
          selectedDate={selectedDate}
          events={tasks}
          onAddEvent={handleAddEvent}
          onOpenEvent={handleOpenDetails}
        />
      ) : null}
      <TaskForm
        selectedDate={selectedDate}
        editingTask={editingTask}
        onSubmit={async (input) => {
          setError("");
          try {
            if (editingTask) {
              await updateEvent(editingTask.id, input);
              setEditingTask(null);
            } else {
              await createEvent(input);
            }
            await loadCalendarData();
          } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message);
            await loadCalendarData(selectedDate, visibleRange.startDate, visibleRange.endDate, viewMode, false);
          }
        }}
      />
      {!isLoading && tasks.length === 0 ? <TaskListEmptyState onAddEvent={handleAddEvent} /> : null}
      {!isLoading && tasks.length > 0 ? (
        <TaskList
          tasks={tasks}
          onEdit={handleEditTask}
          onOpenDetails={handleOpenDetails}
          onDelete={async (taskId) => {
            try {
              await deleteEvent(taskId);
              await loadCalendarData();
            } catch (err) {
              const apiError = err as ApiError;
              setError(apiError.message);
              await loadCalendarData(selectedDate, visibleRange.startDate, visibleRange.endDate, viewMode, false);
            }
          }}
        />
      ) : null}
      <EventDetailsPanel
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />
    </main>
  );
}
