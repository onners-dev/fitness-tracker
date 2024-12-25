import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { workoutPlanService } from '../services/workoutApi';
import './WorkoutPlanGenerate.css';

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

const WorkoutPlanGenerate = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planName, setPlanName] = useState('');
  const [isNamingPlan, setIsNamingPlan] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profile = await userService.getProfile();
        setUserProfile(profile);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const generateWorkoutPlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a name for your workout plan');
      return;
    }
  
    try {
      setLoading(true);
      const plan = await workoutPlanService.generateWorkoutPlan({
        ...userProfile,
        planName: planName.trim()
      });
  
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
  
      const enrichedPlan = { 
        ...plan, 
        planName: planName.trim(),
        workouts: { ...plan.workouts }
      };
  
      Object.keys(enrichedPlan.workouts).forEach(day => {
        if (Array.isArray(enrichedPlan.workouts[day])) {
          enrichedPlan.workouts[day] = enrichedPlan.workouts[day].map(exercise => {
            const details = exerciseDetails.find(detail => detail.exercise_id === exercise.exercise_id);
            return { ...exercise, details };
          });
        }
      });
  
      setWorkoutPlan(enrichedPlan);
      setIsNamingPlan(false);
      setLoading(false);
    } catch (error) {
      console.error('Workout Plan Generation Error:', error);
      setError(error.message || 'Failed to generate workout plan');
      setLoading(false);
    }
  };
  
  // Add a new method to save the plan
  const saveWorkoutPlan = async () => {
    try {
      setLoading(true);
      const savedPlan = await workoutPlanService.generateWorkoutPlan({
        ...userProfile,
        planName: planName.trim(),
        saveAutomatically: 'true'
      });
  
      navigate('/workout-plans/existing');
    } catch (error) {
      console.error('Workout Plan Save Error:', error);
      setError(error.message || 'Failed to save workout plan');
      setLoading(false);
    }
  };

  const handlePlanNameChange = (e) => {
    const value = e.target.value;
    setPlanName(value);  // Make sure this updates the state
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
              <p>Muscle Groups: {exercise.muscle_groups?.join(', ') || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PlanNamingModal = () => {
    return (
      <div className="plan-naming-modal">
        <div className="plan-naming-content">
          <h2>Name Your Workout Plan</h2>
          <p>Give your personalized workout plan a memorable name</p>
          <input 
            type="text" 
            placeholder="Enter plan name (e.g., Summer Shred, Strength Builder)"
            value={planName}
            onInput={(e) => {
              e.stopPropagation();  // Prevent event bubbling
              setPlanName(e.target.value);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();  // Additional prevention of event interference
            }}
            autoComplete="off"
            autoFocus
            className="plan-name-input"
          />
          <div className="plan-naming-actions">
            <button 
              onClick={generateWorkoutPlan}
              disabled={!planName.trim()}
              className="save-plan-btn"
            >
              Generate Plan
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
      {workoutPlan ? (
        <div className="workout-plan-generate">
          <div className="plan-header">
            <h1>Your Personalized Workout Plan</h1>
            <div className="plan-actions">
              <button 
                onClick={saveWorkoutPlan} 
                className="save-plan-btn"
              >
                Save This Plan
              </button>
              <button 
                onClick={() => navigate('/workout-plans/customize')} 
                className="customize-plan-btn"
              >
                Customize Plan
              </button>
            </div>
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
      ) : (
        <div className="workout-plan-generate loading">
          <div className="spinner"></div>
          <p>Generating your personalized workout plan...</p>
        </div>
      )}
    </>
  );
};

export default WorkoutPlanGenerate;
