import React, { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { workoutPlanService } from '../services/workoutPlanService.js'
import { exerciseLibraryService } from '../services/workoutApi.js'
import type { Exercise, Muscle } from '../services/workoutApi.js'
import './WorkoutPlanGenerate.css'

interface WorkoutPlan {
  plan_id: string
  planName?: string
  fitnessGoal?: string
  activityLevel?: string
  workouts: Record<string, Exercise[]>
}

interface LocationState {
  planId?: string
  fitnessGoal?: string
  activityLevel?: string
  planName?: string
}

interface Filters {
    muscleGroup: string
    difficulty: string
    equipment: string
    [key: string]: string
}
  

const EXERCISES_PER_PAGE = 8

const fitnessGoals = [
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'endurance', label: 'Endurance' }
]

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
  { value: 'extremely_active', label: 'Extremely Active' }
]

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced']
const equipmentOptions = [
  'Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell',
  'Resistance Bands', 'Machine', 'Cable', 'No Equipment'
]

const WorkoutPlanGenerate: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    planId: initialPlanId,
    fitnessGoal: initialFitnessGoal,
    activityLevel: initialActivityLevel,
    planName: initialPlanName
  } = (location.state || {}) as LocationState

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [planName, setPlanName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [planId, setPlanId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [filters, setFilters] = useState<Filters>({
    muscleGroup: '',
    difficulty: '',
    equipment: ''
  })

  const [currentExercisePage, setCurrentExercisePage] = useState<number>(1)
  const [selectedFitnessGoal, setSelectedFitnessGoal] = useState<string>('')
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<string>('')

  const getPaginatedExercises = () => {
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

  useEffect(() => {
    setCurrentExercisePage(1)
  }, [filters])

  useEffect(() => {
    const fetchMuscles = async () => {
      try {
        const fetchedMuscles = await exerciseLibraryService.getMuscles()
        setMuscles(fetchedMuscles)
      } catch (error) {
        setMuscles([
          { muscle_id: 'biceps', name: 'Biceps' },
          { muscle_id: 'triceps', name: 'Triceps' },
          { muscle_id: 'chest', name: 'Chest' },
          { muscle_id: 'back', name: 'Back' },
          { muscle_id: 'shoulders', name: 'Shoulders' },
          { muscle_id: 'quadriceps', name: 'Quadriceps' },
          { muscle_id: 'hamstrings', name: 'Hamstrings' },
          { muscle_id: 'calves', name: 'Calves' },
          { muscle_id: 'abs', name: 'Abs' }
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

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDaySelection = (day: string) => {
    setSelectedDay(prevDay => prevDay === day ? null : day)
    setFilters({
      muscleGroup: '',
      difficulty: '',
      equipment: ''
    })
  }

  const addExerciseToDay = (exercise: Exercise) => {
    if (!selectedDay || !workoutPlan) return
    setWorkoutPlan(prev => {
      if (!prev) return prev

      // fallback to empty array if undefined
      const currentDayExercises = Array.isArray(prev.workouts[selectedDay]) ? prev.workouts[selectedDay] : []
      const exerciseExists = currentDayExercises.some(
        ex => ex.exercise_id === exercise.exercise_id
      )
      if (!exerciseExists) {
        const updatedWorkouts = {
          ...prev.workouts,
          [selectedDay]: [
            ...currentDayExercises,
            {
              ...exercise,
              sets: 3,
              reps: 10
            }
          ]
        }
        return {
          ...prev,
          workouts: updatedWorkouts
        }
      }
      return prev
    })
  }

  const copyExercisesFromDay = () => {
    if (!selectedDay || !workoutPlan) {
      alert('Please select a day first')
      return
    }
    const exercisesToCopy = Array.isArray(workoutPlan.workouts[selectedDay]) ? workoutPlan.workouts[selectedDay] : []
    localStorage.setItem('copiedExercises', JSON.stringify({
      sourceDay: selectedDay,
      exercises: exercisesToCopy
    }))
    alert(`Copied ${exercisesToCopy.length} exercises from ${selectedDay}`)
  }

  const pasteExercisesToDay = () => {
    if (!selectedDay) {
      alert('Please select a target day first')
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
    setWorkoutPlan(prev => {
      if (!prev) return prev
      const existingDay = Array.isArray(prev.workouts[selectedDay]) ? prev.workouts[selectedDay] : []
      const updatedWorkouts = {
        ...prev.workouts,
        [selectedDay]: [
          ...existingDay,
          ...copiedData.exercises
        ]
      }
      return { ...prev, workouts: updatedWorkouts }
    })
    alert(`Pasted exercises to ${selectedDay}`)
  }

  const handleSavePlan = async () => {
    try {
      setIsSaving(true)
      if (!planId || !workoutPlan) throw new Error('No plan ID available')
      if (!planName.trim()) throw new Error('Please provide a plan name')
      await workoutPlanService.generateWorkoutPlan({
        plan_id: planId,
        plan_name: planName.trim(),
        fitness_goal: selectedFitnessGoal,
        activity_level: selectedActivityLevel,
        workouts: workoutPlan.workouts
      })
      navigate('/workout-plans/existing')
    } catch (error: any) {
      setError(error.message || 'Failed to save workout plan')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const loadWorkoutPlan = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!initialPlanId) throw new Error('No plan ID provided')
        const planDetails = await workoutPlanService.getWorkoutPlanDetails(initialPlanId)
        setWorkoutPlan(planDetails)
        setPlanName(initialPlanName || planDetails.planName || '')
        setSelectedFitnessGoal(initialFitnessGoal || planDetails.fitnessGoal || '')
        setSelectedActivityLevel(initialActivityLevel || planDetails.activityLevel || '')
        setPlanId(initialPlanId)
      } catch (error: any) {
        setError(error.message || 'Failed to load workout plan')
      } finally {
        setLoading(false)
      }
    }
    if (location.state) {
      loadWorkoutPlan()
    }
  }, [location.state])

  // Safely update an exercise's sets or reps (no undefined errors)
  const updateExerciseDetail = (
    day: string,
    exerciseIndex: number,
    field: keyof Exercise,
    value: string
  ) => {
    setWorkoutPlan(prev => {
      if (!prev) return prev
      const dayExercises = Array.isArray(prev.workouts[day]) ? prev.workouts[day] : []
      if (!dayExercises[exerciseIndex]) return prev

      const updatedExercise: Exercise = {
        ...dayExercises[exerciseIndex],
        [field]: parseInt(value, 10) || 0
      }

      const updatedDayExercises: Exercise[] = [
        ...dayExercises.slice(0, exerciseIndex),
        updatedExercise,
        ...dayExercises.slice(exerciseIndex + 1)
      ]
      return {
        ...prev,
        workouts: {
          ...prev.workouts,
          [day]: updatedDayExercises
        }
      }
    })
  }

  // No undefined errors here
  const removeExercise = (day: string, exerciseIndex: number) => {
    setWorkoutPlan(prev => {
      if (!prev) return prev
      const exercisesArray = Array.isArray(prev.workouts[day]) ? prev.workouts[day] : []
      const updatedDayExercises = exercisesArray.filter((_, idx) => idx !== exerciseIndex)
      return {
        ...prev,
        workouts: {
          ...prev.workouts,
          [day]: updatedDayExercises
        }
      }
    })
  }

  if (loading) {
    return <div className="loading-container">Loading your workout plan...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/workout-plans')}>
          Return to Workout Plans
        </button>
      </div>
    )
  }

  if (!workoutPlan?.workouts) {
    return (
      <div className="error-container">
        <h2>No Plan Available</h2>
        <p>Unable to load workout plan data.</p>
        <button onClick={() => navigate('/workout-plans')}>
          Return to Workout Plans
        </button>
      </div>
    )
  }

  return (
    <div className="workout-plan-generate">
      <div className="plan-details-section">
        <input
          type="text"
          placeholder="Plan Name"
          value={planName}
          onChange={e => setPlanName(e.target.value)}
          className="plan-name-input"
        />
        <div className="plan-meta">
          <p>
            <strong>Fitness Goal:</strong>
            {fitnessGoals.find(g => g.value === selectedFitnessGoal)?.label || selectedFitnessGoal}
          </p>
          <p>
            <strong>Activity Level:</strong>
            {activityLevels.find(l => l.value === selectedActivityLevel)?.label || selectedActivityLevel}
          </p>
        </div>
      </div>
      <div className="workout-days">
        {workoutPlan && Object.keys(workoutPlan.workouts).map(day => {
          const exercisesArray = Array.isArray(workoutPlan.workouts[day]) ? workoutPlan.workouts[day] : []
          return (
            <button
              key={day}
              className={`
                ${selectedDay === day ? 'selected' : ''}
                ${exercisesArray.length > 0 ? 'has-exercises' : ''}
              `}
              onClick={() => handleDaySelection(day)}
            >
              {day}
              {exercisesArray.length > 0 && (
                <span
                  className="day-completed-checkmark"
                  title={`${exercisesArray.length} exercises added`}
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
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
              {muscles.map(muscle => (
                <option key={muscle.muscle_id} value={muscle.name}>{muscle.name}</option>
              ))}
            </select>
            <select
              name="difficulty"
              value={filters.difficulty}
              onChange={handleFilterChange}
            >
              <option value="">All Difficulties</option>
              {difficultyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <select
              name="equipment"
              value={filters.equipment}
              onChange={handleFilterChange}
            >
              <option value="">All Equipment</option>
              {equipmentOptions.map(equipment => (
                <option key={equipment} value={equipment}>{equipment}</option>
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
                    <button
                      onClick={() => addExerciseToDay(exercise)}
                      className="add-to-day-btn"
                    >
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
              {(Array.isArray(workoutPlan.workouts[selectedDay]) ? workoutPlan.workouts[selectedDay] : []).map((exercise, index) => (
                <div key={`${exercise.exercise_id}-${index}`} className="selected-exercise">
                  <div className="exercise-info">
                    <span className="exercise-name">{exercise.name}</span>
                    <div className="exercise-volume">
                      <div className="sets-input">
                        <span className="input-label">Sets</span>
                        <input
                          type="number"
                          value={exercise.sets || 0}
                          onChange={e => updateExerciseDetail(selectedDay, index, 'sets', e.target.value)}
                          min="1"
                          max="10"
                        />
                      </div>
                      <div className="reps-input">
                        <span className="input-label">Reps</span>
                        <input
                          type="number"
                          value={exercise.reps || 0}
                          onChange={e => updateExerciseDetail(selectedDay, index, 'reps', e.target.value)}
                          min="1"
                          max="100"
                        />
                      </div>
                      <button
                        onClick={() => removeExercise(selectedDay, index)}
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
        <button
          onClick={handleSavePlan}
          disabled={isSaving || !planName.trim()}
          className="save-plan-btn"
        >
          {isSaving ? 'Saving...' : 'Save Workout Plan'}
        </button>
      </div>
    </div>
  )
}

export default WorkoutPlanGenerate
