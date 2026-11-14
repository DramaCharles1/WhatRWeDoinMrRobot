import { expect, type Page } from "@playwright/test";

export type AllDayEventInput = {
  title: string;
  notes?: string;
};

export type TimedEventInput = {
  title: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

export async function setAllDay(page: Page, isAllDay: boolean): Promise<void> {
  const checkbox = page.getByLabel("is-all-day");
  const checked = await checkbox.isChecked();
  if (checked !== isAllDay) {
    await checkbox.click();
  }
}

export async function fillCommonEventFields(
  page: Page,
  input: Pick<AllDayEventInput, "title" | "notes">,
): Promise<void> {
  await page.getByLabel("title").fill(input.title);
  await page.getByLabel("notes").fill(input.notes ?? "");
}

export async function fillTimedFields(page: Page, input: TimedEventInput): Promise<void> {
  if (!input.startTime || !input.endTime) {
    throw new Error("For timed events, both `startTime` and `endTime` are required.");
  }
  await page.getByLabel("start-time").fill(input.startTime);
  await page.getByLabel("end-time").fill(input.endTime);
}

export async function submitEventForm(page: Page): Promise<void> {
  const submit = page.getByRole("button", { name: /Create|Save/ });
  await submit.click();
}

export async function createAllDayEvent(page: Page, input: AllDayEventInput): Promise<void> {
  await setAllDay(page, true);
  await fillCommonEventFields(page, input);
  await submitEventForm(page);
  await expect(page.getByLabel("title")).toHaveValue("");
}

export async function createAllDayEventWithSaveFlow(
  page: Page,
  input: AllDayEventInput,
): Promise<void> {
  await setAllDay(page, true);
  await fillCommonEventFields(page, input);
  await submitEventForm(page);
}

export async function createTimedEvent(page: Page, input: TimedEventInput): Promise<void> {
  await setAllDay(page, false);
  await fillCommonEventFields(page, input);
  await fillTimedFields(page, input);
  await submitEventForm(page);
}

export async function createTimedEventWithSaveFlow(
  page: Page,
  input: TimedEventInput,
): Promise<void> {
  await setAllDay(page, false);
  await fillCommonEventFields(page, input);
  await fillTimedFields(page, input);
  await submitEventForm(page);
}
