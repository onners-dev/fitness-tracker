import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import './SystemAnalytics.css';

const SystemAnalytics = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkouts: 0,
    totalMeals: 0,
    serverPerformance: {
      averageResponseTime: 0,
      requestsPerMinute: 0
    },
    userGrowth: []
  });

  useEffect(() => {
    const fetchSystemAnalytics = async () => {
      try {
        const analytics = await adminService.getSystemAnalytics();
        setSystemMetrics(analytics);
      } catch (error) {
        console.error('Failed to fetch system analytics', error);
      }
    };

    fetchSystemAnalytics();
  }, []);

  return (
    <div className="system-analytics">
      <h1>System Analytics</h1>
      
      <section className="overall-metrics">
        <div className="metric-card">
          <h3>Total Users</h3>
          <p>{systemMetrics.totalUsers}</p>
        </div>
        <div className="metric-card">
          <h3>Active Users</h3>
          <p>{systemMetrics.activeUsers}</p>
        </div>
        <div className="metric-card">
          <h3>Total Workouts</h3>
          <p>{systemMetrics.totalWorkouts}</p>
        </div>
        <div className="metric-card">
          <h3>Total Meals</h3>
          <p>{systemMetrics.totalMeals}</p>
        </div>
      </section>

      <section className="performance-metrics">
        <h2>Server Performance</h2>
        <div className="performance-details">
          <p>Average Response Time: {systemMetrics.serverPerformance.averageResponseTime} ms</p>
          <p>Requests per Minute: {systemMetrics.serverPerformance.requestsPerMinute}</p>
        </div>
      </section>

      <section className="user-growth">
        <h2>User Growth</h2>
        {/* You could add a chart library here to visualize user growth */}
        <div className="growth-chart">
          {systemMetrics.userGrowth.map((growth, index) => (
            <div key={index} className="growth-point">
              <p>Date: {growth.date}</p>
              <p>New Users: {growth.newUsers}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SystemAnalytics;
