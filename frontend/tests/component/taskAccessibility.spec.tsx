/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("task accessibility", () => {
  it("exposes semantic labels and aria wiring for main controls", async () => {
    mockListEventsByDate.mockResolvedValue({ date: "2026-11-14", events: [] });
    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("calendar-page")).toBeTruthy();
    });

    expect(screen.getByLabelText("day-navigation")).toBeTruthy();
    expect(screen.getByText("No events scheduled for this day.")).toBeTruthy();
    expect(screen.getByLabelText("title").id).toBe("event-title");
    expect(screen.getByLabelText("selected-day").id).toBe("selected-day-input");
  });

  it("announces validation errors with alert semantics", async () => {
    mockListEventsByDate.mockResolvedValue({ date: "2026-11-14", events: [] });
    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    const alertNode = screen.getByRole("alert");
    expect(alertNode.textContent).toBe("Title is required.");

    const titleInput = screen.getByLabelText("title");
    expect(titleInput.getAttribute("aria-describedby")).toBe("task-form-error");
  });

  it("keeps key controls keyboard-focusable with visible focus style hooks", async () => {
    mockListEventsByDate.mockResolvedValue({ date: "2026-11-14", events: [] });
    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Previous day" })).toBeTruthy();
    });

    const previousDay = screen.getByRole("button", { name: "Previous day" });
    const nextDay = screen.getByRole("button", { name: "Next day" });
    const createButton = screen.getByRole("button", { name: "Create" });
    const titleInput = screen.getByLabelText("title");

    previousDay.focus();
    expect(document.activeElement).toBe(previousDay);

    expect(previousDay.className.includes("focus-ring")).toBe(true);
    expect(nextDay.className.includes("focus-ring")).toBe(true);
    expect(createButton.className.includes("focus-ring")).toBe(true);
    expect(titleInput.className.includes("focus-ring")).toBe(true);
  });
});
