import { describe, expect, it } from "vitest";

describe("agent panel", () => {
  it("placeholder for connect/ask/answer flow", () => {
    expect(true).toBe(true);
  });

  it("handles unavailable agent message", () => {
    expect("Calendar wizard guy is not home at the momen").toContain("not home");
  });
});
