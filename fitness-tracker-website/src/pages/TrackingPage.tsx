import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { trendService } from '../services/trendApi.js'
import { workoutService } from '../services/workoutApi.js'
import './TrendsPage.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type NutritionTrend = {
  date: string
  total_calories?: number
  total_protein?: number
  total_carbs?: number
  total_fats?: number
}

type WorkoutTrend = {
  date: string
  total_workout_count?: number
  total_calories_burned?: number
}

type WorkoutExercise = {
  exercise_name: string
  sets: number
  reps: number
  weight?: number
}

type WorkoutDetail = {
  date: string
  workout_name: string
  total_duration: number
  total_calories_burned: number
  exercises: WorkoutExercise[]
}

type ChartDataType = {
  labels: string[]
  datasets: {
    label: string
    data: (number | null)[]
    borderColor: string
    tension: number
  }[]
}

type NutritionTypeKey = 'calories' | 'protein' | 'carbs' | 'fats'
type WorkoutTypeKey = 'workout_count' | 'calories_burned'

const typesNutrition: Array<{ key: NutritionTypeKey; label: string; color: string }> = [
  { key: 'calories', label: 'Calories', color: 'rgb(255, 99, 132)' },
  { key: 'protein', label: 'Protein', color: 'rgb(54, 162, 235)' },
  { key: 'carbs', label: 'Carbs', color: 'rgb(255, 206, 86)' },
  { key: 'fats', label: 'Fats', color: 'rgb(75, 192, 192)' }
]

const getNutritionValue = (item: NutritionTrend, key: NutritionTypeKey): number => {
  switch (key) {
    case 'calories':
      return item.total_calories ?? 0
    case 'protein':
      return item.total_protein ?? 0
    case 'carbs':
      return item.total_carbs ?? 0
    case 'fats':
      return item.total_fats ?? 0
    default:
      return 0
  }
}

const getWorkoutValue = (item: WorkoutTrend, key: WorkoutTypeKey): number => {
  switch (key) {
    case 'workout_count':
      return item.total_workout_count ?? 0
    case 'calories_burned':
      return item.total_calories_burned ?? 0
    default:
      return 0
  }
}

const prepareNutritionChartData = (
  trends: NutritionTrend[],
  type: NutritionTypeKey,
  label: string,
  color: string
): ChartDataType => ({
  labels: trends.map(item => item.date || ''),
  datasets: [
    {
      label,
      data: trends.map(item => getNutritionValue(item, type)),
      borderColor: color,
      tension: 0.1
    }
  ]
})

const prepareWorkoutChartData = (
  trends: WorkoutTrend[],
  type: WorkoutTypeKey,
  label: string,
  color: string
): ChartDataType => ({
  labels: trends.map(item => item.date || ''),
  datasets: [
    {
      label,
      data: trends.map(item => getWorkoutValue(item, type)),
      borderColor: color,
      tension: 0.1
    }
  ]
})

const getChartOptions = (title: string) => ({
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const
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
})

const TrackingPage: React.FC = () => {
  const [nutritionTrends, setNutritionTrends] = useState<NutritionTrend[]>([])
  const [workoutTrends, setWorkoutTrends] = useState<WorkoutTrend[]>([])
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetail[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true)
        setError(null)

        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - timeframe);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeframe);
        const startDateStr = startDate.toISOString().split('T')[0] || '';
        
        const endDateStr = new Date().toISOString().split('T')[0] || '';
        
        


        const [nutritionData, workoutTrendsData, workoutsData] = await Promise.all([
          trendService.getNutritionTrends(timeframe),
          trendService.getWorkoutTrends(timeframe),
          workoutService.getWorkouts(startDateStr, endDateStr)
        ])

        setNutritionTrends(Array.isArray(nutritionData) ? nutritionData : [])
        setWorkoutTrends(Array.isArray(workoutTrendsData) ? workoutTrendsData : [])
        setWorkoutDetails(Array.isArray(workoutsData) ? workoutsData : [])
      } catch (err: any) {
        setError('Failed to load trends')
        setNutritionTrends([])
        setWorkoutTrends([])
        setWorkoutDetails([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [timeframe])

  if (loading) return <div>Loading trends...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="trends-page">
      <h1>Your Fitness Trends</h1>
      <div className="timeframe-selector">
        {[7, 30, 90].map(days => (
          <button
            key={days}
            className={timeframe === days ? 'active' : ''}
            onClick={() => setTimeframe(days as 7 | 30 | 90)}
            type="button"
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
            {typesNutrition.map(({ key, label, color }) => (
              <div key={key} className="chart-container">
                <Line
                  data={prepareNutritionChartData(nutritionTrends, key, label + ' Over Time', color)}
                  options={getChartOptions(`${label} Over Time`)}
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
                  data={prepareWorkoutChartData(
                    workoutTrends,
                    'workout_count',
                    'Workout Frequency',
                    'rgb(150, 88, 255)'
                  )}
                  options={getChartOptions('Workout Frequency')}
                />
              </div>
              <div className="chart-container">
                <Line
                  data={prepareWorkoutChartData(
                    workoutTrends,
                    'calories_burned',
                    'Calories Burned',
                    'rgb(255, 159, 64)'
                  )}
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
                              <span>
                                {exercise.sets} sets x {exercise.reps} reps
                              </span>
                              {exercise.weight !== undefined && (
                                <span>Weight: {exercise.weight} kg</span>
                              )}
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
  )
}

export default TrackingPage
