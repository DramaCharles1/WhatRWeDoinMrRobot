import { test, expect } from "@playwright/test";

test.describe("calendar multi-view journeys", () => {
  test.fixme("week to month transition", async ({ page }) => {
    await page.goto("/");

    // Phase 3 will wire view-switching controls and month rendering assertions.
    await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
  });

  test.fixme("week to day transition", async ({ page }) => {
    await page.goto("/");

    // Phase 3 will wire day-selection to day-view transition assertions.
    await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
  });

  test.fixme("create edit delete lifecycle from week view", async ({ page }) => {
    await page.goto("/");

    // Phase 4 will wire create/edit/delete lifecycle assertions.
    await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
  });
});

test("cross-day navigation correctness", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
  await expect(page.getByText("No events scheduled for this day.")).toBeVisible();

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
  await expect(page.getByText("No events scheduled for this day.")).toBeVisible();
});
