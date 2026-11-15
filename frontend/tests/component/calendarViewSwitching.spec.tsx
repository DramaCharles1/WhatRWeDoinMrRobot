/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  mockListEventsByRange.mockResolvedValue({
    start_date: today,
    end_date: today,
    days: [
      { date: today, events: [] },
    ],
  });
});

afterEach(() => {
  cleanup();
});

describe("calendar view switching", () => {
  it("defaults to week mode on initial load", async () => {
    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    expect(screen.getByRole("button", { name: "week-view-button" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("switches week -> month and keeps selected date in rendered range", async () => {
    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "month-view-button" }));

    await waitFor(() => {
      expect(screen.getByLabelText("month-view")).toBeTruthy();
    });

    expect(screen.getByLabelText("selected-day")).toBeTruthy();
  });

  it("switches week -> day and renders selected day context", async () => {
    render(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "week-view" })).toBeTruthy();
    });

    fireEvent.click(screen.getAllByRole("button", { name: /select-day-/ })[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("day-view")).toBeTruthy();
    });

    const selectedDay = (screen.getByLabelText("selected-day") as HTMLInputElement).value;
    expect(screen.getByLabelText("day-view").textContent).toContain(`Day view for ${selectedDay}`);
    expect(screen.getByRole("button", { name: "day-view-button" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });
});
