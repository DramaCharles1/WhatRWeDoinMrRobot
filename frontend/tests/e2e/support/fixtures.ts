import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

type CalendarFixtures = {
  gotoCalendar: (date?: string) => Promise<void>;
  selectDay: (date: string) => Promise<void>;
};

async function waitForCalendarReady(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "SpeciaelFamily Calendar" })).toBeVisible();
}

async function waitForSelectedDayLoaded(page: Page, date: string): Promise<void> {
  await expect(page.getByRole("heading", { level: 2 })).toContainText(date);

  const loading = page.getByText("Loading events...");
  if (await loading.isVisible().catch(() => false)) {
    await expect(loading).toBeHidden();
  }
}

export const test = base.extend<CalendarFixtures>({
  gotoCalendar: async ({ page }, fixtureCallback) => {
    await fixtureCallback(async (date?: string) => {
      await page.goto("/");
      await waitForCalendarReady(page);
      if (date) {
        await page.getByLabel("selected-day").fill(date);
        await waitForSelectedDayLoaded(page, date);
      }
    });
  },
  selectDay: async ({ page }, fixtureCallback) => {
    await fixtureCallback(async (date: string) => {
      await page.getByLabel("selected-day").fill(date);
      await waitForSelectedDayLoaded(page, date);
    });
  },
});

export { expect };
