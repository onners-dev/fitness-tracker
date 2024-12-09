import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { workoutPlanService } from '../services/workoutApi';
import './WorkoutPlans.css';


const formatGoal = (goal) => {
  const goalMap = {
    'muscle_gain': 'Muscle Gain',
    'weight_loss': 'Weight Loss',
    'endurance': 'Endurance',
    'strength': 'Strength Training',
    'general_fitness': 'General Fitness'
  };

  return goalMap[goal] || goal;
};

const formatActivityLevel = (level) => {
  const activityMap = {
    'sedentary': 'Sedentary',
    'lightly_active': 'Lightly Active',
    'moderately_active': 'Moderately Active',
    'very_active': 'Very Active',
    'extremely_active': 'Extremely Active'
  };

  return activityMap[level] || level;
};

const ExerciseDetailModal = ({ exercise, onClose }) => {
  if (!exercise) return null;

  // Check if instructions is a string and split it, or if it's an array, use it directly
  const instructions = Array.isArray(exercise.details.instructions) 
    ? exercise.details.instructions 
    : (typeof exercise.details.instructions === 'string' 
      ? exercise.details.instructions.split('. ') 
      : []);

  return (
    <div className="exercise-modal-overlay" onClick={onClose}>
      <div 
        className="exercise-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>{exercise.details.name}</h2>
        
        <div className="modal-exercise-details">
          <div className="detail-section">
            <h3>Exercise Information</h3>
            <p><strong>Muscle Groups:</strong> {exercise.details.muscle_groups?.join(', ')}</p>
            <p><strong>Equipment:</strong> {exercise.details.equipment}</p>
            <p><strong>Difficulty:</strong> {exercise.details.difficulty}</p>
          </div>

          <div className="detail-section">
            <h3>Workout Details</h3>
            <p><strong>Sets:</strong> {exercise.sets}</p>
            <p><strong>Reps:</strong> {exercise.reps}</p>
          </div>

          {instructions.length > 0 && (
            <div className="detail-section">
              <h3>Step-by-Step Instructions</h3>
              <ol className="exercise-instructions">
                {instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {exercise.details.description && (
            <div className="detail-section">
              <h3>Description</h3>
              <p>{exercise.details.description}</p>
            </div>
          )}

          {exercise.details.video_url && (
            <div className="detail-section">
              <h3>Tutorial</h3>
              <a 
                href={exercise.details.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="video-link"
              >
                Watch Tutorial Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



const WorkoutPlans = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        // Fetch user profile
        const profile = await userService.getProfile();
        setUserProfile(profile);

        // Generate workout plan based on profile
        const plan = await workoutPlanService.generateWorkoutPlan(profile);
        
        // Debug logging
        console.log('Received Workout Plan:', plan);
        console.log('Workouts:', plan.workouts);

        // Ensure plan and workouts exist
        if (!plan || !plan.workouts) {
          throw new Error('No workout plan generated');
        }

        // Extract exercise IDs
        const exerciseIds = Object.values(plan.workouts)
          .reduce((acc, dayExercises) => {
            // Ensure dayExercises is an array before mapping
            return acc.concat(
              Array.isArray(dayExercises) 
                ? dayExercises.map(exercise => exercise.exercise_id) 
                : []
            );
          }, []);
        
        console.log('Exercise IDs:', exerciseIds);

        // Fetch exercise details
        const exerciseDetails = exerciseIds.length > 0 
          ? await workoutPlanService.getWorkoutPlanExerciseDetails(exerciseIds)
          : [];

        console.log('Exercise Details:', exerciseDetails);

        // Merge exercise details into plan
        const enrichedPlan = { ...plan };
        Object.keys(enrichedPlan.workouts).forEach(day => {
          // Ensure the day's exercises is an array before mapping
          if (Array.isArray(enrichedPlan.workouts[day])) {
            enrichedPlan.workouts[day] = enrichedPlan.workouts[day].map(exercise => {
              const details = exerciseDetails.find(detail => detail.exercise_id === exercise.exercise_id);
              return { ...exercise, details };
            });
          }
        });

        setWorkoutPlan(enrichedPlan);
      } catch (err) {
        console.error('Full error details:', err);
        setError(err.message || 'Failed to generate workout plan');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, []);

  const renderExerciseCard = (exercise) => {
    if (!exercise || !exercise.details) return null;

    return (
        <div 
          key={exercise.exercise_id} 
          className="exercise-card"
          onClick={() => setSelectedExercise(exercise)}
        >
            <h4>{exercise.details.name}</h4>
            <div className="exercise-details">
                <p><strong>Muscle Groups:</strong> {exercise.details.muscle_groups?.join(', ')}</p>
                <p><strong>Equipment:</strong> {exercise.details.equipment}</p>
                <p><strong>Difficulty:</strong> {exercise.details.difficulty}</p>
            </div>
            <div className="exercise-sets-reps">
                <span>
                    <strong>Sets:</strong> {exercise.sets}
                </span>
                <span>
                    <strong>Reps:</strong> {exercise.reps}
                </span>
            </div>
            {exercise.details.video_url && (
                <a 
                    href={exercise.details.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="video-link"
                >
                    Watch Tutorial
                </a>
            )}
        </div>
    );
  };

  if (loading) return <div className="loading">Loading workout plan...</div>;

  if (error) return (
    <div className="workout-plans-page">
      <div className="error-message">
        <h2>Error Generating Workout Plan</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!workoutPlan || !workoutPlan.workouts) return (
    <div className="workout-plans-page">
      <div className="no-plan-message">
        <h2>No Workout Plan Available</h2>
        <p>We couldn't generate a workout plan at this time.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="workout-plans-page">
      <div className="workout-plans-header">
        <h1>Your Personalized Workout Plan</h1>
        <p>
        Based on your {formatGoal(userProfile.fitness_goal)} goal and {formatActivityLevel(userProfile.activity_level)} activity level        </p>
      </div>

      <div className="workout-plan-container">
        {Object.entries(workoutPlan.workouts).map(([day, exercises]) => (
          <div key={day} className="workout-day">
            <h2>{day}</h2>
            <div className="exercises-grid">
              {Array.isArray(exercises) ? exercises.map(renderExerciseCard) : null}
            </div>
          </div>
        ))}
      </div>

      {workoutPlan.planNotes && (
        <div className="plan-notes">
          <h3>Plan Notes</h3>
          <p>{workoutPlan.planNotes}</p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};

export default WorkoutPlans;
