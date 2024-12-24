import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { workoutPlanService } from '../services/workoutApi';
import './WorkoutPlanGenerate.css';

const WorkoutPlanGenerate = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planName, setPlanName] = useState('');
  const [isNamingPlan, setIsNamingPlan] = useState(false);

  const formatGoal = (goal) => {
    const goalMap = {
      'muscle_gain': 'Muscle Gain',
      'weight_loss': 'Weight Loss',
      'maintenance': 'Weight Maintenance',
      'endurance': 'Endurance Training',
      'general_fitness': 'Overall Fitness'
    };
    return goalMap[goal] || goal;
  };

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const profile = await userService.getProfile();
        setUserProfile(profile);

        const plan = await workoutPlanService.generateWorkoutPlan(profile);

        if (!plan || !plan.workouts) {
          throw new Error('No workout plan generated');
        }

        // Fetch detailed exercise information
        const exerciseIds = Object.values(plan.workouts).reduce((acc, dayExercises) => {
          return acc.concat(
            Array.isArray(dayExercises)
              ? dayExercises.map(exercise => exercise.exercise_id)
              : []
          );
        }, []);

        const exerciseDetails = exerciseIds.length > 0 
          ? await workoutPlanService.getWorkoutPlanExerciseDetails(exerciseIds)
          : [];

        // Enrich plan with exercise details
        const enrichedPlan = { ...plan };
        Object.keys(enrichedPlan.workouts).forEach(day => {
          if (Array.isArray(enrichedPlan.workouts[day])) {
            enrichedPlan.workouts[day] = enrichedPlan.workouts[day].map(exercise => {
              const details = exerciseDetails.find(detail => detail.exercise_id === exercise.exercise_id);
              return { ...exercise, details };
            });
          }
        });

        setWorkoutPlan(enrichedPlan);
        setLoading(false);
        setIsNamingPlan(true);
      } catch (err) {
        console.error('Workout Plan Generation Error:', err);
        setError(err.message || 'Failed to generate workout plan');
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, []);

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a name for your workout plan');
      return;
    }

    try {
      // Save the plan with the provided name
      const savedPlan = await workoutPlanService.createGeneratedWorkoutPlan({
        ...workoutPlan,
        planName: planName.trim()
      });

      // Navigate to existing plans
      navigate('/workout-plans/existing');
    } catch (error) {
      console.error('Error saving workout plan:', error);
      alert('Failed to save workout plan');
    }
  };

  const renderDayWorkouts = (day, exercises) => {
    if (!exercises || exercises.length === 0) {
      return <p>Rest Day</p>;
    }

    return (
      <div className="day-workouts">
        {exercises.map((exercise, index) => (
          <div key={index} className="exercise-card">
            <h4>{exercise.name}</h4>
            <div className="exercise-details">
              <p>Sets: {exercise.sets}</p>
              <p>Reps: {exercise.reps}</p>
              <p>Muscle Groups: {exercise.details?.muscle_groups?.join(', ') || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Plan Naming Modal
  const PlanNamingModal = () => {
    return (
      <div className="plan-naming-modal">
        <div className="plan-naming-content">
          <h2>Name Your Workout Plan</h2>
          <p>Give your personalized workout plan a memorable name</p>
          <input 
            type="text" 
            placeholder="Enter plan name"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="plan-name-input"
          />
          <div className="plan-naming-actions">
            <button 
              onClick={handleSavePlan}
              disabled={!planName.trim()}
              className="save-plan-btn"
            >
              Save Plan
            </button>
            <button 
              onClick={() => navigate('/workout-plans/onboarding')}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="workout-plan-generate loading">
        <div className="spinner"></div>
        <p>Generating your personalized workout plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-plan-generate error">
        <h2>Workout Plan Generation Failed</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {isNamingPlan && <PlanNamingModal />}
      <div className="workout-plan-generate">
        <div className="plan-header">
          <h1>Your Personalized Workout Plan</h1>
          <div className="plan-summary">
            <p>
              <strong>Fitness Goal:</strong> {formatGoal(workoutPlan.fitnessGoal)}
            </p>
            {workoutPlan.planNotes && (
              <div className="plan-notes">
                <h3>Plan Insights</h3>
                <p>{workoutPlan.planNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="workout-days-grid">
          {Object.entries(workoutPlan.workouts).map(([day, exercises]) => (
            <div key={day} className="workout-day">
              <h2>{day}</h2>
              {renderDayWorkouts(day, exercises)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WorkoutPlanGenerate;
