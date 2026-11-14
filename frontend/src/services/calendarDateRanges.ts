export type CalendarViewMode = "week" | "month" | "day";

export type CalendarDateRange = {
  startDate: string;
  endDate: string;
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

export function getDayRange(anchorDate: string): CalendarDateRange {
  return { startDate: anchorDate, endDate: anchorDate };
}

export function getWeekRange(anchorDate: string): CalendarDateRange {
  const anchor = parseIsoDate(anchorDate);
  const dayOfWeek = anchor.getUTCDay();
  const offsetFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const start = addDays(anchor, -offsetFromMonday);
  const end = addDays(start, 6);
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
}

export function getMonthRange(anchorDate: string): CalendarDateRange {
  const anchor = parseIsoDate(anchorDate);
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0));
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
}

export function getRangeForView(
  viewMode: CalendarViewMode,
  anchorDate: string,
): CalendarDateRange {
  if (viewMode === "day") {
    return getDayRange(anchorDate);
  }
  if (viewMode === "month") {
    return getMonthRange(anchorDate);
  }
  return getWeekRange(anchorDate);
}
