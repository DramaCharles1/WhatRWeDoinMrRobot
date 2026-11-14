/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarPage } from "../../src/pages/CalendarPage";

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

describe("calendar responsive behavior", () => {
  it("keeps primary controls available on narrow screens", async () => {
    mockListEventsByDate.mockResolvedValue({ date: "2026-11-14", events: [] });
    window.innerWidth = 360;

    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Previous day" })).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: "Next day" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
  });

  it("uses no horizontal overflow on 360px layout container", async () => {
    mockListEventsByDate.mockResolvedValue({ date: "2026-11-14", events: [] });
    window.innerWidth = 360;

    render(<CalendarPage />);

    const root = await screen.findByLabelText("calendar-page");
    expect(root.className.includes("calendar-page")).toBe(true);
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
