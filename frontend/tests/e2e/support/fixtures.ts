import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

type CalendarFixtures = {
  gotoCalendar: (date?: string) => Promise<void>;
  selectDay: (date: string) => Promise<void>;
};

async function waitForCalendarReady(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "SpeciaelFamily Calendar" })).toBeVisible();
}

export const test = base.extend<CalendarFixtures>({
  gotoCalendar: async ({ page }, fixtureCallback) => {
    await fixtureCallback(async (date?: string) => {
      await page.goto("/");
      await waitForCalendarReady(page);
      if (date) {
        await page.getByLabel("selected-day").fill(date);
      }
    });
  },
  selectDay: async ({ page }, fixtureCallback) => {
    await fixtureCallback(async (date: string) => {
      await page.getByLabel("selected-day").fill(date);
      await expect(page.getByRole("heading", { level: 2 })).toContainText(date);
    });
  },
});

export { expect };
