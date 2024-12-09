import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { trendService } from '../services/trendApi';
import './TrendsPage.css';

function TrendsPage() {
  const [nutritionTrends, setNutritionTrends] = useState([]);
  const [workoutTrends, setWorkoutTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState(30);

  // Date formatting utility function
  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        const [nutritionData, workoutData] = await Promise.all([
          trendService.getNutritionTrends(timeframe),
          trendService.getWorkoutTrends(timeframe)
        ]);

        setNutritionTrends(nutritionData || []);
        setWorkoutTrends(workoutData || []);
      } catch (error) {
        console.error('Error fetching trends:', error);
        setError(`Failed to load trends: ${error.message}`);
        setNutritionTrends([]);
        setWorkoutTrends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [timeframe]);

  const renderTrendChart = (data, dataKey, color, title) => (
    <div className="trend-chart">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#666' }}
            tickFormatter={(value) => formatDate(value)}
          />
          <YAxis 
            tick={{ fill: '#666' }} 
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'white', 
              border: `1px solid ${color}`, 
              borderRadius: '8px' 
            }}
            labelFormatter={formatDate}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fill={color} 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) return <div className="loading">Loading trends...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="trends-page">
      <div className="page-header">
        <h1>Your Fitness Insights</h1>
        <div className="timeframe-selector">
          {[7, 30, 90].map(days => (
            <button 
              key={days}
              className={timeframe === days ? 'active' : ''}
              onClick={() => setTimeframe(days)}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      <div className="trends-section nutrition-trends">
        <h2>Nutrition Trends</h2>
        {nutritionTrends.length === 0 ? (
          <p className="no-data">No nutrition data available</p>
        ) : (
          <div className="charts-grid">
            {renderTrendChart(nutritionTrends, 'total_calories', '#FF6384', 'Daily Calories')}
            {renderTrendChart(nutritionTrends, 'total_protein', '#36A2EB', 'Protein Intake')}
            {renderTrendChart(nutritionTrends, 'total_carbs', '#FFCE56', 'Carbohydrate Intake')}
            {renderTrendChart(nutritionTrends, 'total_fats', '#4BC0C0', 'Fat Intake')}
          </div>
        )}
      </div>

      <div className="trends-section workout-trends">
        <h2>Workout Trends</h2>
        {workoutTrends.length === 0 ? (
          <p className="no-data">No workout data available</p>
        ) : (
          <div className="charts-grid">
            {renderTrendChart(workoutTrends, 'total_workout_count', '#9966FF', 'Workout Frequency')}
            {renderTrendChart(workoutTrends, 'total_calories_burned', '#FF9F40', 'Calories Burned')}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrendsPage;
