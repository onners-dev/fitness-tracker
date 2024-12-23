import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../services/workoutApi';
import { userService } from '../services/api';
import './WorkoutPlans.css';

const WorkoutPlans = () => {
  const navigate = useNavigate();
  
  // State management
  const [userProfile, setUserProfile] = useState(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch workout plans when component mounts
  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        // Fetch user profile
        const profile = await userService.getProfile();
        setUserProfile(profile);

        // Fetch existing workout plans
        const plans = await workoutPlanService.getUserWorkoutPlans();
        setWorkoutPlans(plans);
      } catch (err) {
        console.error('Error fetching workout plans:', err);
        setError('Failed to load workout plans');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, []);

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

  // Delete a workout plan
  const handleDeletePlan = async (planId) => {
    try {
      await workoutPlanService.deleteCustomWorkoutPlan(planId);
      setWorkoutPlans(currentPlans => 
        currentPlans.filter(plan => plan.plan_id !== planId)
      );
    } catch (err) {
      console.error('Failed to delete plan:', err);
      setError('Failed to delete workout plan');
    }
  };

  // View plan details
  const handleViewPlanDetails = (plan) => {
    navigate('/workout-plans/details', { state: { plan } });
  };

  // Render loading state
  if (loading) {
    return <div className="loading">Loading workout plans...</div>;
  }

  // Render error state
  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="workout-plans-page">
      <div className="page-header">
        <h1>My Workout Plans</h1>
        <div className="plan-actions">
          <button 
            onClick={() => navigate('/workout-plans/onboarding')}
            className="create-plan-btn"
          >
            Create New Plan
          </button>
        </div>
      </div>

      {workoutPlans.length === 0 ? (
        <div className="no-plans">
          <p>You haven't created any workout plans yet.</p>
          <button 
            onClick={() => navigate('/workout-plans/onboarding')}
            className="get-started-btn"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="plans-grid">
          {workoutPlans.map(plan => (
            <div key={plan.plan_id} className="plan-card">
              <h2>
                {plan.planName || `${formatGoal(plan.fitnessGoal)} Plan`}
              </h2>
              <div className="plan-details">
                <p><strong>Fitness Goal:</strong> {formatGoal(plan.fitnessGoal)}</p>
                <p><strong>Activity Level:</strong> {plan.activityLevel}</p>
                <p><strong>Created:</strong> {new Date(plan.created_at).toLocaleDateString()}</p>
              </div>
              <div className="plan-actions">
                <button 
                  onClick={() => handleViewPlanDetails(plan)}
                  className="view-details-btn"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleDeletePlan(plan.plan_id)}
                  className="delete-plan-btn"
                >
                  Delete Plan
                </button>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutPlans;
