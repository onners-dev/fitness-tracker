import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exerciseLibraryService, workoutPlanService } from '../services/workoutApi';
import './WorkoutPlanBuilder.css';

const WorkoutPlanBuilder = () => {
  const navigate = useNavigate();
  const [planDetails, setPlanDetails] = useState({
    name: '',
    fitnessGoal: '',
    workoutDays: [],
    selectedExercises: {}
  });

  const [selectedDay, setSelectedDay] = useState(null);

  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [filters, setFilters] = useState({
    muscleGroup: '',
    difficulty: '',
    equipment: ''
  });

  // Pagination state
  const [currentExercisePage, setCurrentExercisePage] = useState(1);
  const EXERCISES_PER_PAGE = 8;

  // Replace muscleGroups with muscles
  const [muscles, setMuscles] = useState([]);

  // Predefined static lists
  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const equipmentOptions = [
    'Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell', 
    'Resistance Bands', 'Machine', 'Cable', 'No Equipment'
  ];
  const fitnessGoals = [
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'endurance', label: 'Endurance' }
  ];

  // Compute paginated exercises
  const getPaginatedExercises = () => {
    const startIndex = (currentExercisePage - 1) * EXERCISES_PER_PAGE;
    const endIndex = startIndex + EXERCISES_PER_PAGE;
    return filteredExercises.slice(startIndex, endIndex);
  };

  // Compute total pages
  const totalExercisePages = Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE);

  // Page navigation handlers
  const goToNextPage = () => {
    if (currentExercisePage < totalExercisePages) {
      setCurrentExercisePage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentExercisePage > 1) {
      setCurrentExercisePage(prev => prev - 1);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentExercisePage(1);
  }, [filters]);

  // Fetch muscles when component mounts
  useEffect(() => {
    const fetchMuscles = async () => {
      try {
        const fetchedMuscles = await exerciseLibraryService.getMuscles();
        setMuscles(fetchedMuscles);
      } catch (error) {
        console.error('Failed to fetch muscles', error);
        // Fallback muscles
        setMuscles([
          'Biceps', 'Triceps', 'Chest', 'Back', 
          'Shoulders', 'Quadriceps', 'Hamstrings', 
          'Calves', 'Abs'
        ]);
      }
    };

    fetchMuscles();
  }, []);

  // Fetch exercises based on filters
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        console.log('Fetching exercises with filters:', filters);
        
        const exercises = await exerciseLibraryService.getExercises(filters);
        
        console.log('Fetched exercises:', exercises);
        
        setExerciseLibrary(exercises);
        setFilteredExercises(exercises);
      } catch (error) {
        console.error('Failed to fetch exercises', error);
      }
    };

    // Only fetch if a day is selected
    if (selectedDay) {
      fetchExercises();
    }
  }, [filters, selectedDay]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating filter: ${name} = ${value}`);
    
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      console.log('New filters:', newFilters);
      return newFilters;
    });
  };

  const handleDaySelection = (day) => {
    setPlanDetails(prev => {
      // Ensure workoutDays is updated
      const updatedDays = prev.workoutDays.includes(day)
        ? prev.workoutDays.filter(d => d !== day)
        : [...prev.workoutDays, day];
      
      // Create a new selectedExercises object
      const updatedSelectedExercises = {...prev.selectedExercises};
      
      // If the day is being added, initialize an empty array for it
      if (!prev.selectedExercises[day]) {
        updatedSelectedExercises[day] = [];
      }

      return {
        ...prev,
        workoutDays: updatedDays,
        selectedExercises: updatedSelectedExercises
      };
    });

    // Reset filters when a new day is selected
    setFilters({
      muscleGroup: '',
      difficulty: '',
      equipment: ''
    });

    // Set or unset the selected day
    setSelectedDay(prevDay => prevDay === day ? null : day);
  };

  const addExerciseToDay = (exercise) => {
    if (!selectedDay) return;

    setPlanDetails(prev => {
      // Get current exercises for the selected day
      const currentDayExercises = prev.selectedExercises[selectedDay] || [];
      
      // Check if exercise already exists
      const exerciseExists = currentDayExercises.some(
        ex => ex.exercise_id === exercise.exercise_id
      );

      // If exercise doesn't exist, add it
      if (!exerciseExists) {
        const updatedExercises = [
          ...currentDayExercises,
          { 
            ...exercise, 
            sets: 3, 
            reps: 10 
          }
        ];

        console.log(`Adding exercise to ${selectedDay}:`, {
          exercise,
          currentExercises: currentDayExercises,
          updatedExercises
        });

        return {
          ...prev,
          selectedExercises: {
            ...prev.selectedExercises,
            [selectedDay]: updatedExercises
          }
        };
      }

      return prev;
    });
  };

  const removeExerciseFromDay = (exerciseId) => {
    if (!selectedDay) return;

    setPlanDetails(prev => ({
      ...prev,
      selectedExercises: {
        ...prev.selectedExercises,
        [selectedDay]: prev.selectedExercises[selectedDay].filter(
          ex => ex.exercise_id !== exerciseId
        )
      }
    }));
  };

  const updateExerciseDetail = (index, field, value) => {
    if (!selectedDay) return;

    setPlanDetails(prev => {
      const newExercises = [...prev.selectedExercises[selectedDay]];
      newExercises[index] = {
        ...newExercises[index],
        [field]: value
      };

      return {
        ...prev,
        selectedExercises: {
          ...prev.selectedExercises,
          [selectedDay]: newExercises
        }
      };
    });
  };

  const handleSavePlan = async () => {
    // Validate plan details
    if (!planDetails.name.trim()) {
      alert('Please enter a plan name');
      return;
    }

    if (!planDetails.fitnessGoal) {
      alert('Please select a fitness goal');
      return;
    }

    if (planDetails.workoutDays.length === 0) {
      alert('Please select at least one workout day');
      return;
    }

    try {
      const savedPlan = await workoutPlanService.createCustomWorkoutPlan(planDetails);
      alert('Workout plan saved successfully!');
      navigate('/workout-plans/existing');
    } catch (error) {
      console.error('Failed to save workout plan', error);
      alert(`Failed to save plan: ${error.message}`);
    }
  };

  return (
    <div className="workout-plan-builder">
      <div className="plan-details-section">
        <input 
          type="text" 
          placeholder="Plan Name" 
          value={planDetails.name}
          onChange={(e) => setPlanDetails(prev => ({
            ...prev, 
            name: e.target.value
          }))}
          className="plan-name-input"
        />
        
        <select 
          value={planDetails.fitnessGoal}
          onChange={(e) => setPlanDetails(prev => ({
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
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          .map(day => (
            <button 
              key={day}
              className={`
                ${planDetails.workoutDays.includes(day) ? 'active' : ''} 
                ${selectedDay === day ? 'selected' : ''}
                ${planDetails.selectedExercises[day] && 
                  planDetails.selectedExercises[day].length > 0 ? 'has-exercises' : ''}
              `}
              onClick={() => handleDaySelection(day)}
            >
              {day}
              {planDetails.selectedExercises[day] && 
               planDetails.selectedExercises[day].length > 0 && (
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
          <div className="exercise-filters">
            <select 
              name="muscleGroup"
              value={filters.muscleGroup}
              onChange={handleFilterChange}
            >
              <option value="">All Muscles</option>
              {muscles.map(muscle => (
                <option key={muscle} value={muscle}>{muscle}</option>
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

              {/* Pagination Controls */}
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
              {planDetails.selectedExercises[selectedDay]?.map((exercise, index) => (
                <div key={exercise.exercise_id} className="selected-exercise">
                  <span>{exercise.name}</span>
                  <div className="exercise-details">
                    <input 
                      type="number" 
                      value={exercise.sets} 
                      placeholder="Sets"
                      onChange={(e) => updateExerciseDetail(index, 'sets', e.target.value)}
                    />
                    <input 
                      type="number" 
                      value={exercise.reps} 
                      placeholder="Reps"
                      onChange={(e) => updateExerciseDetail(index, 'reps', e.target.value)}
                    />
                    <button 
                      onClick={() => removeExerciseFromDay(exercise.exercise_id)}
                      className="remove-exercise-btn"
                    >
                      Remove
                    </button>
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
        >
          Save Workout Plan
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlanBuilder;
