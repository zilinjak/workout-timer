import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './App.css'

interface Exercise {
  id: string
  name: string
  time: number // in seconds
}

interface SortableItemProps {
  exercise: Exercise
  editingId: string | null
  setEditingId: (id: string | null) => void
  updateExercise: (id: string, updates: Partial<Exercise>) => void
  deleteExercise: (id: string) => void
  formatTime: (seconds: number) => string
  parseTime: (timeStr: string) => number
}

function SortableItem({
  exercise,
  editingId,
  setEditingId,
  updateExercise,
  deleteExercise,
  formatTime,
  parseTime,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`exercise-item ${isDragging ? 'dragging' : ''}`}
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
              if (e.key === 'Enter') setEditingId(null)
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
  )
}

function App() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Warm Up', time: 300 },
    { id: '2', name: 'Push Ups', time: 60 },
    { id: '3', name: 'Rest', time: 30 },
    { id: '4', name: 'Squats', time: 60 },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: 'New Exercise',
      time: 60,
    }
    setExercises([...exercises, newExercise])
  }

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id))
  }

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex))
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':')
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0
      const secs = parseInt(parts[1]) || 0
      return mins * 60 + secs
    }
    return parseInt(timeStr) || 0
  }

  return (
    <div className="app">
      <h1>Workout Timer</h1>

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
                formatTime={formatTime}
                parseTime={parseTime}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className="add-btn" onClick={addExercise}>
        + Add Exercise
      </button>

      <div className="total-time">
        Total Time:{' '}
        {formatTime(exercises.reduce((sum, ex) => sum + ex.time, 0))}
      </div>
    </div>
  )
}

export default App
