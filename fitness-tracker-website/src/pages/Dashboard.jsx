import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <p><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</p>
            <p><strong>Height:</strong> {userProfile.height} cm</p>
            <p><strong>Weight:</strong> {userProfile.current_weight} kg</p>
            <p><strong>Fitness Goal:</strong> {userProfile.fitness_goal}</p>
            <p><strong>Activity Level:</strong> {userProfile.activity_level}</p>
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
            {/* Add more stats as needed */}
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
          <p>Current Goal: {userProfile.fitness_goal}</p>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
