import type { DayEvents, EventDto } from "../types/api";
import type { CalendarViewMode } from "./calendarDateRanges";

export type DayEventBucket = {
  date: string;
  events: EventDto[];
  visibleCount: number;
  overflowCount: number;
};

type BuildBucketsInput = {
  startDate: string;
  endDate: string;
  days: DayEvents[];
  viewMode: CalendarViewMode;
  compactVisibleLimit?: number;
};

function parseIsoDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(value: Date, days: number): Date {
  const copy = new Date(value.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function iterDateRange(startDate: string, endDate: string): string[] {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const out: string[] = [];

  let cursor = start;
  while (cursor <= end) {
    out.push(toIsoDate(cursor));
    cursor = addDays(cursor, 1);
  }

  return out;
}

export function buildDayBuckets(input: BuildBucketsInput): DayEventBucket[] {
  const compactVisibleLimit = input.compactVisibleLimit ?? 3;
  const byDate = new Map(input.days.map((day) => [day.date, day.events]));

  return iterDateRange(input.startDate, input.endDate).map((date) => {
    const events = byDate.get(date) ?? [];
    const visibleCount =
      input.viewMode === "day" ? events.length : Math.min(events.length, compactVisibleLimit);

    return {
      date,
      // Always carry the full day events list even when compact rendering truncates.
      events,
      visibleCount,
      overflowCount: input.viewMode === "day" ? 0 : Math.max(events.length - visibleCount, 0),
    };
  });
}
