import React from 'react';

interface UserProfile {
  current_weight: number;
  height: number;
  age: number;
  gender?: 'male' | 'female';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  fitness_goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'general_fitness';
  primary_focus: 'strength' | 'cardio' | 'flexibility' | 'weight_management' | 'overall_wellness';
}

interface GoalSummaryProps {
  userProfile: UserProfile;
}

const GoalSummary: React.FC<GoalSummaryProps> = ({ userProfile }) => {
  const getCalorieGoal = () => {
    const baseMetabolicRate = calculateBMR(
      userProfile.current_weight,
      userProfile.height,
      userProfile.age,
      userProfile.gender
    );

    const activityMultiplier: Record<UserProfile['activity_level'], number> = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725
    };

    const multiplier = activityMultiplier[userProfile.activity_level] ?? 1.375;
    const calorieAdjustment = getCalorieAdjustmentForGoal(userProfile.fitness_goal);

    return Math.round(baseMetabolicRate * multiplier + calorieAdjustment);
  };

  const calculateBMR = (
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female' = 'male'
  ) => {
    return gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  };

  const getCalorieAdjustmentForGoal = (
    goal: UserProfile['fitness_goal']
  ) => {
    switch (goal) {
      case 'weight_loss': return -500;
      case 'muscle_gain': return 300;
      case 'maintenance': return 0;
      case 'endurance': return 200;
      default: return 0;
    }
  };

  const getWorkoutGoal = () => {
    const workoutGoals: Record<UserProfile['fitness_goal'], string> = {
      'weight_loss': '4-5 workouts/week, mix of cardio and strength',
      'muscle_gain': '4-6 strength training sessions/week',
      'maintenance': '3-4 varied workouts/week',
      'endurance': '5-6 cardio-focused sessions/week',
      'general_fitness': '3-5 mixed workouts/week'
    };

    return workoutGoals[userProfile.fitness_goal] ?? 'Consistent exercise';
  };

  const getPrimaryFocusDescription = () => {
    const focusDescriptions: Record<UserProfile['primary_focus'], string> = {
      'strength': 'Build muscle and increase strength',
      'cardio': 'Improve cardiovascular endurance',
      'flexibility': 'Enhance mobility and prevent injuries',
      'weight_management': 'Achieve and maintain ideal body composition',
      'overall_wellness': 'Holistic approach to fitness and health'
    };

    return focusDescriptions[userProfile.primary_focus] ?? 'Not specified';
  };

  return (
    <div className="dashboard-grid goal-summary">
      <div className="dashboard-card goal-summary-card goal-summary-first-row">
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
      <div className="dashboard-card goal-summary-card goal-summary-first-row">
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
      <div className="dashboard-card goal-summary-card goal-summary-first-row goal-summary-full-width">
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
