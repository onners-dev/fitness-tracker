import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './WorkoutPlanDetails.css';

const WorkoutPlanDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const plan = location.state?.plan;

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

            <div className="workout-days">
                {plan.workouts.map((dayPlan, index) => (
                    <div key={index} className="workout-day">
                        <h2>{dayPlan.day}</h2>
                        {dayPlan.exercises.length === 0 ? (
                            <p>Rest Day</p>
                        ) : (
                            <div className="day-exercises">
                                {dayPlan.exercises.map((exercise, exerciseIndex) => (
                                    <div key={exerciseIndex} className="exercise-card">
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
                ))}
            </div>

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
