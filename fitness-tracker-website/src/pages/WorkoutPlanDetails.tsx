import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './WorkoutPlanDetails.css'

interface Exercise {
  exercise_id: string
  name: string
  sets: number
  reps: number
  muscle_groups?: string[]
  description?: string
  instructions?: string
  equipment?: string
  difficulty?: string
  video_url?: string
}

interface WorkoutDay {
  day: string
  exercises: Exercise[]
}

interface WorkoutPlan {
  plan_id: string
  planName?: string
  fitnessGoal: string
  workoutDaysCount: number
  created_at: string
  workouts: WorkoutDay[]
}

interface LocationStateType {
  plan?: WorkoutPlan
}

const daysOrder = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const formatGoal = (goal: string) => {
  const goalMap: Record<string, string> = {
    muscle_gain: 'Muscle Gain',
    weight_loss: 'Weight Loss',
    maintenance: 'Weight Maintenance',
    endurance: 'Endurance Training'
  }
  return goalMap[goal] || goal
}

const WorkoutPlanDetails: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const plan = (location.state as LocationStateType | undefined)?.plan

  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<WorkoutDay | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  // If no plan is passed, redirect back
  useEffect(() => {
    if (!plan) {
      navigate('/workout-plans/existing')
    }
  }, [plan, navigate])

  if (!plan) return null

  // workoutsMap: Record<string, WorkoutDay>
  const workoutsMap: Record<string, WorkoutDay> = (plan.workouts || []).reduce(
    (acc: Record<string, WorkoutDay>, dayPlan) => {
      acc[dayPlan.day] = dayPlan
      return acc
    },
    {}
  )

  const openModal = (modalContent: { type: 'day' | 'exercise'; data: any }) => {
    document.body.classList.add('modal-open')
    if (modalContent.type === 'day') {
      setSelectedDayWorkouts(modalContent.data)
    } else if (modalContent.type === 'exercise') {
      setSelectedExercise(modalContent.data)
    }
  }

  const closeModal = () => {
    document.body.classList.remove('modal-open')
    setSelectedDayWorkouts(null)
    setSelectedExercise(null)
  }

  const handleDayClick = (dayPlan: WorkoutDay) => {
    openModal({ type: 'day', data: dayPlan })
  }

  const handleExerciseClick = (exercise: Exercise) => {
    openModal({ type: 'exercise', data: exercise })
  }

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    if (selectedDayWorkouts || selectedExercise) {
      document.addEventListener('keydown', handleEscapeKey)
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [selectedDayWorkouts, selectedExercise])

  return (
    <div className="workout-plan-details">
      <div className="plan-header">
        <h1>{plan.planName || `${formatGoal(plan.fitnessGoal)} Plan`}</h1>
        <div className="plan-summary">
          <p>
            <strong>Fitness Goal:</strong> {formatGoal(plan.fitnessGoal)}
          </p>
          <p>
            <strong>Workout Frequency:</strong> {plan.workoutDaysCount} days a week
          </p>
          <p>
            <strong>Created:</strong> {new Date(plan.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="workout-days-row">
        {daysOrder.map(day => {
          const dayPlan = workoutsMap[day] || { day, exercises: [] }
          return (
            <div
              key={day}
              className={`day-card ${dayPlan.exercises.length === 0 ? 'rest-day' : ''}`}
              onClick={() => handleDayClick(dayPlan)}
            >
              <h3>{day}</h3>
              <p>
                {dayPlan.exercises.length === 0
                  ? 'Rest'
                  : `${dayPlan.exercises.length} Exercise${dayPlan.exercises.length > 1 ? 's' : ''}`}
              </p>
            </div>
          )
        })}
      </div>

      {selectedDayWorkouts && (
        <div className="day-modal-overlay" onClick={closeModal}>
          <div className="day-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDayWorkouts.day}</h2>
              <button onClick={closeModal} className="close-modal-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              {selectedDayWorkouts.exercises.length === 0 ? (
                <p>Rest Day</p>
              ) : (
                <div className="day-exercises">
                  {selectedDayWorkouts.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={exercise.exercise_id || exerciseIndex}
                      className="exercise-card"
                      onClick={() => handleExerciseClick(exercise)}
                    >
                      <h3>{exercise.name}</h3>
                      <div className="exercise-details">
                        <p>
                          <strong>Sets:</strong> {exercise.sets}
                        </p>
                        <p>
                          <strong>Reps:</strong> {exercise.reps}
                        </p>
                        <p>
                          <strong>Muscle Groups:</strong>{' '}
                          {exercise.muscle_groups?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedExercise && (
        <div className="exercise-details-modal-overlay" onClick={closeModal}>
          <div className="exercise-details-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              ×
            </button>
            <h2>{selectedExercise.name}</h2>

            <div className="exercise-modal-details">
              <div className="detail-section">
                <h3>Exercise Information</h3>
                <p>
                  <strong>Equipment:</strong> {selectedExercise.equipment || 'N/A'}
                </p>
                <p>
                  <strong>Difficulty:</strong> {selectedExercise.difficulty || 'N/A'}
                </p>
                <p>
                  <strong>Muscle Groups:</strong>{' '}
                  {selectedExercise.muscle_groups?.join(', ') || 'N/A'}
                </p>
              </div>

              {selectedExercise.description && (
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedExercise.description}</p>
                </div>
              )}

              {selectedExercise.instructions && (
                <div className="detail-section">
                  <h3>Instructions</h3>
                  <p>{selectedExercise.instructions}</p>
                </div>
              )}

              {selectedExercise.video_url && (
                <div className="detail-section">
                  <h3>Video Tutorial</h3>
                  <a
                    href={selectedExercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Tutorial
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="plan-actions">
        <button
          onClick={() =>
            navigate('/workout-logging', {
              state: {
                source: 'existingPlans',
                planId: plan.plan_id
              }
            })
          }
          className="start-workout-btn"
        >
          Start Workout
        </button>
        <button
          onClick={() =>
            navigate('/workout-plans/edit', {
              state: {
                planId: plan.plan_id
              }
            })
          }
          className="edit-plan-btn"
        >
          Edit Plan
        </button>
        <button onClick={() => navigate('/workout-plans/existing')} className="back-btn">
          Back to Plans
        </button>
      </div>
    </div>
  )
}

export default WorkoutPlanDetails
