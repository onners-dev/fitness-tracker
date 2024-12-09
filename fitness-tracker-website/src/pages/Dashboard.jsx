import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { workoutService } from '../services/workoutApi';
import { trendService } from '../services/trendApi';
import GoalSummary from '../components/GoalSummary';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [nutritionTrends, setNutritionTrends] = useState([]);
  const [workoutInsights, setWorkoutInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Existing formatting methods
  const formatFitnessGoal = (goal) => {
    const goalMap = {
      'weight_loss': 'Weight Loss',
      'muscle_gain': 'Build Muscle',
      'maintenance': 'Maintain Weight',
      'general_fitness': 'General Fitness'
    };
    return goalMap[goal] || goal;
  };

  const formatActivityLevel = (level) => {
    const activityMap = {
      'sedentary': 'Sedentary (little or no exercise)',
      'lightly_active': 'Lightly Active (1-3 days/week)',
      'moderately_active': 'Moderately Active (3-5 days/week)',
      'very_active': 'Very Active (6-7 days/week)'
    };
    return activityMap[level] || level;
  };

  // Calculate workout insights
  const calculateWorkoutFrequency = (workouts) => {
    const workoutTypes = workouts.map(w => w.workout_type);
    const typeCounts = workoutTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }))
      .slice(0, 3); // Top 3 workout types
  };

  // Summarize nutrition trends
  const summarizeNutritionTrends = (trends) => {
    if (trends.length === 0) return [];

    // Calculate average calories
    const averageCalories = trends.reduce((sum, trend) => 
      sum + parseFloat(trend.total_calories), 0) / trends.length;

    // Get the most recent trend
    const latestTrend = trends[trends.length - 1];
    
    return [
      {
        description: 'Average Daily Calories',
        value: `${averageCalories.toFixed(0)} cal`
      },
      {
        description: 'Latest Protein Intake',
        value: `${latestTrend.total_protein}g`
      }
    ];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileData = await userService.getProfile();
        setUserProfile(profileData);

        // Fetch recent workouts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const workouts = await workoutService.getWorkouts(sevenDaysAgo.toISOString());
        setRecentWorkouts(workouts.slice(0, 3)); // Latest 3 workouts

        // Calculate workout insights
        const insights = calculateWorkoutFrequency(workouts);
        setWorkoutInsights(insights);

        // Fetch nutrition trends
        const nutritionData = await trendService.getNutritionTrends(7);
        const summarizedTrends = summarizeNutritionTrends(nutritionData);
        setNutritionTrends(summarizedTrends);

      } catch (err) {
        console.error('Dashboard Error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate BMI safely
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 'N/A';
    return (weight / Math.pow(height/100, 2)).toFixed(1);
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!userProfile) return <div>No profile data found</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {userProfile.first_name || 'User'}!</h1>
      </div>

      <GoalSummary userProfile={userProfile} />

      <div className="dashboard-grid">
        {/* Profile Summary Card */}
        <div className="dashboard-card">
          <h2>Profile Summary</h2>
          <div className="profile-info">
            <p><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</p>
            <p><strong>Height:</strong> {userProfile.height} cm</p>
            <p><strong>Weight:</strong> {userProfile.current_weight} kg</p>
            <p><strong>Fitness Goal:</strong> {formatFitnessGoal(userProfile.fitness_goal)}</p>
            <p><strong>Activity Level:</strong> {formatActivityLevel(userProfile.activity_level)}</p>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="dashboard-card">
          <h2>Quick Stats</h2>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">BMI</span>
              <span className="stat-value">
                {calculateBMI(userProfile.current_weight, userProfile.height)}
              </span>
            </div>
          </div>
        </div>

        {/* Workout Insights Card */}
        <div className="dashboard-card">
          <h2>Workout Insights</h2>
          {workoutInsights.length > 0 ? (
            <>
              <ul className="workout-insights-list">
                {workoutInsights.map((insight, index) => (
                  <li key={index} className="workout-insight-item">
                    <span className="insight-type">{insight.type}</span>
                    <span className="insight-count">{insight.count} workouts</span>
                  </li>
                ))}
              </ul>
              <button 
                className="view-progress-btn"
                onClick={() => navigate('/trends')}
              >
                View Progress
              </button>
            </>
          ) : (
            <div className="no-insights">
              <p>No workout insights available</p>
              <button 
                className="view-progress-btn"
                onClick={() => navigate('/trends')}
              >
                View Progress
              </button>
            </div>
          )}
        </div>

        {/* Recent Workouts Card */}
        <div className="dashboard-card">
          <h2>Recent Workouts</h2>
          {recentWorkouts.length > 0 ? (
            <>
              <ul className="recent-workouts-list">
                {recentWorkouts.map((workout, index) => (
                  <li key={index} className="workout-item">
                    <div className="workout-type">{workout.workout_type}</div>
                    <div className="workout-date">
                      {new Date(workout.date).toLocaleDateString()}
                    </div>
                    {workout.total_duration && (
                      <div className="workout-duration">
                        {workout.total_duration} mins
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <button 
                className="log-workout-btn"
                onClick={() => navigate('/workout-logging')}
              >
                Log a Workout
              </button>
            </>
          ) : (
            <div className="no-workouts">
              <p>No recent workouts</p>
              <button 
                className="log-workout-btn"
                onClick={() => navigate('/workout-logging')}
              >
                Log Your First Workout
              </button>
            </div>
          )}
        </div>

        {/* Nutrition Trends Card */}
        <div className="dashboard-card">
          <h2>Nutrition Trends</h2>
          {nutritionTrends.length > 0 ? (
            <>
              <ul className="nutrition-trends-list">
                {nutritionTrends.map((trend, index) => (
                  <li key={index}>
                    <strong>{trend.description}:</strong> {trend.value}
                  </li>
                ))}
              </ul>
              <button 
                className="log-meal-btn"
                onClick={() => navigate('/calorietracker')}
              >
                Log a Meal
              </button>
            </>
          ) : (
            <div className="no-meals">
              <p>No nutrition data available</p>
              <button 
                className="log-meal-btn"
                onClick={() => navigate('/calorietracker')}
              >
                Log Your First Meal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
