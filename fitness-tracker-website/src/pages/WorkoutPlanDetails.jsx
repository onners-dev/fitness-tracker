import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './WorkoutPlanDetails.css';

const WorkoutPlanDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const plan = location.state?.plan;
    const [selectedDayWorkouts, setSelectedDayWorkouts] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);

    // Predefined order of days to ensure all days are displayed
    const daysOrder = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
        'Friday', 'Saturday', 'Sunday'
    ];

    // Helper function to format fitness goal
    const formatGoal = (goal) => {
        const goalMap = {
            'muscle_gain': 'Muscle Gain',
            'weight_loss': 'Weight Loss',
            'maintenance': 'Weight Maintenance',
            'endurance': 'Endurance Training'
        };
        return goalMap[goal] || goal;
    };

    // If no plan is passed, redirect back
    if (!plan) {
        navigate('/workout-plans/existing');
        return null;
    }

    // Create a map of workouts for easy lookup
    const workoutsMap = plan.workouts.reduce((acc, dayPlan) => {
        acc[dayPlan.day] = dayPlan;
        return acc;
    }, {});

    const openModal = (modalContent) => {
        // Add body class to prevent scrolling
        document.body.classList.add('modal-open');
        
        // Set the modal content
        if (modalContent.type === 'day') {
            setSelectedDayWorkouts(modalContent.data);
            // DO NOT reset selectedExercise here
        } else if (modalContent.type === 'exercise') {
            setSelectedExercise(modalContent.data);
            // Keep the day modal open
        }
    };

    const closeModal = () => {
        // Remove body class to restore scrolling
        document.body.classList.remove('modal-open');
        
        // Clear modal content
        setSelectedDayWorkouts(null);
        setSelectedExercise(null);
    };

    const handleDayClick = (dayPlan) => {
        openModal({ type: 'day', data: dayPlan });
    };

    const handleExerciseClick = (exercise) => {
        openModal({ type: 'exercise', data: exercise });
    };

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        if (selectedDayWorkouts || selectedExercise) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [selectedDayWorkouts, selectedExercise]);

    

    return (
        <div className="workout-plan-details">
            <div className="plan-header">
                <h1>{plan.planName || `${formatGoal(plan.fitnessGoal)} Plan`}</h1>
                <div className="plan-summary">
                    <p><strong>Fitness Goal:</strong> {formatGoal(plan.fitnessGoal)}</p>
                    <p><strong>Workout Frequency:</strong> {plan.workoutDaysCount} days a week</p>
                    <p><strong>Created:</strong> {new Date(plan.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="workout-days-row">
                {daysOrder.map((day) => {
                    const dayPlan = workoutsMap[day] || { day, exercises: [] };
                    const isActiveDay = !!dayPlan.exercises.length;

                    return (
                        <div 
                            key={day} 
                            className={`day-card ${isActiveDay ? 'active-day' : 'rest-day'}`}
                            onClick={() => handleDayClick(dayPlan)}
                        >
                            <h3>{day}</h3>
                            <p>
                                {isActiveDay 
                                    ? `${dayPlan.exercises.length} Exercise${dayPlan.exercises.length > 1 ? 's' : ''}`
                                    : 'Rest'}
                            </p>
                        </div>
                    );
                })}
            </div>

            {selectedDayWorkouts && (
                <div className="day-modal-overlay" onClick={closeModal}>
                    <div className="day-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedDayWorkouts.day}</h2>
                            <button onClick={closeModal} className="close-modal-btn">&times;</button>
                        </div>
                        <div className="modal-content">
                            {selectedDayWorkouts.exercises.length === 0 ? (
                                <p>Rest Day</p>
                            ) : (
                                <div className="day-exercises">
                                    {selectedDayWorkouts.exercises.map((exercise, exerciseIndex) => (
                                        <div 
                                            key={exerciseIndex} 
                                            className="exercise-card"
                                            onClick={() => handleExerciseClick(exercise)}
                                        >
                                            <h3>{exercise.name}</h3>
                                            <div className="exercise-details">
                                                <p><strong>Sets:</strong> {exercise.sets}</p>
                                                <p><strong>Reps:</strong> {exercise.reps}</p>
                                                <p>
                                                    <strong>Muscle Groups:</strong> 
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
                    <div 
                        className="exercise-details-modal" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close-btn" onClick={closeModal}>×</button>
                        <h2>{selectedExercise.name}</h2>
                        
                        <div className="exercise-modal-details">
                            <div className="detail-section">
                                <h3>Exercise Information</h3>
                                <p><strong>Equipment:</strong> {selectedExercise.equipment}</p>
                                <p><strong>Difficulty:</strong> {selectedExercise.difficulty}</p>
                                <p><strong>Muscle Groups:</strong> {selectedExercise.muscle_groups?.join(', ')}</p>
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
                    onClick={() => navigate('/workout-logging', { 
                        state: { 
                            source: 'existingPlans', 
                            planId: plan.plan_id 
                        } 
                    })}
                    className="start-workout-btn"
                >
                    Start Workout
                </button>
                <button 
                    onClick={() => navigate('/workout-plans/edit', {
                        state: {
                            planId: plan.plan_id
                        }
                    })}
                    className="edit-plan-btn"
                >
                    Edit Plan
                </button>
                <button 
                    onClick={() => navigate('/workout-plans/existing')}
                    className="back-btn"
                >
                    Back to Plans
                </button>
            </div>
        </div>
    );
};

export default WorkoutPlanDetails;
