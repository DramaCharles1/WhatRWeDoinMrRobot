import type { CalendarViewMode } from "../services/calendarDateRanges";

type Props = {
  viewMode: CalendarViewMode;
  onChange: (viewMode: CalendarViewMode) => void;
};

const ORDERED_MODES: CalendarViewMode[] = ["week", "month", "day"];

export function CalendarViewSwitcher({ viewMode, onChange }: Props) {
  return (
    <section aria-label="view-switcher" className="view-switcher">
      {ORDERED_MODES.map((mode) => (
        <button
          key={mode}
          className="focus-ring"
          type="button"
          aria-pressed={viewMode === mode}
          aria-label={`${mode}-view-button`}
          onClick={() => onChange(mode)}
        >
          {mode[0].toUpperCase() + mode.slice(1)} view
        </button>
      ))}
    </section>
  );
}
