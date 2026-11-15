type Props = {
  onAddEvent?: () => void;
};

export function TaskListEmptyState({ onAddEvent }: Props) {
  return (
    <div>
      <p>No events scheduled for this day.</p>
      {onAddEvent ? (
        <button className="focus-ring" type="button" onClick={onAddEvent}>
          Add event
        </button>
      ) : null}
    </div>
  );
}
