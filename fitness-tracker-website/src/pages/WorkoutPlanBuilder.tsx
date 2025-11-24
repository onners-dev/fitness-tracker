import React, { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { exerciseLibraryService } from '../services/workoutApi.js'
import { workoutPlanService } from '../services/workoutPlanService.js'
import './WorkoutPlanBuilder.css'

type Muscle = {
  muscle_id?: number | string
  name: string
}

type Exercise = {
  exercise_id: string
  name: string
  difficulty?: string
  equipment?: string
}

type ExerciseWithSetsReps = Exercise & {
  sets: number
  reps: number
}

type SelectedExercises = {
  [day: string]: ExerciseWithSetsReps[]
}

type PlanDetails = {
  name: string
  fitnessGoal: string
  workoutDays: string[]
  selectedExercises: SelectedExercises
}

type Filters = {
  muscleGroup: string
  difficulty: string
  equipment: string
}

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced']
const equipmentOptions = [
  'Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell',
  'Resistance Bands', 'Machine', 'Cable', 'No Equipment'
]
const fitnessGoals = [
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'endurance', label: 'Endurance' }
]
const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const EXERCISES_PER_PAGE = 8

const WorkoutPlanBuilder: React.FC = () => {
  const navigate = useNavigate()

  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    name: '',
    fitnessGoal: '',
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
  const [currentExercisePage, setCurrentExercisePage] = useState<number>(1)
  const [muscles, setMuscles] = useState<Muscle[]>([])

  const getPaginatedExercises = (): Exercise[] => {
    const startIndex = (currentExercisePage - 1) * EXERCISES_PER_PAGE
    const endIndex = startIndex + EXERCISES_PER_PAGE
    return filteredExercises.slice(startIndex, endIndex)
  }

  const totalExercisePages = Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE)
  const goToNextPage = () => {
    if (currentExercisePage < totalExercisePages) setCurrentExercisePage(prev => prev + 1)
  }
  const goToPreviousPage = () => {
    if (currentExercisePage > 1) setCurrentExercisePage(prev => prev - 1)
  }

  useEffect(() => {
    setCurrentExercisePage(1)
  }, [filters])

  useEffect(() => {
    const fetchMuscles = async () => {
      try {
        const fetchedMuscles = await exerciseLibraryService.getMuscles()
        setMuscles(fetchedMuscles)
      } catch {
        setMuscles([
          { name: 'Biceps' }, { name: 'Triceps' }, { name: 'Chest' },
          { name: 'Back' }, { name: 'Shoulders' }, { name: 'Quadriceps' },
          { name: 'Hamstrings' }, { name: 'Calves' }, { name: 'Abs' }
        ])
      }
    }
    fetchMuscles()
  }, [])

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { muscleGroup, ...restFilters } = filters
        const muscle = muscleGroup || null
        const exercises: Exercise[] = await exerciseLibraryService.getExercises(muscle, restFilters)
        setExerciseLibrary(exercises)
        setFilteredExercises(exercises)
      } catch {
        setExerciseLibrary([])
        setFilteredExercises([])
      }
    }
    if (selectedDay) fetchExercises()
  }, [filters, selectedDay])

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleDaySelection = (day: string) => {
    setSelectedDay(day)
    setPlanDetails(prev => {
      if (prev.selectedExercises[day]) return prev
      return {
        ...prev,
        selectedExercises: {
          ...prev.selectedExercises,
          [day]: []
        }
      }
    })
    setFilters({
      muscleGroup: '',
      difficulty: '',
      equipment: ''
    })
  }
  

  const addExerciseToDay = (exercise: Exercise) => {
    if (!selectedDay) return
    setPlanDetails(prev => {
      const currentDayExercises = prev.selectedExercises[selectedDay] ?? []
      const exerciseExists = currentDayExercises.some(ex => ex.exercise_id === exercise.exercise_id)
      if (!exerciseExists) {
        const updatedExercises = [
          ...currentDayExercises,
          { ...exercise, sets: 3, reps: 10 }
        ]
        return {
          ...prev,
          selectedExercises: {
            ...prev.selectedExercises,
            [selectedDay]: updatedExercises
          }
        }
      }
      return prev
    })
  }

  const removeExerciseFromDay = (exerciseId: string) => {
    if (!selectedDay) return
    setPlanDetails(prev => ({
      ...prev,
      selectedExercises: {
        ...prev.selectedExercises,
        [selectedDay]: (prev.selectedExercises[selectedDay] ?? []).filter(
          ex => ex.exercise_id !== exerciseId
        )
      }
    }))
  }

  const updateExerciseDetail = (
    index: number,
    field: keyof ExerciseWithSetsReps,
    value: string
  ) => {
    if (!selectedDay) return
    setPlanDetails(prev => {
      const exercises = [...(prev.selectedExercises[selectedDay] ?? [])]
      if (!exercises[index]) return prev
      exercises[index] = {
        ...exercises[index],
        [field]: field === 'sets' || field === 'reps' ? Number(value) : value
      }
      return {
        ...prev,
        selectedExercises: {
          ...prev.selectedExercises,
          [selectedDay]: exercises
        }
      }
    })
  }

  const copyExercisesFromDay = () => {
    if (!selectedDay) {
      alert('No exercises to copy')
      return
    }
    const exercisesToCopy = planDetails.selectedExercises[selectedDay] ?? []
    if (exercisesToCopy.length === 0) {
      alert('No exercises to copy')
      return
    }
    localStorage.setItem('copiedExercises', JSON.stringify({
      sourceDay: selectedDay,
      exercises: exercisesToCopy
    }))
    alert(`Copied ${exercisesToCopy.length} exercises from ${selectedDay}`)
  }

  const pasteExercisesToDay = () => {
    if (!selectedDay) {
      alert('Select a target day to paste exercises')
      return
    }
    const copiedDataRaw = localStorage.getItem('copiedExercises')
    if (!copiedDataRaw) {
      alert('No exercises to paste')
      return
    }
    const copiedData = JSON.parse(copiedDataRaw) as { sourceDay: string; exercises: ExerciseWithSetsReps[] }
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
      const newExercises = copiedData.exercises.filter(copiedEx =>
        !(updatedSelectedExercises[selectedDay] ?? []).some(
          existingEx => existingEx.exercise_id === copiedEx.exercise_id
        )
      )
      updatedSelectedExercises[selectedDay] = [
        ...(updatedSelectedExercises[selectedDay] ?? []),
        ...newExercises
      ]
      return {
        ...prev,
        workoutDays: prev.workoutDays.includes(selectedDay)
          ? prev.workoutDays
          : [...prev.workoutDays, selectedDay],
        selectedExercises: updatedSelectedExercises
      }
    })
    alert(`Pasted ${copiedData.exercises.length} exercises to ${selectedDay}`)
  }

  const handleSavePlan = async () => {
    if (!planDetails.name.trim()) {
      alert('Please enter a plan name')
      return
    }
    if (!planDetails.fitnessGoal) {
      alert('Please select a fitness goal')
      return
    }
    const finalPlanDetails: PlanDetails = {
      ...planDetails,
      workoutDays: allDays,
      selectedExercises: allDays.reduce<SelectedExercises>((acc, day) => {
        acc[day] = planDetails.selectedExercises[day] ?? []
        return acc
      }, {})
    }
    try {
      await workoutPlanService.createCustomWorkoutPlan(finalPlanDetails)
      alert('Workout plan saved successfully!')
      navigate('/workout-plans/existing')
    } catch (error: any) {
      alert(`Failed to save plan: ${error.message}`)
    }
  }

  return (
    <div className="workout-plan-builder">
      <div className="plan-details-section">
        <input
          type="text"
          placeholder="Plan Name"
          value={planDetails.name}
          onChange={e => setPlanDetails(prev => ({
            ...prev,
            name: e.target.value
          }))}
          className="plan-name-input"
        />

        <select
          value={planDetails.fitnessGoal}
          onChange={e => setPlanDetails(prev => ({
            ...prev,
            fitnessGoal: e.target.value
          }))}
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
            {(planDetails.selectedExercises[day] ?? []).length > 0 && (
              <span
                className="day-completed-checkmark"
                title={`${(planDetails.selectedExercises[day] ?? []).length} exercises added`}
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
              <button
                onClick={copyExercisesFromDay}
                className="copy-paste-btn"
              >
                📋 Copy Exercises from {selectedDay}
              </button>
              <button
                onClick={pasteExercisesToDay}
                className="copy-paste-btn"
              >
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
                <option key={muscle.muscle_id ?? muscle.name} value={muscle.name}>
                  {muscle.name}
                </option>
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
                {getPaginatedExercises().map((exercise) => (
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
              {(planDetails.selectedExercises[selectedDay] ?? []).map((exercise, index) => (
                <div key={exercise.exercise_id} className="selected-exercise">
                  <div className="exercise-info">
                    <span className="exercise-name">{exercise.name}</span>
                    <div className="exercise-volume">
                      <div className="sets-input">
                        <span className="input-label">Sets</span>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={e => updateExerciseDetail(index, 'sets', e.target.value)}
                        />
                      </div>
                      <div className="reps-input">
                        <span className="input-label">Reps</span>
                        <input
                          type="number"
                          value={exercise.reps}
                          onChange={e => updateExerciseDetail(index, 'reps', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeExerciseFromDay(exercise.exercise_id)}
                        className="remove-exercise-btn"
                        type="button"
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
          disabled={!planDetails.name || planDetails.workoutDays.length === 0}
          className="save-plan-btn"
          type="button"
        >
          Save Workout Plan
        </button>
      </div>
    </div>
  )
}

export default WorkoutPlanBuilder
