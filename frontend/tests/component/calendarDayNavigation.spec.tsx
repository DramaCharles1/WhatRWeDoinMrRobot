/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DayNavigator } from "../../src/components/DayNavigator";
import { TaskListEmptyState } from "../../src/components/TaskListEmptyState";

describe("calendar day navigation", () => {
  it("changes selected day with previous/next controls and date input", () => {
    const onChange = vi.fn();
    render(<DayNavigator selectedDate="2026-11-14" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    fireEvent.change(screen.getByLabelText("selected-day"), {
      target: { value: "2026-11-20" },
    });

    expect(onChange).toHaveBeenNthCalledWith(1, "2026-11-13");
    expect(onChange).toHaveBeenNthCalledWith(2, "2026-11-15");
    expect(onChange).toHaveBeenNthCalledWith(3, "2026-11-20");
  });

  it("shows explicit empty-state copy when no events exist for selected day", () => {
    render(<TaskListEmptyState />);

    expect(screen.getByText("No events scheduled for this day.")).toBeTruthy();
  });
});
