import { test } from "./support/fixtures";
import {
  assertDeletedEventAfterRefresh,
  assertDeletedEventNotInListing,
  assertEventPresentInListing,
  deleteEventByTitleWithConfirmation,
} from "./support/dayListAssertions";
import { cleanupEventsByTitleAndDate, createEventForCleanup } from "./support/eventCleanup";
import { withStage } from "./support/stageReporting";
import { buildAllDayEventData } from "./support/testData";

type CleanupItem = {
  title: string;
  eventDate: string;
};

test.describe("event deletion", () => {
  const cleanupQueue: CleanupItem[] = [];

  test.afterEach(async ({ request }) => {
    while (cleanupQueue.length > 0) {
      const item = cleanupQueue.pop();
      if (!item) {
        continue;
      }
      await cleanupEventsByTitleAndDate(request, item);
    }
  });

  test("deletes an existing event from the selected day list", async ({ page, gotoCalendar }) => {
    const eventData = buildAllDayEventData(2);
    cleanupQueue.push({ title: eventData.title, eventDate: eventData.eventDate });

    await cleanupEventsByTitleAndDate(page.request, {
      title: eventData.title,
      eventDate: eventData.eventDate,
    });

    await createEventForCleanup(page.request, {
      title: eventData.title,
      event_date: eventData.eventDate,
      is_all_day: true,
      notes: eventData.notes,
    });

    await gotoCalendar(eventData.eventDate);
    await withStage("retrieve/list", async () => {
      await assertEventPresentInListing(page, eventData.title);
    });

    await withStage("delete", async () => {
      await deleteEventByTitleWithConfirmation(page, eventData.title);
    });

    await withStage("retrieve/list", async () => {
      await assertDeletedEventNotInListing(page, eventData.title);
    });
  });

  test("keeps deleted event absent after refresh", async ({ page, gotoCalendar }) => {
    const eventData = buildAllDayEventData(3);
    cleanupQueue.push({ title: eventData.title, eventDate: eventData.eventDate });

    await cleanupEventsByTitleAndDate(page.request, {
      title: eventData.title,
      eventDate: eventData.eventDate,
    });

    await createEventForCleanup(page.request, {
      title: eventData.title,
      event_date: eventData.eventDate,
      is_all_day: true,
      notes: eventData.notes,
    });

    await gotoCalendar(eventData.eventDate);
    await withStage("retrieve/list", async () => {
      await assertEventPresentInListing(page, eventData.title);
    });

    await withStage("delete", async () => {
      await deleteEventByTitleWithConfirmation(page, eventData.title);
    });

    await withStage("retrieve/list", async () => {
      await assertDeletedEventAfterRefresh(page, eventData.title);
    });
  });
});
