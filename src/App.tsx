import { useState, useEffect, useRef } from "react";
import type { Exercise, TimerState } from "./types";
import { loadStoredConfig, saveConfig } from "./utils";
import { SetupView } from "./components/SetupView";
import { TimerView } from "./components/TimerView";
import { FinishedView } from "./components/FinishedView";
import "./App.css";

const storedConfig = loadStoredConfig();

function App() {
  const [exercises, setExercises] = useState<Exercise[]>(
    storedConfig?.exercises ?? [{ id: "1", name: "Warm Up", time: 1 }]
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sets, setSets] = useState(storedConfig?.sets ?? 3);
  const [betweenSetRest, setBetweenSetRest] = useState(storedConfig?.betweenSetRest ?? 0);
  const [betweenExerciseRest, setBetweenExerciseRest] = useState(
    storedConfig?.betweenExerciseRest ?? 0
  );
  const [timerState, setTimerState] = useState<TimerState>("setup");
  const [currentSet, setCurrentSet] = useState(1);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRestingBetweenSets, setIsRestingBetweenSets] = useState(false);
  const [isRestingBetweenExercises, setIsRestingBetweenExercises] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    saveConfig({ exercises, sets, betweenSetRest, betweenExerciseRest });
  }, [exercises, sets, betweenSetRest, betweenExerciseRest]);

  // Refs to track current values for use in advanceToNext (avoids stale closures)
  const currentSetRef = useRef(currentSet);
  const currentExerciseIndexRef = useRef(currentExerciseIndex);
  const isRestingBetweenSetsRef = useRef(isRestingBetweenSets);
  const isRestingBetweenExercisesRef = useRef(isRestingBetweenExercises);
  const exercisesRef = useRef(exercises);
  const setsRef = useRef(sets);
  const betweenSetRestRef = useRef(betweenSetRest);
  const betweenExerciseRestRef = useRef(betweenExerciseRest);

  // Keep refs in sync with state
  useEffect(() => {
    currentSetRef.current = currentSet;
  }, [currentSet]);
  useEffect(() => {
    currentExerciseIndexRef.current = currentExerciseIndex;
  }, [currentExerciseIndex]);
  useEffect(() => {
    isRestingBetweenSetsRef.current = isRestingBetweenSets;
  }, [isRestingBetweenSets]);
  useEffect(() => {
    isRestingBetweenExercisesRef.current = isRestingBetweenExercises;
  }, [isRestingBetweenExercises]);
  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);
  useEffect(() => {
    setsRef.current = sets;
  }, [sets]);
  useEffect(() => {
    betweenSetRestRef.current = betweenSetRest;
  }, [betweenSetRest]);
  useEffect(() => {
    betweenExerciseRestRef.current = betweenExerciseRest;
  }, [betweenExerciseRest]);

  useEffect(() => {
    if (timerState === "running" && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            advanceToNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, timeRemaining]);

  const advanceToNext = () => {
    // Use refs to get current values (avoids stale closure issues)
    const currentSetVal = currentSetRef.current;
    const currentExerciseIndexVal = currentExerciseIndexRef.current;
    const isRestingBetweenSetsVal = isRestingBetweenSetsRef.current;
    const isRestingBetweenExercisesVal = isRestingBetweenExercisesRef.current;
    const exercisesVal = exercisesRef.current;
    const setsVal = setsRef.current;
    const betweenSetRestVal = betweenSetRestRef.current;
    const betweenExerciseRestVal = betweenExerciseRestRef.current;

    console.log("🔄 advanceToNext called", {
      currentSet: currentSetVal,
      totalSets: setsVal,
      currentExerciseIndex: currentExerciseIndexVal,
      totalExercises: exercisesVal.length,
      isRestingBetweenSets: isRestingBetweenSetsVal,
      isRestingBetweenExercises: isRestingBetweenExercisesVal,
      betweenSetRest: betweenSetRestVal,
      betweenExerciseRest: betweenExerciseRestVal,
      currentExerciseName: exercisesVal[currentExerciseIndexVal]?.name,
    });

    if (exercisesVal.length === 0) {
      console.warn("No exercises available; ending workout");
      setTimerState("finished");
      return;
    }

    if (isRestingBetweenSetsVal) {
      // Finished resting, start the new set
      console.log("✅ Finished rest, starting set", currentSetVal);
      setCurrentExerciseIndex(0);
      if (exercisesVal[0]) {
        setTimeRemaining(exercisesVal[0].time);
      } else {
        setTimerState("finished");
      }
      setIsRestingBetweenSets(false);
      setIsRestingBetweenExercises(false);
    } else if (isRestingBetweenExercisesVal) {
      console.log("✅ Finished rest between exercises");
      const nextExercise = exercisesVal[currentExerciseIndexVal];
      if (nextExercise) {
        setIsRestingBetweenExercises(false);
        setTimeRemaining(nextExercise.time);
      } else {
        console.warn("No exercise found after rest; ending workout");
        setTimerState("finished");
      }
    } else if (currentExerciseIndexVal < exercisesVal.length - 1) {
      // Move to next exercise in the current set
      const nextIndex = currentExerciseIndexVal + 1;
      if (betweenExerciseRestVal > 0) {
        console.log(
          `😴 Starting rest between exercises: ${betweenExerciseRestVal}s before ${exercisesVal[nextIndex].name}`
        );
        setCurrentExerciseIndex(nextIndex);
        setIsRestingBetweenExercises(true);
        setTimeRemaining(betweenExerciseRestVal);
      } else {
        console.log(
          `➡️ Moving to next exercise: ${exercisesVal[nextIndex].name} (index ${nextIndex})`
        );
        setCurrentExerciseIndex(nextIndex);
        setTimeRemaining(exercisesVal[nextIndex].time);
      }
    } else {
      // Finished all exercises in the current set
      console.log("🏁 Finished all exercises in set", currentSetVal);
      if (currentSetVal < setsVal) {
        // Move to next set
        const newSet = currentSetVal + 1;
        console.log(`🔢 Moving to set ${newSet} of ${setsVal}`);
        setCurrentSet(newSet);
        if (betweenSetRestVal > 0) {
          console.log(`😴 Starting rest between sets: ${betweenSetRestVal}s`);
          setIsRestingBetweenSets(true);
          setTimeRemaining(betweenSetRestVal);
        } else {
          console.log("⏭️ No rest, starting next set immediately");
          setCurrentExerciseIndex(0);
          if (exercisesVal[0]) {
            setTimeRemaining(exercisesVal[0].time);
          } else {
            setTimerState("finished");
          }
        }
        setIsRestingBetweenExercises(false);
      } else {
        // Finished all sets
        console.log("🎉 Finished all sets! Workout complete!");
        setTimerState("finished");
      }
    }
  };

  const startWorkout = () => {
    if (exercises.length === 0) return;
    console.log("🏋️ Starting workout", {
      totalSets: sets,
      totalExercises: exercises.length,
      exercises: exercises.map((e) => ({ name: e.name, time: e.time })),
      betweenSetRest,
      betweenExerciseRest,
    });
    setCurrentSet(1);
    setCurrentExerciseIndex(0);
    setTimeRemaining(exercises[0].time);
    setIsRestingBetweenSets(false);
    setIsRestingBetweenExercises(false);
    setTimerState("running");
  };

  const pauseWorkout = () => {
    console.log("⏸️ Paused workout", {
      currentSet,
      currentExerciseIndex,
      timeRemaining,
      isRestingBetweenSets,
      isRestingBetweenExercises,
    });
    setTimerState("paused");
  };

  const resumeWorkout = () => {
    console.log("▶️ Resumed workout", {
      currentSet,
      currentExerciseIndex,
      timeRemaining,
      isRestingBetweenSets,
      isRestingBetweenExercises,
    });
    setTimerState("running");
  };

  const handleHomeClick = () => {
    setShowQuitConfirm(true);
    setTimerState("paused");
  };

  const confirmQuit = () => {
    console.log("🏠 Quitting workout", {
      wasOnSet: currentSet,
      wasOnExercise: currentExerciseIndex,
    });
    setTimerState("setup");
    setShowQuitConfirm(false);
    setCurrentSet(1);
    setCurrentExerciseIndex(0);
    setTimeRemaining(0);
    setIsRestingBetweenSets(false);
    setIsRestingBetweenExercises(false);
  };

  const cancelQuit = () => {
    setShowQuitConfirm(false);
    setTimerState("running");
  };

  const restartWorkout = () => {
    console.log("🔄 Restarting workout from finished state");
    setTimerState("setup");
    setCurrentSet(1);
    setCurrentExerciseIndex(0);
    setTimeRemaining(0);
    setIsRestingBetweenSets(false);
    setIsRestingBetweenExercises(false);
  };

  const resetConfig = () => {
    console.log("🗑️ Resetting configuration to defaults");
    setExercises([{ id: "1", name: "Warm Up", time: 60 }]);
    setSets(3);
    setBetweenSetRest(0);
    setBetweenExerciseRest(0);
  };

  const currentExercise =
    isRestingBetweenSets || isRestingBetweenExercises
      ? null
      : exercises[currentExerciseIndex] ?? null;

  const hasMoreExercisesInSet = currentExerciseIndex < exercises.length - 1;

  const isLastExerciseInSet =
    !isRestingBetweenSets &&
    !isRestingBetweenExercises &&
    currentExerciseIndex === exercises.length - 1;

  const nextIsRest =
    isLastExerciseInSet && currentSet < sets && betweenSetRest > 0;

  const nextIsExerciseRest =
    !isRestingBetweenSets &&
    !isRestingBetweenExercises &&
    hasMoreExercisesInSet &&
    betweenExerciseRest > 0;

  const nextExercise = (() => {
    if (isRestingBetweenSets) {
      return exercises[0] ?? null;
    }
    if (isRestingBetweenExercises) {
      return exercises[currentExerciseIndex] ?? null;
    }
    if (hasMoreExercisesInSet) {
      return exercises[currentExerciseIndex + 1] ?? null;
    }
    if (currentSet < sets) {
      return exercises[0] ?? null;
    }
    return null;
  })();

  if (timerState === "setup") {
    return (
      <SetupView
        exercises={exercises}
        setExercises={setExercises}
        editingId={editingId}
        setEditingId={setEditingId}
        sets={sets}
        setSets={setSets}
        betweenSetRest={betweenSetRest}
        setBetweenSetRest={setBetweenSetRest}
        betweenExerciseRest={betweenExerciseRest}
        setBetweenExerciseRest={setBetweenExerciseRest}
        onStartWorkout={startWorkout}
        onReset={resetConfig}
      />
    );
  }

  if (timerState === "finished") {
    return <FinishedView sets={sets} onRestart={restartWorkout} />;
  }

  return (
    <TimerView
      timerState={timerState}
      showQuitConfirm={showQuitConfirm}
      currentSet={currentSet}
      sets={sets}
      currentExercise={currentExercise}
      nextExercise={nextExercise}
      timeRemaining={timeRemaining}
      isRestingBetweenSets={isRestingBetweenSets}
      isRestingBetweenExercises={isRestingBetweenExercises}
      isLastExerciseInSet={isLastExerciseInSet}
      nextIsRest={nextIsRest}
      nextIsExerciseRest={nextIsExerciseRest}
      betweenSetRest={betweenSetRest}
      betweenExerciseRest={betweenExerciseRest}
      onHomeClick={handleHomeClick}
      onPause={pauseWorkout}
      onResume={resumeWorkout}
      onConfirmQuit={confirmQuit}
      onCancelQuit={cancelQuit}
    />
  );
}

export default App;
