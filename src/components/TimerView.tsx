import { Exercise, TimerState } from "../types";
import { formatTime } from "../utils";
import { QuitConfirmDialog } from "./QuitConfirmDialog";

interface TimerViewProps {
  timerState: TimerState;
  showQuitConfirm: boolean;
  currentSet: number;
  sets: number;
  currentExercise: Exercise | null;
  nextExercise: Exercise | null;
  timeRemaining: number;
  isRestingBetweenSets: boolean;
  onHomeClick: () => void;
  onPause: () => void;
  onResume: () => void;
  onConfirmQuit: () => void;
  onCancelQuit: () => void;
}

export function TimerView({
  timerState,
  showQuitConfirm,
  currentSet,
  sets,
  currentExercise,
  nextExercise,
  timeRemaining,
  isRestingBetweenSets,
  onHomeClick,
  onPause,
  onResume,
  onConfirmQuit,
  onCancelQuit,
}: TimerViewProps) {
  return (
    <div className="app timer-view">
      {showQuitConfirm && (
        <QuitConfirmDialog onConfirm={onConfirmQuit} onCancel={onCancelQuit} />
      )}

      <div className="timer-header">
        <button className="home-btn" onClick={onHomeClick}>
          ← Home
        </button>
        <div className="set-indicator">
          Set {currentSet} of {sets}
        </div>
      </div>

      <div className="current-exercise">
        <div className="exercise-label">
          {isRestingBetweenSets ? "Rest" : "Current"}
        </div>
        <h1 className="exercise-name-large">
          {isRestingBetweenSets ? "Rest Between Sets" : currentExercise?.name}
        </h1>
        <div className="time-display">{formatTime(timeRemaining)}</div>
      </div>

      {nextExercise && (
        <div className="next-exercise">
          <div className="next-label">Next</div>
          <div className="next-name">{nextExercise.name}</div>
          <div className="next-time">{formatTime(nextExercise.time)}</div>
        </div>
      )}
      {isRestingBetweenSets && (
        <div className="next-exercise">
          <div className="next-label">Up Next</div>
          <div className="next-name">Set {currentSet}</div>
        </div>
      )}

      <div className="timer-controls">
        {timerState === "running" ? (
          <button className="pause-btn" onClick={onPause}>
            ⏸ Pause
          </button>
        ) : (
          <button className="resume-btn" onClick={onResume}>
            ▶ Resume
          </button>
        )}
      </div>
    </div>
  );
}
