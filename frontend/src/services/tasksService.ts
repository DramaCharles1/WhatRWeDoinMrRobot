import { apiRequest } from "./apiClient";
import type {
  EventDto,
  EventListResponse,
  EventRangeResponse,
  EventUpdateRequest,
  EventWriteRequest,
} from "../types/api";

export async function listEventsByDate(date: string): Promise<EventListResponse> {
  return apiRequest<EventListResponse>(`/events?date=${encodeURIComponent(date)}`);
}

export async function listEventsByRange(
  startDate: string,
  endDate: string,
): Promise<EventRangeResponse> {
  const query = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });
  return apiRequest<EventRangeResponse>(`/events/range?${query.toString()}`);
}

export async function createEvent(input: EventWriteRequest): Promise<EventDto> {
  return apiRequest<EventDto>("/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEvent(eventId: string, input: EventUpdateRequest): Promise<EventDto> {
  return apiRequest<EventDto>(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  return apiRequest<void>(`/events/${eventId}`, {
    method: "DELETE",
  });
}
