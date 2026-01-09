import { useState } from 'react'
import './App.css'

interface Exercise {
  id: string
  name: string
  time: number // in seconds
}

function App() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Warm Up', time: 300 },
    { id: '2', name: 'Push Ups', time: 60 },
    { id: '3', name: 'Rest', time: 30 },
    { id: '4', name: 'Squats', time: 60 },
  ])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newExercises = [...exercises]
    const draggedItem = newExercises[draggedIndex]
    newExercises.splice(draggedIndex, 1)
    newExercises.splice(index, 0, draggedItem)

    setExercises(newExercises)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
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
      
      <div className="exercises-list">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={`exercise-item ${draggedIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="drag-handle">⋮⋮</div>
            
            <div className="exercise-content">
              {editingId === exercise.id ? (
                <input
                  type="text"
                  className="exercise-name-input"
                  value={exercise.name}
                  onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
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
                onChange={(e) => updateExercise(exercise.id, { time: parseTime(e.target.value) })}
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
        ))}
      </div>

      <button className="add-btn" onClick={addExercise}>
        + Add Exercise
      </button>

      <div className="total-time">
        Total Time: {formatTime(exercises.reduce((sum, ex) => sum + ex.time, 0))}
      </div>
    </div>
  )
}

export default App
