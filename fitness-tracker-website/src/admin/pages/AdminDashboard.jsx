import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkouts: 0,
    totalMeals: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        setError(error.message || 'Failed to fetch dashboard statistics');
      }
    };

    fetchDashboardStats();
  }, []);

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <h1>Access Denied</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{stats.activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Workouts</h3>
          <p>{stats.totalWorkouts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Meals Logged</h3>
          <p>{stats.totalMeals}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
