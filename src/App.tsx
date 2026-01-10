import { useState, useEffect, useRef } from 'react'
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

type TimerState = 'setup' | 'running' | 'paused' | 'finished'

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
  const [sets, setSets] = useState(3)
  const [betweenSetRest, setBetweenSetRest] = useState(0)
  const [timerState, setTimerState] = useState<TimerState>('setup')
  const [currentSet, setCurrentSet] = useState(1)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRestingBetweenSets, setIsRestingBetweenSets] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (timerState === 'running' && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            advanceToNext()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, timeRemaining])

  const advanceToNext = () => {
    if (isRestingBetweenSets) {
      // Finished resting, start the new set
      setCurrentExerciseIndex(0)
      setTimeRemaining(exercises[0].time)
      setIsRestingBetweenSets(false)
    } else if (currentExerciseIndex < exercises.length - 1) {
      // Move to next exercise in the current set
      setCurrentExerciseIndex((prev) => prev + 1)
      setTimeRemaining(exercises[currentExerciseIndex + 1].time)
      setIsRestingBetweenSets(false)
    } else if (currentSet < sets) {
      // Finished a set, check if we need rest
      if (betweenSetRest > 0) {
        setIsRestingBetweenSets(true)
        setTimeRemaining(betweenSetRest)
        setCurrentSet((prev) => prev + 1)
      } else {
        setCurrentSet((prev) => prev + 1)
        setCurrentExerciseIndex(0)
        setTimeRemaining(exercises[0].time)
        setIsRestingBetweenSets(false)
      }
    } else {
      // Finished all sets
      setTimerState('finished')
    }
  }

  const startWorkout = () => {
    if (exercises.length === 0) return
    setCurrentSet(1)
    setCurrentExerciseIndex(0)
    setTimeRemaining(exercises[0].time)
    setIsRestingBetweenSets(false)
    setTimerState('running')
  }

  const pauseWorkout = () => {
    setTimerState('paused')
  }

  const resumeWorkout = () => {
    setTimerState('running')
  }

  const handleHomeClick = () => {
    setShowQuitConfirm(true)
    setTimerState('paused')
  }

  const confirmQuit = () => {
    setTimerState('setup')
    setShowQuitConfirm(false)
    setCurrentSet(1)
    setCurrentExerciseIndex(0)
    setTimeRemaining(0)
    setIsRestingBetweenSets(false)
  }

  const cancelQuit = () => {
    setShowQuitConfirm(false)
    setTimerState('running')
  }

  const restartWorkout = () => {
    setTimerState('setup')
    setCurrentSet(1)
    setCurrentExerciseIndex(0)
    setTimeRemaining(0)
    setIsRestingBetweenSets(false)
  }

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: 'New Exercise',
      time: 10,
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

  const currentExercise = isRestingBetweenSets ? null : exercises[currentExerciseIndex]
  const nextExercise = isRestingBetweenSets
    ? exercises[0]
    : currentExerciseIndex < exercises.length - 1
    ? exercises[currentExerciseIndex + 1]
    : currentSet < sets && betweenSetRest > 0
    ? null
    : currentSet < sets
    ? exercises[0]
    : null

  const setTime = exercises.reduce((sum, ex) => sum + ex.time, 0)
  const totalTime = setTime * sets + (sets > 1 ? betweenSetRest * (sets - 1) : 0)

  if (timerState === 'setup') {
    return (
      <div className="app">
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
                <button onClick={() => setBetweenSetRest(Math.max(0, betweenSetRest - 15))}>−</button>
                <input
                  type="text"
                  className="rest-time-input"
                  value={formatTime(betweenSetRest)}
                  onChange={(e) => setBetweenSetRest(parseTime(e.target.value))}
                />
                <button onClick={() => setBetweenSetRest(betweenSetRest + 15)}>+</button>
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

        <button className="start-btn" onClick={startWorkout}>
          Start Workout
        </button>
      </div>
    )
  }

  if (timerState === 'finished') {
    return (
      <div className="app timer-view">
        <div className="finished-screen">
          <h1>🎉 Workout Complete!</h1>
          <p>Great job finishing {sets} set{sets > 1 ? 's' : ''}!</p>
          <button className="restart-btn" onClick={restartWorkout}>
            Back to Setup
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app timer-view">
      {showQuitConfirm && (
        <div className="quit-confirm-overlay">
          <div className="quit-confirm-dialog">
            <h2>Quit Workout?</h2>
            <p>Your progress will be lost</p>
            <div className="quit-confirm-buttons">
              <button className="confirm-yes" onClick={confirmQuit}>
                Yes, Quit
              </button>
              <button className="confirm-no" onClick={cancelQuit}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="timer-header">
        <button className="home-btn" onClick={handleHomeClick}>
          ← Home
        </button>
        <div className="set-indicator">
          Set {currentSet} of {sets}
        </div>
      </div>

      <div className="current-exercise">
        <div className="exercise-label">{isRestingBetweenSets ? 'Rest' : 'Current'}</div>
        <h1 className="exercise-name-large">
          {isRestingBetweenSets ? 'Rest Between Sets' : currentExercise?.name}
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
          <div className="next-label">Next Set</div>
          <div className="next-name">Starting Set {currentSet}</div>
        </div>
      )}

      <div className="timer-controls">
        {timerState === 'running' ? (
          <button className="pause-btn" onClick={pauseWorkout}>
            ⏸ Pause
          </button>
        ) : (
          <button className="resume-btn" onClick={resumeWorkout}>
            ▶ Resume
          </button>
        )}
      </div>
    </div>
  )
}

export default App
