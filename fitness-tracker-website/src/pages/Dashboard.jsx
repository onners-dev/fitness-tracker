import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { workoutService } from '../services/workoutApi';
import { trendService } from '../services/trendApi';
import GoalSummary from '../components/GoalSummary';
import './Dashboard.css';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [nutritionTrends, setNutritionTrends] = useState([]);
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user profile
        const profileData = await userService.getProfile();
        setUserProfile(profileData);

        // Fetch recent workouts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const workouts = await workoutService.getWorkouts(sevenDaysAgo.toISOString());
        setRecentWorkouts(workouts.slice(0, 3)); // Latest 3 workouts

        // Fetch nutrition trends
        const nutritionData = await trendService.getNutritionTrends(7);
        setNutritionTrends(nutritionData);

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard Error:', err);
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
            {/* Add more stats if needed */}
          </div>
        </div>

        {/* Recent Workouts Card */}
        <div className="dashboard-card">
          <h2>Recent Workouts</h2>
          {recentWorkouts.length > 0 ? (
            <ul className="recent-workouts-list">
              {recentWorkouts.map((workout, index) => (
                <li key={index}>
                  {workout.type} - {new Date(workout.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent workouts</p>
          )}
        </div>

        {/* Nutrition Trends Card */}
        <div className="dashboard-card">
          <h2>Nutrition Trends</h2>
          {nutritionTrends.length > 0 ? (
            <ul className="nutrition-trends-list">
              {nutritionTrends.map((trend, index) => (
                <li key={index}>
                  {trend.description} - {trend.value}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent nutrition data</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
