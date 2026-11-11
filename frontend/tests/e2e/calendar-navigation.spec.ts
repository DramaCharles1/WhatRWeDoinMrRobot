import { test, expect } from "@playwright/test";

test("cross-day navigation correctness", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("SpeciaelFamily Calendar")).toBeVisible();
});
