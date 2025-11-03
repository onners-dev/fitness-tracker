import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { workoutPlanService } from '../services/workoutPlanService.js';
import { exerciseLibraryService } from '../services/workoutApi.js';
import './WorkoutPlanGenerate.css';

const WorkoutPlanGenerate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Core State
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [planName, setPlanName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [planId, setPlanId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    // Exercise Library State
    const [exerciseLibrary, setExerciseLibrary] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [muscles, setMuscles] = useState([]);
    const [filters, setFilters] = useState({
        muscleGroup: '',
        difficulty: '',
        equipment: ''
    });

    // Pagination state
    const [currentExercisePage, setCurrentExercisePage] = useState(1);
    const EXERCISES_PER_PAGE = 8;
    
    // Plan Configuration State
    const [selectedFitnessGoal, setSelectedFitnessGoal] = useState('');
    const [selectedActivityLevel, setSelectedActivityLevel] = useState('');

    // Predefined Options
    const fitnessGoals = [
        { value: 'muscle_gain', label: 'Muscle Gain' },
        { value: 'weight_loss', label: 'Weight Loss' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'endurance', label: 'Endurance' }
    ];

    const activityLevels = [
        { value: 'sedentary', label: 'Sedentary' },
        { value: 'lightly_active', label: 'Lightly Active' },
        { value: 'moderately_active', label: 'Moderately Active' },
        { value: 'very_active', label: 'Very Active' },
        { value: 'extremely_active', label: 'Extremely Active' }
    ];

    const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const equipmentOptions = [
        'Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell', 
        'Resistance Bands', 'Machine', 'Cable', 'No Equipment'
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
                const muscle = filters.muscleGroup || null;
                const exercises = await exerciseLibraryService.getExercises(muscle, filters);
                console.log('Fetched exercises:', exercises);
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

        setWorkoutPlan(prev => {
            const currentDayExercises = prev.workouts[selectedDay] || [];
            const exerciseExists = currentDayExercises.some(
                ex => ex.exercise_id === exercise.exercise_id
            );

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
                };
                return {
                    ...prev,
                    workouts: updatedWorkouts
                };
            }
            return prev;
        });
    };

    const copyExercisesFromDay = () => {
        if (!selectedDay || !workoutPlan?.workouts[selectedDay]) {
            alert('Please select a day first');
            return;
        }

        const exercisesToCopy = workoutPlan.workouts[selectedDay];
        localStorage.setItem('copiedExercises', JSON.stringify({
            sourceDay: selectedDay,
            exercises: exercisesToCopy
        }));
        
        alert(`Copied ${exercisesToCopy.length} exercises from ${selectedDay}`);
    };

    const pasteExercisesToDay = () => {
        if (!selectedDay) {
            alert('Please select a target day first');
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

        setWorkoutPlan(prev => {
            const updatedWorkouts = { ...prev.workouts };
            updatedWorkouts[selectedDay] = [
                ...updatedWorkouts[selectedDay],
                ...copiedData.exercises
            ];
            return { ...prev, workouts: updatedWorkouts };
        });

        alert(`Pasted exercises to ${selectedDay}`);
    };

    const handleSavePlan = async () => {
        try {
            setIsSaving(true);
            
            if (!planId) {
                throw new Error('No plan ID available');
            }
    
            if (!planName.trim()) {
                throw new Error('Please provide a plan name');
            }
    
            console.log('Saving plan:', {
                planId,
                planName,
                fitnessGoal: selectedFitnessGoal,
                activityLevel: selectedActivityLevel
            });
    
            const updatedPlan = await workoutPlanService.generateWorkoutPlan({
                plan_id: planId,
                plan_name: planName.trim(),
                fitness_goal: selectedFitnessGoal,
                activity_level: selectedActivityLevel,
                workouts: workoutPlan.workouts
            });
    
            console.log('Plan updated successfully:', updatedPlan);
            navigate('/workout-plans/existing');
        } catch (error) {
            console.error('Error saving plan:', error);
            setError(error.message || 'Failed to save workout plan');
        } finally {
            setIsSaving(false);
        }
    };
    
    useEffect(() => {
        const loadWorkoutPlan = async () => {
            try {
                setLoading(true);
                setError(null);
    
                const { 
                    planId: initialPlanId, 
                    fitnessGoal, 
                    activityLevel, 
                    planName: initialPlanName 
                } = location.state || {};
    
                console.log('Received state:', location.state);
    
                if (!initialPlanId) {
                    throw new Error('No plan ID provided');
                }
    
                const planDetails = await workoutPlanService.getWorkoutPlanDetails(initialPlanId);
                console.log('Loaded plan details:', planDetails);
    
                setWorkoutPlan(planDetails);
                setPlanName(initialPlanName || planDetails.planName || '');
                setSelectedFitnessGoal(fitnessGoal || planDetails.fitnessGoal);
                setSelectedActivityLevel(activityLevel || planDetails.activityLevel);
                setPlanId(initialPlanId);
    
            } catch (error) {
                console.error('Error loading workout plan:', error);
                setError(error.message || 'Failed to load workout plan');
            } finally {
                setLoading(false);
            }
        };
    
        if (location.state) {
            loadWorkoutPlan();
        }
    }, [location.state]);

    const updateExerciseDetail = (day, exerciseIndex, field, value) => {
        setWorkoutPlan(prev => {
            if (!prev?.workouts?.[day]) return prev;
            
            const updatedWorkouts = {...prev.workouts};
            updatedWorkouts[day] = [...updatedWorkouts[day]];
            updatedWorkouts[day][exerciseIndex] = {
                ...updatedWorkouts[day][exerciseIndex],
                [field]: parseInt(value) || 0
            };
            
            return { ...prev, workouts: updatedWorkouts };
        });
    };

    const removeExercise = (day, exerciseIndex) => {
        setWorkoutPlan(prev => {
            if (!prev?.workouts?.[day]) return prev;
            
            const updatedWorkouts = {...prev.workouts};
            updatedWorkouts[day] = updatedWorkouts[day].filter((_, index) => index !== exerciseIndex);
            
            return { ...prev, workouts: updatedWorkouts };
        });
    };

    if (loading) {
        return <div className="loading-container">Loading your workout plan...</div>;
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
        );
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
        );
    }

    return (
        <div className="workout-plan-generate">
            <div className="plan-details-section">
                <input 
                    type="text" 
                    placeholder="Plan Name" 
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
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
                {Object.keys(workoutPlan.workouts).map(day => (
                    <button 
                        key={day}
                        className={`
                            ${selectedDay === day ? 'selected' : ''} 
                            ${workoutPlan.workouts[day].length > 0 ? 'has-exercises' : ''}
                        `}
                        onClick={() => handleDaySelection(day)}
                    >
                        {day}
                        {workoutPlan.workouts[day].length > 0 && (
                            <span 
                                className="day-completed-checkmark"
                                title={`${workoutPlan.workouts[day].length} exercises added`}
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
                            {workoutPlan.workouts[selectedDay]?.map((exercise, index) => (
                                <div key={`${exercise.exercise_id}-${index}`} className="selected-exercise">
                                    <div className="exercise-info">
                                        <span className="exercise-name">{exercise.name}</span>
                                        <div className="exercise-volume">
                                            <div className="sets-input">
                                                <span className="input-label">Sets</span>
                                                <input 
                                                    type="number" 
                                                    value={exercise.sets || 0} 
                                                    onChange={(e) => updateExerciseDetail(selectedDay, index, 'sets', e.target.value)}
                                                    min="1"
                                                    max="10"
                                                />
                                            </div>
                                            <div className="reps-input">
                                                <span className="input-label">Reps</span>
                                                <input 
                                                    type="number" 
                                                    value={exercise.reps || 0} 
                                                    onChange={(e) => updateExerciseDetail(selectedDay, index, 'reps', e.target.value)}
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
    );
};

export default WorkoutPlanGenerate;