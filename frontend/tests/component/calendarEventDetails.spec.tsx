/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

beforeEach(() => {
  const today = new Date().toISOString().slice(0, 10);
  mockListEventsByDate.mockResolvedValue({ date: today, events: [] });
  mockListEventsByRange.mockResolvedValue({ start_date: today, end_date: today, days: [{ date: today, events: [] }] });
  mockCreateEvent.mockResolvedValue(undefined);
  mockUpdateEvent.mockResolvedValue(undefined);
  mockDeleteEvent.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("calendar event details interactions", () => {
  it("opens details in view mode from calendar event selection", async () => {
    const today = new Date().toISOString().slice(0, 10);
    mockListEventsByDate.mockResolvedValue({
      date: today,
      events: [{
        id: "evt-1",
        title: "Morning run",
        event_date: today,
        is_all_day: false,
        start_time: "09:00",
        end_time: "10:00",
        notes: "Nice and easy",
        created_at: `${today}T09:00:00Z`,
        updated_at: `${today}T09:00:00Z`,
      }],
    });

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "view-event-evt-1" }));

    await waitFor(() => {
      expect(screen.getByLabelText("event-details-panel")).toBeTruthy();
    });

    const detailsPanel = screen.getByLabelText("event-details-panel");
    expect(within(detailsPanel).getByText("Morning run")).toBeTruthy();
    expect(within(detailsPanel).getByText("Nice and easy")).toBeTruthy();
  });

  it("supports edit/save state transitions with refreshed event output", async () => {
    const today = new Date().toISOString().slice(0, 10);
    mockListEventsByDate.mockResolvedValue({
      date: today,
      events: [{
        id: "evt-2",
        title: "Pickup",
        event_date: today,
        is_all_day: true,
        start_time: null,
        end_time: null,
        notes: "Original note",
        created_at: `${today}T09:00:00Z`,
        updated_at: `${today}T09:00:00Z`,
      }],
    });

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "view-event-evt-2" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByLabelText("title");
    fireEvent.change(titleInput, { target: { value: "Updated pickup" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith("evt-2", expect.objectContaining({ title: "Updated pickup" }));
    });
  });

  it("supports delete confirmation and closes detail context after delete", async () => {
    const today = new Date().toISOString().slice(0, 10);
    mockListEventsByDate.mockResolvedValue({
      date: today,
      events: [{
        id: "evt-3",
        title: "Delete me",
        event_date: today,
        is_all_day: true,
        start_time: null,
        end_time: null,
        notes: "",
        created_at: `${today}T09:00:00Z`,
        updated_at: `${today}T09:00:00Z`,
      }],
    });

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "view-event-evt-3" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockDeleteEvent).toHaveBeenCalledWith("evt-3");
    });
    expect(screen.queryByLabelText("event-details-panel")).toBeNull();
  });
});
