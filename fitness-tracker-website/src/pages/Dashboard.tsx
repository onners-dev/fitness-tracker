import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/api.js'
import { workoutService } from '../services/workoutApi.js'
import { trendService } from '../services/trendApi.js'
import GoalSummary from '../components/GoalSummary.js'
import './Dashboard.css'

interface UserProfile {
  first_name?: string
  last_name?: string
  height?: number
  current_weight?: number
  fitness_goal?: string
  activity_level?: string
}

interface Workout {
  date: string
  workout_type: string
  total_duration?: number
  [key: string]: any
}

interface WorkoutInsight {
  type: string
  count: number
}

interface NutritionTrendSummary {
  description: string
  value: string
}

interface NutritionTrend {
  total_calories: string
  total_protein: string
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [nutritionTrends, setNutritionTrends] = useState<NutritionTrendSummary[]>([])
  const [workoutInsights, setWorkoutInsights] = useState<WorkoutInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatFitnessGoal = (goal?: string): string => {
    const goalMap: Record<string, string> = {
      weight_loss: 'Weight Loss',
      muscle_gain: 'Build Muscle',
      maintenance: 'Maintain Weight',
      general_fitness: 'General Fitness'
    }
    return goal ? goalMap[goal] || goal : ''
  }

  const formatActivityLevel = (level?: string): string => {
    const activityMap: Record<string, string> = {
      sedentary: 'Sedentary (little or no exercise)',
      lightly_active: 'Lightly Active (1-3 days/week)',
      moderately_active: 'Moderately Active (3-5 days/week)',
      very_active: 'Very Active (6-7 days/week)'
    }
    return level ? activityMap[level] || level : ''
  }

  const calculateWorkoutFrequency = (workouts: Workout[]): WorkoutInsight[] => {
    const workoutTypes = workouts.map((w) => w.workout_type)
    const typeCounts: Record<string, number> = {}
    for (const type of workoutTypes) {
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
    return Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }))
      .slice(0, 3)
  }

  const summarizeNutritionTrends = (trends: NutritionTrend[]): NutritionTrendSummary[] => {
    if (trends.length === 0) return []
    const averageCalories =
      trends.reduce((sum, trend) => sum + parseFloat(trend.total_calories), 0) / trends.length
    const latestTrend = trends[trends.length - 1]
    return [
      {
        description: 'Average Daily Calories',
        value: `${averageCalories.toFixed(0)} cal`
      },
      {
        description: 'Latest Protein Intake',
        value: `${latestTrend?.total_protein ?? 'N/A'}g`
      }
    ]
  }
  
  

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileData: UserProfile = await userService.getProfile()
        setUserProfile(profileData)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const workouts: Workout[] = await workoutService.getWorkouts(sevenDaysAgo.toISOString())
        setRecentWorkouts(workouts.slice(0, 3))
        const insights = calculateWorkoutFrequency(workouts)
        setWorkoutInsights(insights)
        const nutritionData: NutritionTrend[] = await trendService.getNutritionTrends(7)
        const summarizedTrends = summarizeNutritionTrends(nutritionData)
        setNutritionTrends(summarizedTrends)
      } catch (err: any) {
        if (err.response) {
          switch (err.response.status) {
            case 401:
              setError('Unauthorized. Please log in again.')
              break
            case 403:
              setError('You do not have permission to access this data.')
              break
            case 404:
              setError('Requested data not found.')
              break
            default:
              setError('Failed to load dashboard data. Please try again.')
          }
        } else if (err.request) {
          setError('No response from server. Please check your network connection.')
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const calculateBMI = (weight?: number, height?: number): string => {
    if (!weight || !height) return 'N/A'
    return (weight / Math.pow(height / 100, 2)).toFixed(1)
  }

  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div className="error">{error}</div>
  if (!userProfile) return <div>No profile data found</div>

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {userProfile.first_name || 'User'}!</h1>
      </div>
      <GoalSummary userProfile={userProfile} />
      <div className="dashboard-grid">
        <div className="dashboard-card profile-summary-card">
          <h2>Profile Summary</h2>
          <div className="profile-info">
            <p>
              <strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}
            </p>
            <p>
              <strong>Height:</strong> {userProfile.height} cm
            </p>
            <p>
              <strong>Weight:</strong> {userProfile.current_weight} kg
            </p>
            <p>
              <strong>Fitness Goal:</strong>{' '}
              {formatFitnessGoal(userProfile.fitness_goal)}
            </p>
            <p>
              <strong>Activity Level:</strong>{' '}
              {formatActivityLevel(userProfile.activity_level)}
            </p>
          </div>
        </div>
        <div className="dashboard-card quick-stats-card">
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
        <div className="dashboard-card workout-insights-card">
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
        <div className="dashboard-card recent-workouts-card">
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
                      <div className="workout-duration">{workout.total_duration} mins</div>
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
        <div className="dashboard-card nutrition-trends-card">
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
  )
}

export default Dashboard
