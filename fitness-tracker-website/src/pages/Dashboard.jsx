// In Dashboard.jsx
import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format fitness goal for display
  const formatFitnessGoal = (goal) => {
    const goalMap = {
      'weight_loss': 'Weight Loss',
      'muscle_gain': 'Build Muscle',
      'maintenance': 'Maintain Weight',
      'general_fitness': 'General Fitness'
    };
    return goalMap[goal] || goal;
  };

  // Format activity level for display
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
    const fetchUserProfile = async () => {
      try {
        const data = await userService.getProfile();
        setUserProfile(data);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userProfile) return <div>No profile data found</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {userProfile.first_name}!</h1>
      </div>

      <div className="dashboard-grid">
        {/* Profile Summary Card */}
        <div className="dashboard-card">
          <h2>Profile Summary</h2>
          <div className="profile-info">
            <p><strong>Name:</strong> <span>{userProfile.first_name} {userProfile.last_name}</span></p>
            <p><strong>Height:</strong> <span>{userProfile.height} cm</span></p>
            <p><strong>Weight:</strong> <span>{userProfile.current_weight} kg</span></p>
            <p><strong>Fitness Goal:</strong> <span>{formatFitnessGoal(userProfile.fitness_goal)}</span></p>
            <p><strong>Activity Level:</strong> <span>{formatActivityLevel(userProfile.activity_level)}</span></p>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="dashboard-card">
          <h2>Quick Stats</h2>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">BMI</span>
              <span className="stat-value">
                {(userProfile.current_weight / Math.pow(userProfile.height/100, 2)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <p>Coming soon...</p>
        </div>

        {/* Goals Card */}
        <div className="dashboard-card">
          <h2>Fitness Goals</h2>
          <p>Current Goal: {formatFitnessGoal(userProfile.fitness_goal)}</p>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
