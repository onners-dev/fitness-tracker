import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exerciseLibraryService } from '../services/workoutApi.js';
import { workoutPlanService } from '../services/workoutPlanService.js';
import './WorkoutPlanEdit.css';

const WorkoutPlanEdit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Core State
    const [planDetails, setPlanDetails] = useState({
        name: '',
        fitnessGoal: '',
        workoutDays: [],
        selectedExercises: {}
    });

    const [selectedDay, setSelectedDay] = useState(null);

    // Exercise Library State
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

    // Load existing plan data
    useEffect(() => {
        const loadPlan = async () => {
            try {
                setLoading(true);
                const planId = location.state?.planId;
                
                if (!planId) {
                    throw new Error('No plan ID provided');
                }
    
                const planData = await workoutPlanService.getWorkoutPlanDetails(planId);
                console.log('Loaded plan data:', planData);
                
                // Transform the plan data using the correct lowercase field names
                const transformedPlan = {
                    name: planData.planname,             // Changed from planName to planname
                    fitnessGoal: planData.fitnessgoal,   // Changed from fitnessGoal to fitnessgoal
                    activityLevel: planData.activitylevel, // Changed from activityLevel to activitylevel
                    workoutDays: Object.keys(planData.workouts || {}),
                    selectedExercises: planData.workouts || {}
                };
    
                console.log('Setting transformed plan:', transformedPlan);
                setPlanDetails(transformedPlan);
    
            } catch (error) {
                console.error('Error loading plan:', error);
                setError(error.message || 'Failed to load workout plan');
            } finally {
                setLoading(false);
            }
        };
    
        loadPlan();
    }, [location.state]);
    

    

    useEffect(() => {
        const fetchMuscles = async () => {
            try {
                const fetchedMuscles = await exerciseLibraryService.getMuscles();
                setMuscles(fetchedMuscles);
            } catch (error) {
                console.error('Failed to fetch muscles', error);
                setMuscles([
                    'Biceps', 'Triceps', 'Chest', 'Back', 
                    'Shoulders', 'Quadriceps', 'Hamstrings', 
                    'Calves', 'Abs'
                ]);
            }
        };

        fetchMuscles();
    }, []);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const muscle = filters.muscleGroup || null;
                const exercises = await exerciseLibraryService.getExercises(muscle, filters);
                setExerciseLibrary(exercises);
                setFilteredExercises(exercises);
            } catch (error) {
                console.error('Failed to fetch exercises', error);
            }
        };
    
        if (selectedDay) {
            fetchExercises();
        }
    }, [filters, selectedDay]);
    

    // Pagination functions
    const getPaginatedExercises = () => {
        const startIndex = (currentExercisePage - 1) * EXERCISES_PER_PAGE;
        const endIndex = startIndex + EXERCISES_PER_PAGE;
        return filteredExercises.slice(startIndex, endIndex);
    };

    const totalExercisePages = Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE);

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

    // Handler functions
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDaySelection = (day) => {
        setSelectedDay(prevDay => prevDay === day ? null : day);
        setFilters({
            muscleGroup: '',
            difficulty: '',
            equipment: ''
        });
    };

    const addExerciseToDay = (exercise) => {
        if (!selectedDay) return;

        setPlanDetails(prev => {
            const currentExercises = prev.selectedExercises[selectedDay] || [];
            const exerciseExists = currentExercises.some(
                ex => ex.exercise_id === exercise.exercise_id
            );

            if (!exerciseExists) {
                return {
                    ...prev,
                    selectedExercises: {
                        ...prev.selectedExercises,
                        [selectedDay]: [
                            ...currentExercises,
                            {
                                ...exercise,
                                sets: 3,
                                reps: 10
                            }
                        ]
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
                [field]: parseInt(value) || 0
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

    // Copy/Paste functionality
    const copyExercisesFromDay = () => {
        if (!selectedDay || !planDetails.selectedExercises[selectedDay]) {
            alert('No exercises to copy');
            return;
        }

        const exercisesToCopy = planDetails.selectedExercises[selectedDay];
        localStorage.setItem('copiedExercises', JSON.stringify({
            sourceDay: selectedDay,
            exercises: exercisesToCopy
        }));
        
        alert(`Copied ${exercisesToCopy.length} exercises from ${selectedDay}`);
    };

    const pasteExercisesToDay = () => {
        if (!selectedDay) {
            alert('Select a target day to paste exercises');
            return;
        }

        const copiedData = JSON.parse(localStorage.getItem('copiedExercises') || '{}');
        
        if (!copiedData.exercises || copiedData.exercises.length === 0) {
            alert('No exercises to paste');
            return;
        }

        if (copiedData.sourceDay === selectedDay) {
            alert('Cannot paste to the same day');
            return;
        }

        setPlanDetails(prev => {
            const updatedSelectedExercises = {...prev.selectedExercises};
            const newExercises = copiedData.exercises.filter(copiedEx => 
                !((updatedSelectedExercises[selectedDay] || []).some(
                    existingEx => existingEx.exercise_id === copiedEx.exercise_id
                ))
            );

            updatedSelectedExercises[selectedDay] = [
                ...(updatedSelectedExercises[selectedDay] || []),
                ...newExercises
            ];

            return {
                ...prev,
                workoutDays: prev.workoutDays.includes(selectedDay) 
                    ? prev.workoutDays 
                    : [...prev.workoutDays, selectedDay],
                selectedExercises: updatedSelectedExercises
            };
        });

        alert(`Pasted exercises to ${selectedDay}`);
    };

    const handleSavePlan = async () => {
        try {
            if (!planDetails.name.trim()) {
                alert('Please enter a plan name');
                return;
            }
    
            const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            // Format the data to match the backend expectations
            const updatePayload = {
                plan_name: planDetails.name,          // Changed from name to plan_name
                fitness_goal: planDetails.fitnessGoal, // Changed from fitnessGoal to fitness_goal
                activity_level: planDetails.activityLevel || null,
                workouts: allDays.reduce((acc, day) => {
                    // Ensure each day exists in the workouts object
                    acc[day] = planDetails.selectedExercises[day] || [];
                    return acc;
                }, {})
            };
    
            console.log('Sending update payload:', updatePayload);
    
            await workoutPlanService.updateWorkoutPlan({
                plan_id: location.state.planId,
                ...updatePayload
            });
    
            alert('Workout plan updated successfully!');
            navigate('/workout-plans/existing');
        } catch (error) {
            console.error('Failed to update workout plan:', error);
            alert(`Failed to update plan: ${error.message}`);
        }
    };
    

    if (loading) {
        return <div className="loading-container">Loading workout plan...</div>;
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
        );
    }

    return (
        <div className="workout-plan-edit">
            {console.log('Rendering with planDetails:', planDetails)}
            <div className="plan-details-section">
                <input 
                    type="text" 
                    placeholder="Plan Name" 
                    value={planDetails.name || ''}  // Add fallback empty string
                    onChange={(e) => setPlanDetails(prev => ({
                        ...prev, 
                        name: e.target.value
                    }))}
                    className="plan-name-input"
                />
                
                <select 
                    value={planDetails.fitnessGoal || ''}  // Add fallback empty string
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
                                ${planDetails.selectedExercises[day]?.length > 0 ? 'has-exercises' : ''}
                            `}
                            onClick={() => handleDaySelection(day)}
                        >
                            {day}
                            {planDetails.selectedExercises[day]?.length > 0 && (
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
                        {muscles.map(muscle =>
                            typeof muscle === "string"
                            ? <option key={muscle} value={muscle}>{muscle}</option>
                            : <option key={muscle.muscle_id} value={muscle.name}>{muscle.name}</option>
                        )}
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
                        {planDetails.selectedExercises[selectedDay]?.map((exercise, index) => (
                            <div key={exercise.exercise_id} className="selected-exercise">
                                <div className="exercise-info">
                                    <span className="exercise-name">{exercise.name}</span>
                                    <div className="exercise-volume">
                                        <div className="sets-input">
                                            <span className="input-label">Sets</span>
                                            <input 
                                                type="number" 
                                                value={exercise.sets} 
                                                onChange={(e) => updateExerciseDetail(index, 'sets', e.target.value)}
                                            />
                                        </div>
                                        <div className="reps-input">
                                            <span className="input-label">Reps</span>
                                            <input 
                                                type="number" 
                                                value={exercise.reps} 
                                                onChange={(e) => updateExerciseDetail(index, 'reps', e.target.value)}
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
            <button 
                onClick={handleSavePlan}
                disabled={!planDetails.name}
                className="save-plan-btn"
            >
                Save Changes
            </button>
            <button 
                onClick={() => navigate('/workout-plans/existing')}
                className="cancel-btn"
            >
                Cancel
            </button>
        </div>
    </div>
);
};

export default WorkoutPlanEdit;
