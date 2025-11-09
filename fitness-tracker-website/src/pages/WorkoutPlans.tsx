import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutPlanService } from '../services/workoutPlanService.js'
import { userService } from '../services/api.js'
import type { UserProfile } from '../services/api.js'
import './WorkoutPlans.css'

interface Workout {
  day: string
  exercises: any[]
}

interface Plan {
  plan_id: string
  planName?: string
  fitnessGoal: 'muscle_gain' | 'weight_loss' | 'maintenance' | 'endurance' | string
  workoutDaysCount: number
  created_at: string
  workouts: Record<string, any[]>
}


const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown Date'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Unknown Date'
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch {
    return 'Unknown Date'
  }
}

const formatGoal = (goal: string) => {
  const goalMap: Record<string, string> = {
    muscle_gain: 'Muscle Gain',
    weight_loss: 'Weight Loss',
    maintenance: 'Weight Maintenance',
    endurance: 'Endurance Training'
  }
  return goalMap[goal] || goal
}

const WorkoutPlans: React.FC = () => {
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [workoutPlans, setWorkoutPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        const profile = await userService.getProfile()
        setUserProfile(profile)
        const plans = await workoutPlanService.getUserWorkoutPlans()
        setWorkoutPlans(plans)
      } catch (err) {
        setError('Failed to load workout plans')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkoutPlans()
  }, [])

  const handleDeletePlan = async (planId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this plan?')) {
        return
      }
      await workoutPlanService.deletePlan(planId)
      setWorkoutPlans(currentPlans =>
        currentPlans.filter(plan => plan.plan_id !== planId)
      )
    } catch {
      setError('Failed to delete workout plan')
    }
  }

  const handleViewPlanDetails = (plan: Plan) => {
    navigate('/workout-plans/details', {
      state: {
        plan: {
          ...plan,
          workouts: Object.entries(plan.workouts).map(([day, exercises]) => ({
            day,
            exercises
          }))
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading workout plans...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div className="workout-plans-page">
      <div className="page-header">
        <h1>My Workout Plans</h1>
        <div className="plan-actions">
          <button
            onClick={() => navigate('/workout-plans/onboarding')}
            className="create-plan-btn"
          >
            Create New Plan
          </button>
        </div>
      </div>
      {workoutPlans.length === 0 ? (
        <div className="no-plans">
          <p>You haven't created any workout plans yet.</p>
          <button
            onClick={() => navigate('/workout-plans/onboarding')}
            className="get-started-btn"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="plans-grid">
          {workoutPlans.map(plan => (
            <div key={plan.plan_id} className="plan-card">
              <h2>{plan.planName || `${formatGoal(plan.fitnessGoal)} Plan`}</h2>
              <div className="plan-details">
                <p>
                  <strong>Fitness Goal:</strong> {formatGoal(plan.fitnessGoal)}
                </p>
                <p>
                  <strong>Workout Frequency:</strong> {plan.workoutDaysCount} days a week
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(plan.created_at)}
                </p>
              </div>
              <div className="plan-actions">
                <button
                  onClick={() => handleViewPlanDetails(plan)}
                  className="view-details-btn"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.plan_id)}
                  className="delete-plan-btn"
                >
                  Delete Plan
                </button>
                <button
                  onClick={() =>
                    navigate('/workout-logging', {
                      state: {
                        source: 'existingPlans',
                        planId: plan.plan_id
                      }
                    })
                  }
                  className="start-workout-btn"
                >
                  Start Workout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkoutPlans
