let sequence = 0;

function nextSequence(): number {
  sequence += 1;
  return sequence;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function buildDeterministicDate(offsetDays = 0): string {
  const anchor = new Date("2026-11-20T00:00:00Z");
  anchor.setUTCDate(anchor.getUTCDate() + offsetDays);
  return anchor.toISOString().slice(0, 10);
}

export function buildDeterministicTitle(prefix: string): string {
  const seed = process.env.E2E_RUN_SEED ?? "local";
  return `${prefix}-${seed}-${pad2(nextSequence())}`;
}

export function buildTimedRange(offsetMinutes = 0): { startTime: string; endTime: string } {
  const startHour = 9;
  const startMinute = offsetMinutes;
  const endHour = 10;
  const endMinute = offsetMinutes;
  return {
    startTime: `${pad2(startHour)}:${pad2(startMinute)}`,
    endTime: `${pad2(endHour)}:${pad2(endMinute)}`,
  };
}

export function buildAllDayEventData(offsetDays = 0): {
  title: string;
  eventDate: string;
  notes: string;
} {
  return {
    title: buildDeterministicTitle("all-day"),
    eventDate: buildDeterministicDate(offsetDays),
    notes: "All-day E2E event",
  };
}

export function buildTimedEventData(offsetDays = 0): {
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  notes: string;
} {
  const range = buildTimedRange();
  return {
    title: buildDeterministicTitle("timed"),
    eventDate: buildDeterministicDate(offsetDays),
    startTime: range.startTime,
    endTime: range.endTime,
    notes: "Timed E2E event",
  };
}
