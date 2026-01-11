import type { Exercise, TimerState } from "../types";
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
  isRestingBetweenExercises: boolean;
  isLastExerciseInSet: boolean;
  nextIsRest: boolean;
  nextIsExerciseRest: boolean;
  betweenSetRest: number;
  betweenExerciseRest: number;
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
  isRestingBetweenExercises,
  isLastExerciseInSet,
  nextIsRest,
  nextIsExerciseRest,
  betweenSetRest,
  betweenExerciseRest,
  onHomeClick,
  onPause,
  onResume,
  onConfirmQuit,
  onCancelQuit,
}: TimerViewProps) {
  const isResting = isRestingBetweenSets || isRestingBetweenExercises;
  const currentCardLabel = isResting ? "Rest" : "Current";
  const currentCardName = isRestingBetweenSets
    ? "Rest Between Sets"
    : isRestingBetweenExercises
    ? "Rest Between Exercises"
    : currentExercise?.name ?? "";

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
        <div className="exercise-label">{currentCardLabel}</div>
        <h1 className="exercise-name-large">{currentCardName}</h1>
        <div className="time-display">{formatTime(timeRemaining)}</div>
      </div>

      {/* Show next exercise with optional set ending indicator */}
      {nextExercise && !isResting && !nextIsRest && !nextIsExerciseRest && (
        <div className="next-exercise">
          <div className="next-label">
            Next
            {isLastExerciseInSet && currentSet < sets
              ? ` (End of Set ${currentSet})`
              : ""}
          </div>
          <div className="next-name">{nextExercise.name}</div>
          <div className="next-time">{formatTime(nextExercise.time)}</div>
        </div>
      )}

      {/* Show rest between exercises as next action */}
      {nextIsExerciseRest && !isResting && (
        <div className="next-exercise">
          <div className="next-label">Next</div>
          <div className="next-name">Rest Between Exercises</div>
          <div className="next-time">{formatTime(betweenExerciseRest)}</div>
        </div>
      )}

      {/* Show rest between sets as next */}
      {nextIsRest && !isResting && (
        <div className="next-exercise">
          <div className="next-label">Next (End of Set {currentSet})</div>
          <div className="next-name">Rest Between Sets</div>
          <div className="next-time">{formatTime(betweenSetRest)}</div>
        </div>
      )}

      {/* When currently resting, show what's coming after rest */}
      {isRestingBetweenSets && (
        <div className="next-exercise">
          <div className="next-label">Up Next</div>
          <div className="next-name">Set {currentSet}</div>
          {nextExercise && <div className="next-time">{nextExercise.name}</div>}
        </div>
      )}

      {isRestingBetweenExercises && nextExercise && (
        <div className="next-exercise">
          <div className="next-label">Up Next</div>
          <div className="next-name">{nextExercise.name}</div>
          <div className="next-time">{formatTime(nextExercise.time)}</div>
        </div>
      )}

      {/* Show workout complete indicator when on last exercise of last set */}
      {isLastExerciseInSet &&
        currentSet >= sets &&
        !isRestingBetweenSets &&
        !isRestingBetweenExercises && (
          <div className="next-exercise">
            <div className="next-label">After This</div>
            <div className="next-name">Workout Complete! 🎉</div>
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
