/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarPage } from "../../src/pages/CalendarPage";

const { mockListEventsByDate, mockListEventsByRange, mockCreateEvent, mockUpdateEvent, mockDeleteEvent } =
  vi.hoisted(() => ({
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

afterEach(() => {
  cleanup();
});

describe("calendar day view rendering", () => {
  it("renders full selected-day event list with no hidden overflow", async () => {
    const today = new Date().toISOString().slice(0, 10);
    mockListEventsByDate.mockResolvedValue({
      date: today,
      events: [
        {
          id: "1",
          title: "Morning run",
          event_date: today,
          is_all_day: false,
          start_time: "09:00",
          end_time: "10:00",
          notes: "",
          created_at: `${today}T09:00:00Z`,
          updated_at: `${today}T09:00:00Z`,
        },
        {
          id: "2",
          title: "School pickup",
          event_date: today,
          is_all_day: true,
          start_time: null,
          end_time: null,
          notes: "",
          created_at: `${today}T11:00:00Z`,
          updated_at: `${today}T11:00:00Z`,
        },
      ],
    });
    mockListEventsByRange.mockResolvedValue({
      start_date: today,
      end_date: today,
      days: [
        {
          date: today,
          events: [
            {
              id: "1",
              title: "Morning run",
              event_date: today,
              is_all_day: false,
              start_time: "09:00",
              end_time: "10:00",
              notes: "",
              created_at: `${today}T09:00:00Z`,
              updated_at: `${today}T09:00:00Z`,
            },
            {
              id: "2",
              title: "School pickup",
              event_date: today,
              is_all_day: true,
              start_time: null,
              end_time: null,
              notes: "",
              created_at: `${today}T11:00:00Z`,
              updated_at: `${today}T11:00:00Z`,
            },
          ],
        },
      ],
    });

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    fireEvent.click(screen.getAllByRole("button", { name: /select-day-/ })[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("day-view-events")).toBeTruthy();
    });

    const dayEventsList = screen.getByLabelText("day-view-events");
    expect(within(dayEventsList).getByText("Morning run")).toBeTruthy();
    expect(within(dayEventsList).getByText("School pickup")).toBeTruthy();
    expect(within(dayEventsList).queryByText(/more$/)).toBeNull();
  });

  it("shows explicit empty-day affordance with add-event action", async () => {
    const today = new Date().toISOString().slice(0, 10);
    mockListEventsByDate.mockResolvedValue({ date: today, events: [] });
    mockListEventsByRange.mockResolvedValue({
      start_date: today,
      end_date: today,
      days: [{ date: today, events: [] }],
    });

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    fireEvent.click(screen.getAllByRole("button", { name: /select-day-/ })[0]);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "day-view" })).toBeTruthy();
    });

    const dayViewRegion = screen.getByRole("region", { name: "day-view" });
    expect(within(dayViewRegion).getByText("No events scheduled for this day.")).toBeTruthy();

    const addEventButtons = screen.getAllByRole("button", { name: "Add event" });
    fireEvent.click(addEventButtons[0]);

    expect(document.activeElement?.id).toBe("event-title");
  });
});
