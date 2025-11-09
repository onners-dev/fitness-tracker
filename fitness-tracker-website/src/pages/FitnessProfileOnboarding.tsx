import React, { useState, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/api.js'
import { workoutPlanService } from '../services/workoutPlanService.js'
import './FitnessProfileOnboarding.css'

interface FitnessGoalOption {
  value: string
  label: string
  description: string
}

interface ActivityLevelOption {
  value: string
  label: string
  description: string
}

interface UserProfile {
  fitness_goal?: string
  activity_level?: string
}

interface GeneratedPlanResponse {
  workoutPlanId: string
  planName: string
}

const fitnessGoals: FitnessGoalOption[] = [
  {
    value: 'muscle_gain',
    label: 'Muscle Gain',
    description: 'Build muscle mass and increase strength'
  },
  {
    value: 'weight_loss',
    label: 'Weight Loss',
    description: 'Reduce body fat and improve body composition'
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'Keep current fitness level and stay healthy'
  },
  {
    value: 'endurance',
    label: 'Endurance',
    description: 'Improve cardiovascular fitness and stamina'
  }
]

const activityLevels: ActivityLevelOption[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise, mostly sitting'
  },
  {
    value: 'lightly_active',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days per week'
  },
  {
    value: 'moderately_active',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days per week'
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Hard exercise 6-7 days per week'
  },
  {
    value: 'extremely_active',
    label: 'Extremely Active',
    description: 'Very intense daily exercise or physical job'
  }
]

const FitnessProfileOnboarding: React.FC = () => {
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [fitnessGoal, setFitnessGoal] = useState<string>('')
  const [activityLevel, setActivityLevel] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const submitButtonRef: RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(null)
  const submitTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getProfile()
        setUserProfile(profile)
        if (profile.fitness_goal) setFitnessGoal(profile.fitness_goal)
        if (profile.activity_level) setActivityLevel(profile.activity_level)
      } catch (error) {
        setError('Failed to load user profile')
      }
    }

    fetchUserProfile()
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async () => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setLoading(true)
      setError(null)
      if (submitButtonRef.current) submitButtonRef.current.disabled = true

      await userService.updateProfile({
        fitness_goal: fitnessGoal,
        activity_level: activityLevel
      })

      const generatedPlan: GeneratedPlanResponse = await workoutPlanService.generateWorkoutPlan({
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        plan_name: `${fitnessGoal.replace('_', ' ').toUpperCase()} Plan`
      })

      if (!generatedPlan.workoutPlanId) {
        throw new Error('No plan ID received from server')
      }
      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false)
        if (submitButtonRef.current) {
          submitButtonRef.current.disabled = false
        }
      }, 2000)

      navigate('/workout-plans/generate', {
        state: {
          planId: generatedPlan.workoutPlanId,
          fitnessGoal: fitnessGoal,
          activityLevel: activityLevel,
          planName: generatedPlan.planName,
          isNewPlan: true
        }
      })
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to complete profile setup')
      setIsSubmitting(false)
      if (submitButtonRef.current) {
        submitButtonRef.current.disabled = false
      }
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Setup Error</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="fitness-profile-onboarding">
      <div className="onboarding-container">
        <h1>Let's Customize Your Fitness Journey</h1>

        <div className="onboarding-section">
          <h2>What is Your Primary Fitness Goal?</h2>
          <div className="options-grid">
            {fitnessGoals.map(goal => (
              <div
                key={goal.value}
                className={`option ${fitnessGoal === goal.value ? 'selected' : ''}`}
                onClick={() => setFitnessGoal(goal.value)}
              >
                <h3>{goal.label}</h3>
                <p>{goal.description}</p>
                {fitnessGoal === goal.value && <div className="checkmark">✓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="onboarding-section">
          <h2>What is Your Current Activity Level?</h2>
          <div className="options-grid">
            {activityLevels.map(level => (
              <div
                key={level.value}
                className={`option ${activityLevel === level.value ? 'selected' : ''}`}
                onClick={() => setActivityLevel(level.value)}
              >
                <h3>{level.label}</h3>
                <p>{level.description}</p>
                {activityLevel === level.value && <div className="checkmark">✓</div>}
              </div>
            ))}
          </div>
        </div>

        <button
          ref={submitButtonRef}
          onClick={handleSubmit}
          disabled={!fitnessGoal || !activityLevel || loading || isSubmitting}
          className="continue-btn"
        >
          {loading ? 'Creating Your Plan...' : 'Continue to Workout Plan'}
        </button>
      </div>
    </div>
  )
}

export default FitnessProfileOnboarding
