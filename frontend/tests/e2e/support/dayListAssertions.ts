import { expect, type Locator, type Page } from "@playwright/test";

function eventListItemByTitle(page: Page, title: string): Locator {
  return page.locator("li.event-list-item", {
    has: page.locator("strong", { hasText: title }),
  });
}

export async function assertEventPresentInListing(page: Page, title: string): Promise<void> {
  await expect(eventListItemByTitle(page, title)).toBeVisible();
}

export async function assertEventAbsentInListing(page: Page, title: string): Promise<void> {
  await expect(eventListItemByTitle(page, title)).toHaveCount(0);
}

export async function assertAllDayEventInListing(page: Page, title: string): Promise<void> {
  const row = eventListItemByTitle(page, title);
  await expect(row).toBeVisible();
  await expect(row.locator("strong")).toHaveText(title);
  await expect(row.getByText("All day")).toBeVisible();
  // "A created event must appear in the listing for its date."
}

export async function assertAllDayEventAfterRefresh(page: Page, title: string): Promise<void> {
  await page.reload();
  await assertAllDayEventInListing(page, title);
}

export async function assertTimedEventInListing(
  page: Page,
  title: string,
  startTime: string,
  endTime: string,
): Promise<void> {
  const row = eventListItemByTitle(page, title);
  await expect(row).toBeVisible();
  await expect(row.getByText(`${startTime} - ${endTime}`)).toBeVisible();
  // "A created event must appear in the listing for its date."
}

export async function assertDeletedEventNotInListing(page: Page, title: string): Promise<void> {
  await assertEventAbsentInListing(page, title);
  // "A deleted event must not appear in subsequent listing reads."
}

export async function clickDeleteForEventTitle(page: Page, title: string): Promise<void> {
  const row = eventListItemByTitle(page, title);
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /^delete-/i }).click();
}
