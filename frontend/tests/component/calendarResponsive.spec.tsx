/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarPage } from "../../src/pages/CalendarPage";

const { mockListEventsByDate, mockListEventsByRange, mockCreateEvent, mockUpdateEvent, mockDeleteEvent } = vi.hoisted(() => ({
  mockListEventsByDate: vi.fn(),
  mockListEventsByRange: vi.fn(),
  mockCreateEvent: vi.fn(),
  mockUpdateEvent: vi.fn(),
  mockDeleteEvent: vi.fn(),
}));

vi.mock("../../src/services/tasksService", () => ({
  listEventsByDate: mockListEventsByDate,
  listEventsByRange: mockListEventsByRange,
  createEvent: mockCreateEvent,
  updateEvent: mockUpdateEvent,
  deleteEvent: mockDeleteEvent,
}));

mockListEventsByRange.mockResolvedValue({
  start_date: "2026-11-10",
  end_date: "2026-11-16",
  days: [{ date: "2026-11-14", events: [] }],
});

afterEach(() => {
  cleanup();
});

describe("calendar responsive behavior", () => {
  it("keeps primary controls available on narrow screens", async () => {
    mockListEventsByDate.mockResolvedValue({ date: "2026-11-14", events: [] });
    window.innerWidth = 360;

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Previous day" })).toBeTruthy();
    });

    expect(screen.getByLabelText("calendar-page").className.includes("playful-theme")).toBe(true);
    expect(screen.getByRole("button", { name: "Next day" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
  });

  it("renders themed surfaces while switching week month and day views", async () => {
    mockListEventsByDate.mockResolvedValue({ date: "2026-11-14", events: [] });
    window.innerWidth = 360;

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    expect(screen.getByRole("region", { name: "week-view" }).className.includes("motif-week")).toBe(true);
    expect(screen.getAllByRole("button", { name: /add-event-/ }).length).toBeGreaterThan(0);

    const monthButton = screen.getByRole("button", { name: "month-view-button" });
    monthButton.click();
    await waitFor(() => {
      expect(screen.getByRole("region", { name: "month-view" })).toBeTruthy();
    });

    expect(screen.getByRole("region", { name: "month-view" }).className.includes("motif-month")).toBe(true);

    const firstDaySelect = screen.getAllByRole("button", { name: /select-day-/ })[0];
    firstDaySelect.click();
    await waitFor(() => {
      expect(screen.getByRole("region", { name: "day-view" })).toBeTruthy();
    });

    const dayView = screen.getByRole("region", { name: "day-view" });
    expect(dayView.className.includes("motif-day")).toBe(true);
    expect(screen.getAllByRole("button", { name: /add-event-/ }).length).toBeGreaterThan(0);
  });

  it("renders event list controls at desktop width", async () => {
    mockListEventsByDate.mockResolvedValue({
      date: "2026-11-14",
      events: [
        {
          id: "9a413ed7-7645-41cd-b8aa-0b7e54b742a2",
          title: "Desktop event",
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
    window.innerWidth = 1280;

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByText("Desktop event")).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: "edit-9a413ed7-7645-41cd-b8aa-0b7e54b742a2" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "delete-9a413ed7-7645-41cd-b8aa-0b7e54b742a2" })).toBeTruthy();
  });
});
