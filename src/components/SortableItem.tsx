import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Exercise } from "../types";
import { formatTime, parseTime } from "../utils";

interface SortableItemProps {
  exercise: Exercise;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
}

export function SortableItem({
  exercise,
  editingId,
  setEditingId,
  updateExercise,
  deleteExercise,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`exercise-item ${isDragging ? "dragging" : ""}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        ⋮⋮
      </div>

      <div className="exercise-content">
        {editingId === exercise.id ? (
          <input
            type="text"
            className="exercise-name-input"
            value={exercise.name}
            onChange={(e) =>
              updateExercise(exercise.id, { name: e.target.value })
            }
            onBlur={() => setEditingId(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingId(null);
            }}
            autoFocus
          />
        ) : (
          <div
            className="exercise-name"
            onClick={() => setEditingId(exercise.id)}
          >
            {exercise.name}
          </div>
        )}

        <input
          type="text"
          className="exercise-time"
          value={formatTime(exercise.time)}
          onChange={(e) =>
            updateExercise(exercise.id, { time: parseTime(e.target.value) })
          }
          placeholder="0:00"
        />
      </div>

      <button
        className="delete-btn"
        onClick={() => deleteExercise(exercise.id)}
        title="Delete"
      >
        ×
      </button>
    </div>
  );
}
