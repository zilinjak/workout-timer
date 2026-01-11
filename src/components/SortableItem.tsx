import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Exercise } from "../types";
import { formatTime, parseTime, getColorFromName } from "../utils";

interface SortableItemProps {
  exercise: Exercise;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  duplicateExercise: (id: string) => void;
}

export function SortableItem({
  exercise,
  editingId,
  setEditingId,
  updateExercise,
  deleteExercise,
  duplicateExercise,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      e.preventDefault();
      duplicateExercise(exercise.id);
    }
  };

  const exerciseColor = getColorFromName(exercise.name);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: `4px solid ${exerciseColor}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`exercise-item ${isDragging ? "dragging" : ""}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
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
