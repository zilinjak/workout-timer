interface FinishedViewProps {
  sets: number;
  onRestart: () => void;
}

export function FinishedView({ sets, onRestart }: FinishedViewProps) {
  return (
    <div className="app timer-view">
      <div className="finished-screen">
        <h1>🎉 Workout Complete!</h1>
        <p>
          Great job finishing {sets} set{sets > 1 ? "s" : ""}!
        </p>
        <button className="restart-btn" onClick={onRestart}>
          Back to Setup
        </button>
      </div>
    </div>
  );
}
