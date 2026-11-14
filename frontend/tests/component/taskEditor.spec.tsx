/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarPage } from "../../src/pages/CalendarPage";
import { TaskForm } from "../../src/components/TaskForm";
import type { EventDto } from "../../src/types/api";

const { mockListEventsByDate, mockCreateEvent, mockUpdateEvent, mockDeleteEvent } = vi.hoisted(() => ({
  mockListEventsByDate: vi.fn(),
  mockCreateEvent: vi.fn(),
  mockUpdateEvent: vi.fn(),
  mockDeleteEvent: vi.fn(),
}));

vi.mock("../../src/services/tasksService", () => ({
  listEventsByDate: mockListEventsByDate,
  createEvent: mockCreateEvent,
  updateEvent: mockUpdateEvent,
  deleteEvent: mockDeleteEvent,
}));

afterEach(() => {
  cleanup();
});

describe("task editor", () => {
  it("submits all-day and timed create/edit payloads", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const editing: EventDto = {
      id: "c4dfbe63-e8f6-4e1f-b93b-7f638cb5b603",
      title: "Existing",
      event_date: "2026-11-14",
      is_all_day: false,
      start_time: "09:00",
      end_time: "10:00",
      notes: "old",
      created_at: "2026-11-14T09:00:00Z",
      updated_at: "2026-11-14T09:00:00Z",
    };

    const { rerender } = render(
      <TaskForm selectedDate="2026-11-14" onSubmit={onSubmit} editingTask={null} />,
    );

    fireEvent.change(screen.getByLabelText("title"), { target: { value: "Create all day" } });
    fireEvent.change(screen.getByLabelText("notes"), { target: { value: "note" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenNthCalledWith(1, {
        title: "Create all day",
        event_date: "2026-11-14",
        is_all_day: true,
        start_time: null,
        end_time: null,
        notes: "note",
      });
    });

    rerender(<TaskForm selectedDate="2026-11-14" onSubmit={onSubmit} editingTask={editing} />);

    fireEvent.change(screen.getByLabelText("title"), { target: { value: "Edited timed" } });
    const allDayToggle = screen.getByLabelText("is-all-day") as HTMLInputElement;
    if (allDayToggle.checked) {
      fireEvent.click(allDayToggle);
    }
    await waitFor(() => {
      expect(screen.getByLabelText("start-time")).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText("start-time"), { target: { value: "11:00" } });
    fireEvent.change(screen.getByLabelText("end-time"), { target: { value: "12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenNthCalledWith(2, {
        title: "Edited timed",
        event_date: "2026-11-14",
        is_all_day: false,
        start_time: "11:00",
        end_time: "12:00",
        notes: "old",
      });
    });
  });

  it("renders exact validation messages for empty title and invalid timed range", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm selectedDate="2026-11-14" onSubmit={onSubmit} editingTask={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(screen.getByText("Title is required.")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("title"), { target: { value: "Bad range" } });
    fireEvent.click(screen.getByLabelText("is-all-day"));
    fireEvent.change(screen.getByLabelText("start-time"), { target: { value: "14:00" } });
    fireEvent.change(screen.getByLabelText("end-time"), { target: { value: "13:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("End time must be later than start time.")).toBeTruthy();
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("shows operation-specific delete error message when delete fails", async () => {
    mockListEventsByDate.mockResolvedValue({
      date: "2026-11-14",
      events: [
        {
          id: "a5c76da3-2729-4bc0-84b3-b9f2737e42dd",
          title: "To delete",
          event_date: "2026-11-14",
          is_all_day: true,
          start_time: null,
          end_time: null,
          notes: "",
          created_at: "2026-11-14T09:00:00Z",
          updated_at: "2026-11-14T09:00:00Z",
        },
      ],
    });
    mockDeleteEvent.mockRejectedValue({
      code: "not_found",
      message: "Delete failed: Event not found.",
    });

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByText("To delete")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "delete-a5c76da3-2729-4bc0-84b3-b9f2737e42dd" }));

    await waitFor(() => {
      expect(screen.getByText("Delete failed: Event not found.")).toBeTruthy();
    });
  });
});
