import { test, expect } from "@playwright/test";

test.describe("calendar multi-view journeys", () => {
  test("week to month transition", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
    await expect(page.getByRole("region", { name: "week-view" })).toBeVisible();

    await page.getByRole("button", { name: "month-view-button" }).click();

    await expect(page.getByRole("region", { name: "month-view" })).toBeVisible();
    await expect(page.getByRole("button", { name: "month-view-button" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("week to day transition", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
    await expect(page.getByRole("region", { name: "week-view" })).toBeVisible();

    const dayCell = page.locator('button[aria-label^="select-day-"]').first();
    await dayCell.click();

    await expect(page.getByRole("region", { name: "day-view" })).toBeVisible();
    await expect(page.getByRole("button", { name: "day-view-button" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("create edit delete lifecycle from week view", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
    await expect(page.getByRole("region", { name: "week-view" })).toBeVisible();

    await page.getByLabel("title").fill("E2E Pickup");
    await page.getByLabel("is-all-day").check();
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByText("E2E Pickup").first()).toBeVisible();
    await page.getByRole("button", { name: /view-event-/ }).first().click();
    await page.getByLabel("event-details-panel").getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("title").fill("E2E Pickup Updated");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("E2E Pickup Updated").first()).toBeVisible();
    await page.getByRole("button", { name: /view-event-/ }).filter({ hasText: "E2E Pickup Updated" }).click();
    await page.getByLabel("event-details-panel").getByRole("button", { name: "Delete" }).click();
    await page.getByLabel("event-details-panel").getByRole("button", { name: "Confirm delete" }).click();

    await expect(page.getByLabel("event-details-panel")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "month-view-button" })).toBeVisible();
    await page.getByRole("button", { name: "month-view-button" }).click();
    await expect(page.getByRole("region", { name: "month-view" })).toBeVisible();
    await expect(page.getByText("E2E Pickup Updated")).toHaveCount(0);

    const firstDayCell = page.locator('button[aria-label^="select-day-"]').first();
    await firstDayCell.click();
    await expect(page.getByRole("region", { name: "day-view" })).toBeVisible();

    await expect(page.getByText("E2E Pickup Updated")).toHaveCount(0);
  });
});

test("cross-day navigation correctness", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
  const selectedDay = page.getByLabel("selected-day");
  const heading = page.locator("h2");

  const initialDate = await selectedDay.inputValue();

  await page.getByRole("button", { name: "Next day" }).click();
  const nextDate = await selectedDay.inputValue();
  expect(nextDate).not.toBe(initialDate);
  await expect(heading).toContainText(nextDate);

  await page.getByRole("button", { name: "Previous day" }).click();
  const backToInitial = await selectedDay.inputValue();
  expect(backToInitial).toBe(initialDate);
  await expect(heading).toContainText(initialDate);

  await selectedDay.fill("2026-11-20");
  await expect(heading).toContainText("2026-11-20");
});
