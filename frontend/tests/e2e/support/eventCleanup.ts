import type { APIRequestContext } from "@playwright/test";
import type { EventDto, EventWriteRequest } from "../../../src/types/api";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

type CleanupQuery = {
  title: string;
  eventDate: string;
};

function assertValidPayload(input: EventWriteRequest): void {
  if (!input.title.trim()) {
    throw new Error("`title` must be non-empty.");
  }

  if (!input.is_all_day && (!input.start_time || !input.end_time)) {
    throw new Error("For timed events, both `startTime` and `endTime` are required.");
  }

  // For all-day events, time fields are optional and can be omitted/null.
}

export async function createEventForCleanup(
  request: APIRequestContext,
  input: EventWriteRequest,
): Promise<EventDto> {
  assertValidPayload(input);
  const response = await request.post(`${API_BASE_URL}/events`, { data: input });
  if (!response.ok()) {
    throw new Error(`Failed to create cleanup seed event: ${response.status()} ${response.statusText()}`);
  }
  return (await response.json()) as EventDto;
}

export async function cleanupEventsByTitleAndDate(
  request: APIRequestContext,
  query: CleanupQuery,
): Promise<number> {
  const listResponse = await request.get(
    `${API_BASE_URL}/events?date=${encodeURIComponent(query.eventDate)}`,
  );
  if (!listResponse.ok()) {
    throw new Error(`Failed to list events for cleanup: ${listResponse.status()} ${listResponse.statusText()}`);
  }

  const payload = (await listResponse.json()) as { events: EventDto[] };
  const matches = payload.events.filter((event) => event.title === query.title);

  for (const event of matches) {
    const deleteResponse = await request.delete(`${API_BASE_URL}/events/${event.id}`);
    if (!deleteResponse.ok()) {
      throw new Error(
        `Failed to delete cleanup event ${event.id}: ${deleteResponse.status()} ${deleteResponse.statusText()}`,
      );
    }
  }

  return matches.length;
}
