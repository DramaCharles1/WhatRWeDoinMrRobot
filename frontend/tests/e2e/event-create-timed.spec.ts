import { test } from "./support/fixtures";
import { assertTimedEventAfterRefresh, assertTimedEventInListing } from "./support/dayListAssertions";
import { cleanupEventsByTitleAndDate } from "./support/eventCleanup";
import { createTimedEventWithSaveFlow } from "./support/eventForm";
import { withStage } from "./support/stageReporting";
import { buildTimedEventData } from "./support/testData";

function assertTimedInputPresent(startTime: string, endTime: string): void {
  if (!startTime || !endTime) {
    throw new Error("For timed events, both `startTime` and `endTime` are required.");
  }
}

test.describe("timed event creation", () => {
  test("creates a timed event and lists it with the expected time range", async ({
    page,
    gotoCalendar,
  }) => {
    const eventData = buildTimedEventData();
    assertTimedInputPresent(eventData.startTime, eventData.endTime);
    try {
      await cleanupEventsByTitleAndDate(page.request, {
        title: eventData.title,
        eventDate: eventData.eventDate,
      });

      await gotoCalendar(eventData.eventDate);

      await withStage("create", async () => {
        await createTimedEventWithSaveFlow(page, {
          title: eventData.title,
          notes: eventData.notes,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
        });
      });

      await withStage("retrieve/list", async () => {
        await assertTimedEventInListing(
          page,
          eventData.title,
          eventData.startTime,
          eventData.endTime,
        );
      });
    } finally {
      await cleanupEventsByTitleAndDate(page.request, {
        title: eventData.title,
        eventDate: eventData.eventDate,
      });
    }
  });

  test("keeps timed event visible with same time range after refresh", async ({
    page,
    gotoCalendar,
  }) => {
    const eventData = buildTimedEventData(1);
    assertTimedInputPresent(eventData.startTime, eventData.endTime);
    try {
      await cleanupEventsByTitleAndDate(page.request, {
        title: eventData.title,
        eventDate: eventData.eventDate,
      });

      await gotoCalendar(eventData.eventDate);

      await withStage("create", async () => {
        await createTimedEventWithSaveFlow(page, {
          title: eventData.title,
          notes: eventData.notes,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
        });
      });

      await withStage("retrieve/list", async () => {
        await assertTimedEventAfterRefresh(
          page,
          eventData.title,
          eventData.startTime,
          eventData.endTime,
          eventData.eventDate,
        );
      });
    } finally {
      await cleanupEventsByTitleAndDate(page.request, {
        title: eventData.title,
        eventDate: eventData.eventDate,
      });
    }
  });
});
