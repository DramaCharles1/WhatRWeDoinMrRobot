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

test.describe("event deletion", () => {
  test("deletes an existing event from the selected day list", async ({ page, gotoCalendar }) => {
    const eventData = buildAllDayEventData(2);
    try {
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
    } finally {
      await cleanupEventsByTitleAndDate(page.request, {
        title: eventData.title,
        eventDate: eventData.eventDate,
      });
    }
  });

  test("keeps deleted event absent after refresh", async ({ page, gotoCalendar }) => {
    const eventData = buildAllDayEventData(3);
    try {
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
    } finally {
      await cleanupEventsByTitleAndDate(page.request, {
        title: eventData.title,
        eventDate: eventData.eventDate,
      });
    }
  });
});
