import { test } from "./support/fixtures";
import { assertAllDayEventAfterRefresh, assertAllDayEventInListing } from "./support/dayListAssertions";
import { cleanupEventsByTitleAndDate } from "./support/eventCleanup";
import { createAllDayEventWithSaveFlow } from "./support/eventForm";
import { withStage } from "./support/stageReporting";
import { buildAllDayEventData } from "./support/testData";

type CleanupItem = {
  title: string;
  eventDate: string;
};

test.describe("all-day event creation", () => {
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

  test("creates an all-day event and lists it for the selected date", async ({
    page,
    gotoCalendar,
  }) => {
    const eventData = buildAllDayEventData();
    cleanupQueue.push({ title: eventData.title, eventDate: eventData.eventDate });

    await cleanupEventsByTitleAndDate(page.request, {
      title: eventData.title,
      eventDate: eventData.eventDate,
    });

    await gotoCalendar(eventData.eventDate);

    await withStage("create", async () => {
      await createAllDayEventWithSaveFlow(page, {
        title: eventData.title,
        notes: eventData.notes,
      });
    });

    await withStage("retrieve/list", async () => {
      await assertAllDayEventInListing(page, eventData.title);
    });
  });

  test("keeps all-day event visible after data refresh", async ({ page, gotoCalendar }) => {
    const eventData = buildAllDayEventData(1);
    cleanupQueue.push({ title: eventData.title, eventDate: eventData.eventDate });

    await cleanupEventsByTitleAndDate(page.request, {
      title: eventData.title,
      eventDate: eventData.eventDate,
    });

    await gotoCalendar(eventData.eventDate);

    await withStage("create", async () => {
      await createAllDayEventWithSaveFlow(page, {
        title: eventData.title,
        notes: eventData.notes,
      });
    });

    await withStage("retrieve/list", async () => {
      await assertAllDayEventAfterRefresh(page, eventData.title);
    });
  });
});
