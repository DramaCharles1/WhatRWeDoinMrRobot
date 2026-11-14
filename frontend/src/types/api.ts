export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type EventDto = {
  id: string;
  title: string;
  event_date: string;
  is_all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type EventListResponse = {
  date: string;
  events: EventDto[];
};

export type EventWriteRequest = {
  title: string;
  event_date: string;
  is_all_day: boolean;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string;
};

export type EventUpdateRequest = Partial<EventWriteRequest>;
