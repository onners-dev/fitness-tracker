import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { trendService } from '../services/trendApi.js';
import { workoutService } from '../services/workoutApi.js';
import './TrendsPage.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function TrendsPage() {
  const [nutritionTrends, setNutritionTrends] = useState([]);
  const [workoutTrends, setWorkoutTrends] = useState([]);
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        const [nutritionData, workoutTrendsData, workoutsData] = await Promise.all([
          trendService.getNutritionTrends(timeframe),
          trendService.getWorkoutTrends(timeframe),
          workoutService.getWorkouts(
            new Date(new Date().setDate(new Date().getDate() - timeframe)).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          )
        ]);

        // Ensure we have arrays
        setNutritionTrends(Array.isArray(nutritionData) ? nutritionData : []);
        setWorkoutTrends(Array.isArray(workoutTrendsData) ? workoutTrendsData : []);
        setWorkoutDetails(Array.isArray(workoutsData) ? workoutsData : []);
      } catch (error) {
        console.error('Error fetching trends:', error);
        setError('Failed to load trends');
        setNutritionTrends([]);
        setWorkoutTrends([]);
        setWorkoutDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [timeframe]);

  // Prepare chart data with fallback
  const prepareChartData = (trends, type) => {
    if (!trends || trends.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: `${type} Trend`,
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
    }

    return {
      labels: trends.map(item => item.date || ''),
      datasets: [{
        label: `${type} Trend`,
        data: trends.map(item => {
          const value = item[`total_${type}`];
          return value !== undefined ? value : 0;
        }),
        borderColor: type === 'calories' ? 'rgb(255, 99, 132)' : 
                     type === 'protein' ? 'rgb(54, 162, 235)' : 
                     type === 'carbs' ? 'rgb(255, 206, 86)' : 
                     'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  };

  // Prepare chart options
  const getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  });

  // Render loading or error states
  if (loading) return <div>Loading trends...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="trends-page">
      <h1>Your Fitness Trends</h1>

      {/* Timeframe Selector */}
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

      {/* Nutrition Trends Section */}
      <div className="trends-section">
        <h2>Nutrition Trends</h2>
        {nutritionTrends.length === 0 ? (
          <p>No nutrition data available</p>
        ) : (
          <div className="charts-grid">
            {['calories', 'protein', 'carbs', 'fats'].map(type => (
              <div key={type} className="chart-container">
                <Line 
                  data={prepareChartData(nutritionTrends, type)} 
                  options={getChartOptions(`${type.charAt(0).toUpperCase() + type.slice(1)} Over Time`)} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Trends Section */}
      <div className="trends-section">
        <h2>Workout Trends</h2>
        {workoutTrends.length === 0 ? (
          <p>No workout data available</p>
        ) : (
          <>
            <div className="charts-grid">
              <div className="chart-container">
                <Line 
                  data={prepareChartData(workoutTrends, 'workout_count')}
                  options={getChartOptions('Workout Frequency')}
                />
              </div>
              <div className="chart-container">
                <Line 
                  data={prepareChartData(workoutTrends, 'calories_burned')}
                  options={getChartOptions('Calories Burned')}
                />
              </div>
            </div>

            {/* Detailed Workout Log */}
            <div className="workout-details">
              <h3>Workout Details</h3>
              {workoutDetails.length === 0 ? (
                <p>No workout details available</p>
              ) : (
                <div className="workout-list">
                  {workoutDetails.map((workout, index) => (
                    <div key={index} className="workout-item">
                      <div className="workout-header">
                        <h4>{workout.workout_name}</h4>
                        <span>{workout.date}</span>
                      </div>
                      <div className="workout-stats">
                        <span>Duration: {workout.total_duration} mins</span>
                        <span>Calories Burned: {workout.total_calories_burned}</span>
                      </div>
                      {workout.exercises && workout.exercises.length > 0 && (
                        <div className="workout-exercises">
                          <strong>Exercises:</strong>
                          {workout.exercises.map((exercise, exIndex) => (
                            <div key={exIndex} className="exercise-detail">
                              <span>{exercise.exercise_name}</span>
                              <span>{exercise.sets} sets x {exercise.reps} reps</span>
                              {exercise.weight && <span>Weight: {exercise.weight} kg</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TrendsPage;
