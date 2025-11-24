import React, { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { exerciseLibraryService } from '../services/workoutApi.js'
import { workoutPlanService } from '../services/workoutPlanService.js'
import type { Exercise, Muscle } from '../services/workoutApi.js'
import './WorkoutPlanEdit.css'


interface PlanDetails {
  name: string
  fitnessGoal: string
  activityLevel?: string
  workoutDays: string[]
  selectedExercises: Record<string, Exercise[]>
}

interface Filters {
    muscleGroup: string
    difficulty: string
    equipment: string
    [key: string]: string
}

interface LocationState {
  planId?: string
}

const EXERCISES_PER_PAGE = 8

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced']
const equipmentOptions = [
  'Bodyweight',
  'Dumbbells',
  'Barbell',
  'Kettlebell',
  'Resistance Bands',
  'Machine',
  'Cable',
  'No Equipment'
]
const fitnessGoals = [
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'endurance', label: 'Endurance' }
]
const allDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const WorkoutPlanEdit: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const planId = (location.state as LocationState | undefined)?.planId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    name: '',
    fitnessGoal: '',
    activityLevel: '',
    workoutDays: [],
    selectedExercises: {}
  })

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [filters, setFilters] = useState<Filters>({
    muscleGroup: '',
    difficulty: '',
    equipment: ''
  })
  const [currentExercisePage, setCurrentExercisePage] = useState(1)
  const [muscles, setMuscles] = useState<Array<Muscle | string>>([])

  useEffect(() => {
    const loadPlan = async () => {
      try {
        setLoading(true)
        if (!planId) throw new Error('No plan ID provided')
        const planData = await workoutPlanService.getWorkoutPlanDetails(planId)

        const transformedPlan: PlanDetails = {
          name: planData.planname,
          fitnessGoal: planData.fitnessgoal,
          activityLevel: planData.activitylevel,
          workoutDays: Object.keys(planData.workouts || {}),
          selectedExercises: planData.workouts || {}
        }
        setPlanDetails(transformedPlan)
      } catch (error: any) {
        setError(error.message || 'Failed to load workout plan')
      } finally {
        setLoading(false)
      }
    }
    loadPlan()
  }, [planId])

  useEffect(() => {
    const fetchMuscles = async () => {
      try {
        const fetchedMuscles = await exerciseLibraryService.getMuscles()
        setMuscles(fetchedMuscles)
      } catch {
        setMuscles([
          'Biceps',
          'Triceps',
          'Chest',
          'Back',
          'Shoulders',
          'Quadriceps',
          'Hamstrings',
          'Calves',
          'Abs'
        ])
      }
    }
    fetchMuscles()
  }, [])

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const muscle = filters.muscleGroup || null
        const exercises = await exerciseLibraryService.getExercises(muscle, filters)
        setExerciseLibrary(exercises)
        setFilteredExercises(exercises)
      } catch {}
    }
    if (selectedDay) {
      fetchExercises()
    }
  }, [filters, selectedDay])

  const getPaginatedExercises = (): Exercise[] => {
    const startIndex = (currentExercisePage - 1) * EXERCISES_PER_PAGE
    const endIndex = startIndex + EXERCISES_PER_PAGE
    return filteredExercises.slice(startIndex, endIndex)
  }

  const totalExercisePages = Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE)

  const goToNextPage = () => {
    if (currentExercisePage < totalExercisePages) {
      setCurrentExercisePage(prev => prev + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentExercisePage > 1) {
      setCurrentExercisePage(prev => prev - 1)
    }
  }

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDaySelection = (day: string) => {
    setSelectedDay(prevDay => (prevDay === day ? null : day))
    setFilters({
      muscleGroup: '',
      difficulty: '',
      equipment: ''
    })
  }

  const addExerciseToDay = (exercise: Exercise) => {
    if (!selectedDay) return
    setPlanDetails(prev => {
      const currentExercises = Array.isArray(prev.selectedExercises[selectedDay])
        ? prev.selectedExercises[selectedDay]
        : []
      const exerciseExists = currentExercises.some(ex => ex.exercise_id === exercise.exercise_id)
      if (!exerciseExists) {
        return {
          ...prev,
          selectedExercises: {
            ...prev.selectedExercises,
            [selectedDay]: [
              ...currentExercises,
              { ...exercise, sets: 3, reps: 10 }
            ]
          }
        }
      }
      return prev
    })
  }

  const removeExerciseFromDay = (exerciseId: string) => {
    if (!selectedDay) return
    setPlanDetails(prev => {
      const existing = Array.isArray(prev.selectedExercises[selectedDay])
        ? prev.selectedExercises[selectedDay]
        : []
      return {
        ...prev,
        selectedExercises: {
          ...prev.selectedExercises,
          [selectedDay]: existing.filter(ex => ex.exercise_id !== exerciseId)
        }
      }
    })
  }

  const updateExerciseDetail = (
    index: number,
    field: keyof Exercise,
    value: string
  ) => {
    if (!selectedDay) return
    setPlanDetails(prev => {
      const dayExercises = Array.isArray(prev.selectedExercises[selectedDay])
        ? prev.selectedExercises[selectedDay]
        : []
      if (!dayExercises[index]) return prev
      const updated = [
        ...dayExercises.slice(0, index),
        { ...dayExercises[index], [field]: parseInt(value, 10) || 0 },
        ...dayExercises.slice(index + 1)
      ]
      return {
        ...prev,
        selectedExercises: {
          ...prev.selectedExercises,
          [selectedDay]: updated
        }
      }
    })
  }

  const copyExercisesFromDay = () => {
    if (!selectedDay) return
    const exercisesToCopy = Array.isArray(planDetails.selectedExercises[selectedDay])
      ? planDetails.selectedExercises[selectedDay]
      : []
    if (exercisesToCopy.length === 0) {
      alert('No exercises to copy')
      return
    }
    localStorage.setItem(
      'copiedExercises',
      JSON.stringify({
        sourceDay: selectedDay,
        exercises: exercisesToCopy
      })
    )
    alert(`Copied ${exercisesToCopy.length} exercises from ${selectedDay}`)
  }

  const pasteExercisesToDay = () => {
    if (!selectedDay) {
      alert('Select a target day to paste exercises')
      return
    }
    const copiedData = JSON.parse(localStorage.getItem('copiedExercises') || '{}')
    if (!copiedData.exercises || copiedData.exercises.length === 0) {
      alert('No exercises to paste')
      return
    }
    if (copiedData.sourceDay === selectedDay) {
      alert('Cannot paste to the same day')
      return
    }
    setPlanDetails(prev => {
      const updatedSelectedExercises = { ...prev.selectedExercises }
      const existing = Array.isArray(updatedSelectedExercises[selectedDay])
        ? updatedSelectedExercises[selectedDay]
        : []
      const newExercises = copiedData.exercises.filter(
        (copiedEx: Exercise) =>
          !existing.some((existingEx: Exercise) => existingEx.exercise_id === copiedEx.exercise_id)
      )
      updatedSelectedExercises[selectedDay] = [...existing, ...newExercises]
      return {
        ...prev,
        workoutDays: prev.workoutDays.includes(selectedDay)
          ? prev.workoutDays
          : [...prev.workoutDays, selectedDay],
        selectedExercises: updatedSelectedExercises
      }
    })
    alert(`Pasted exercises to ${selectedDay}`)
  }

  const handleSavePlan = async () => {
    try {
      if (!planId) {
        alert('No plan id provided')
        return
      }
      if (!planDetails.name.trim()) {
        alert('Please enter a plan name')
        return
      }
      const updatePayload = {
        plan_name: planDetails.name,
        fitness_goal: planDetails.fitnessGoal,
        activity_level: planDetails.activityLevel || '',
        workouts: allDays.reduce((acc, day) => {
          acc[day] = Array.isArray(planDetails.selectedExercises[day])
            ? planDetails.selectedExercises[day]
            : []
          return acc
        }, {} as Record<string, Exercise[]>)
      }
      await workoutPlanService.updateWorkoutPlan({
        plan_id: planId,
        ...updatePayload
      })
      alert('Workout plan updated successfully!')
      navigate('/workout-plans/existing')
    } catch (error: any) {
      alert(`Failed to update plan: ${error.message}`)
    }
  }
  

  if (loading) {
    return <div className="loading-container">Loading workout plan...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/workout-plans/existing')}>
          Return to Plans
        </button>
      </div>
    )
  }

  return (
    <div className="workout-plan-edit">
      <div className="plan-details-section">
        <input
          type="text"
          placeholder="Plan Name"
          value={planDetails.name || ''}
          onChange={e =>
            setPlanDetails(prev => ({
              ...prev,
              name: e.target.value
            }))
          }
          className="plan-name-input"
        />

        <select
          value={planDetails.fitnessGoal || ''}
          onChange={e =>
            setPlanDetails(prev => ({
              ...prev,
              fitnessGoal: e.target.value
            }))
          }
          className="fitness-goal-select"
        >
          <option value="">Select Fitness Goal</option>
          {fitnessGoals.map(goal => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
      </div>

      <div className="workout-days">
        {allDays.map(day => (
          <button
            key={day}
            className={`day-btn${selectedDay === day ? ' selected' : ''}`}
            onClick={() => handleDaySelection(day)}
            type="button"
          >
            {day}
            {(Array.isArray(planDetails.selectedExercises[day]) && planDetails.selectedExercises[day].length > 0) && (
              <span
                className="day-completed-checkmark"
                title={`${planDetails.selectedExercises[day].length} exercises added`}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>


      {selectedDay && (
        <>
          <div className="copy-paste-section">
            <div className="copy-paste-actions">
              <button onClick={copyExercisesFromDay} className="copy-paste-btn">
                📋 Copy Exercises from {selectedDay}
              </button>
              <button onClick={pasteExercisesToDay} className="copy-paste-btn">
                📝 Paste Exercises to {selectedDay}
              </button>
            </div>
          </div>

          <div className="exercise-filters">
            <select
              name="muscleGroup"
              value={filters.muscleGroup}
              onChange={handleFilterChange}
            >
              <option value="">All Muscles</option>
              {muscles.map(muscle =>
                typeof muscle === 'string' ? (
                  <option key={muscle} value={muscle}>
                    {muscle}
                  </option>
                ) : (
                  <option key={muscle.muscle_id} value={muscle.name}>
                    {muscle.name}
                  </option>
                )
              )}
            </select>
            <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange}>
              <option value="">All Difficulties</option>
              {difficultyLevels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <select name="equipment" value={filters.equipment} onChange={handleFilterChange}>
              <option value="">All Equipment</option>
              {equipmentOptions.map(equipment => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </select>
          </div>

          <div className="exercise-selection">
            <div className="available-exercises">
              <h3>Available Exercises</h3>
              <div className="exercise-grid">
                {getPaginatedExercises().map(exercise => (
                  <div key={exercise.exercise_id} className="exercise-item">
                    <h4>{exercise.name}</h4>
                    <p>Difficulty: {exercise.difficulty}</p>
                    <p>Equipment: {exercise.equipment}</p>
                    <button onClick={() => addExerciseToDay(exercise)} className="add-to-day-btn">
                      Add to {selectedDay}
                    </button>
                  </div>
                ))}
              </div>

              {filteredExercises.length > EXERCISES_PER_PAGE && (
                <div className="exercise-pagination">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentExercisePage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentExercisePage} of {totalExercisePages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentExercisePage === totalExercisePages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="selected-exercises">
              <h3>Exercises for {selectedDay}</h3>
              {(Array.isArray(planDetails.selectedExercises[selectedDay])
                ? planDetails.selectedExercises[selectedDay]
                : []
              ).map((exercise, index) => (
                <div key={exercise.exercise_id} className="selected-exercise">
                  <div className="exercise-info">
                    <span className="exercise-name">{exercise.name}</span>
                    <div className="exercise-volume">
                      <div className="sets-input">
                        <span className="input-label">Sets</span>
                        <input
                          type="number"
                          value={exercise.sets ?? ''}
                          onChange={e => updateExerciseDetail(index, 'sets', e.target.value)}
                        />
                      </div>
                      <div className="reps-input">
                        <span className="input-label">Reps</span>
                        <input
                          type="number"
                          value={exercise.reps ?? ''}
                          onChange={e => updateExerciseDetail(index, 'reps', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeExerciseFromDay(exercise.exercise_id)}
                        className="remove-exercise-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="plan-actions">
        <button onClick={handleSavePlan} disabled={!planDetails.name} className="save-plan-btn">
          Save Changes
        </button>
        <button onClick={() => navigate('/workout-plans/existing')} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default WorkoutPlanEdit
