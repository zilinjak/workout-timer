import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Exercise } from "../types";
import { formatTime, parseTime } from "../utils";
import { SortableItem } from "./SortableItem";

interface SetupViewProps {
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  sets: number;
  setSets: (sets: number) => void;
  betweenSetRest: number;
  setBetweenSetRest: (rest: number) => void;
  onStartWorkout: () => void;
  onReset: () => void;
}

export function SetupView({
  exercises,
  setExercises,
  editingId,
  setEditingId,
  sets,
  setSets,
  betweenSetRest,
  setBetweenSetRest,
  onStartWorkout,
  onReset,
}: SetupViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "New Exercise",
      time: 60,
    };
    setExercises([...exercises, newExercise]);
  };

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const duplicateExercise = (id: string) => {
    const index = exercises.findIndex((ex) => ex.id === id);
    if (index === -1) return;
    const original = exercises[index];
    const duplicate: Exercise = {
      ...original,
      id: Date.now().toString(),
    };
    const newExercises = [...exercises];
    newExercises.splice(index + 1, 0, duplicate);
    setExercises(newExercises);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const setTime = exercises.reduce((sum, ex) => sum + ex.time, 0);
  const totalTime =
    setTime * sets + (sets > 1 ? betweenSetRest * (sets - 1) : 0);

  return (
    <div className="app">
      <div className="setup-header">
        <button className="reset-memory-btn" onClick={onReset}>
          Reset workout memory
        </button>
      </div>
      <h1>Workout Timer</h1>

      <div className="setup-container">
        <div className="exercises-section">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={exercises.map((ex) => ex.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="exercises-list">
                {exercises.map((exercise) => (
                  <SortableItem
                    key={exercise.id}
                    exercise={exercise}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    updateExercise={updateExercise}
                    deleteExercise={deleteExercise}
                    duplicateExercise={duplicateExercise}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button className="add-btn" onClick={addExercise}>
            + Add Exercise
          </button>
        </div>

        <div className="workout-config">
          <div className="sets-control">
            <label>Sets</label>
            <div className="control-group">
              <button onClick={() => setSets(Math.max(1, sets - 1))}>−</button>
              <span className="sets-number">{sets}</span>
              <button onClick={() => setSets(sets + 1)}>+</button>
            </div>
          </div>

          <div className="rest-control">
            <label>Rest</label>
            <div className="rest-input-group">
              <button
                onClick={() =>
                  setBetweenSetRest(Math.max(0, betweenSetRest - 15))
                }
              >
                −
              </button>
              <input
                type="text"
                className="rest-time-input"
                value={formatTime(betweenSetRest)}
                onChange={(e) => setBetweenSetRest(parseTime(e.target.value))}
              />
              <button onClick={() => setBetweenSetRest(betweenSetRest + 15)}>
                +
              </button>
            </div>
          </div>

          <div className="time-summary">
            <div className="time-item">
              <span className="time-label">Set</span>
              <span className="time-value">{formatTime(setTime)}</span>
            </div>
            <div className="time-item">
              <span className="time-label">Total</span>
              <span className="time-value">{formatTime(totalTime)}</span>
            </div>
          </div>
        </div>
      </div>

      <button className="start-btn" onClick={onStartWorkout}>
        Start Workout
      </button>
    </div>
  );
}
