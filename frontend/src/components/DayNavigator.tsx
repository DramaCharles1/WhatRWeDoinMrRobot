type Props = {
  selectedDate: string;
  onChange: (nextDate: string) => void;
};

function shiftDate(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function DayNavigator({ selectedDate, onChange }: Props) {
  return (
    <section>
      <button type="button" onClick={() => onChange(shiftDate(selectedDate, -1))}>
        Previous day
      </button>
      <input
        aria-label="selected-day"
        type="date"
        value={selectedDate}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="button" onClick={() => onChange(shiftDate(selectedDate, 1))}>
        Next day
      </button>
    </section>
  );
}
