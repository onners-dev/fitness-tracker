import React from 'react';
import './GoalSummary.css';

const GoalSummary = ({ userProfile }) => {
  const getCalorieGoal = () => {
    // More comprehensive calorie calculation
    const baseMetabolicRate = calculateBMR(
      userProfile.current_weight, 
      userProfile.height, 
      userProfile.age
    );
    
    const activityMultiplier = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725
    };

    const multiplier = activityMultiplier[userProfile.activity_level] || 1.375;
    const calorieAdjustment = getCalorieAdjustmentForGoal(userProfile.fitness_goal);

    return Math.round(baseMetabolicRate * multiplier + calorieAdjustment);
  };

  // Basal Metabolic Rate calculation (Mifflin-St Jeor Equation)
  const calculateBMR = (weight, height, age, gender = 'male') => {
    const baseCalc = gender === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    return baseCalc;
  };

  // Adjust calories based on fitness goal
  const getCalorieAdjustmentForGoal = (goal) => {
    switch(goal) {
      case 'weight_loss': return -500; // Deficit for weight loss
      case 'muscle_gain': return +300;  // Surplus for muscle gain
      case 'maintenance': return 0;     // No adjustment
      case 'endurance': return +200;    // Slight surplus
      default: return 0;
    }
  };

  const getWorkoutGoal = () => {
    const workoutGoals = {
      'weight_loss': '4-5 workouts/week, mix of cardio and strength',
      'muscle_gain': '4-6 strength training sessions/week',
      'maintenance': '3-4 varied workouts/week',
      'endurance': '5-6 cardio-focused sessions/week',
      'general_fitness': '3-5 mixed workouts/week'
    };

    return workoutGoals[userProfile.fitness_goal] || 'Consistent exercise';
  };

  const getPrimaryFocusDescription = () => {
    const focusDescriptions = {
      'strength': 'Build muscle and increase strength',
      'cardio': 'Improve cardiovascular endurance',
      'flexibility': 'Enhance mobility and prevent injuries',
      'weight_management': 'Achieve and maintain ideal body composition',
      'overall_wellness': 'Holistic approach to fitness and health'
    };

    return focusDescriptions[userProfile.primary_focus] || 'Not specified';
  };

  return (
    <div className="dashboard-grid goal-summary">
      {/* Calorie Goal Card */}
      <div className="dashboard-card">
        <h2>Calorie Goal</h2>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Daily Intake</span>
            <span className="stat-value">
              {getCalorieGoal()} calories
            </span>
          </div>
        </div>
      </div>

      {/* Workout Goal Card */}
      <div className="dashboard-card">
        <h2>Workout Goal</h2>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Weekly Plan</span>
            <span className="stat-value">
              {getWorkoutGoal()}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Focus Card */}
      <div className="dashboard-card">
        <h2>Primary Focus</h2>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Focus Area</span>
            <span className="stat-value">
              {getPrimaryFocusDescription()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSummary;
