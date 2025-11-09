import React, { useState, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { userService } from '../services/api.js'
import './Settings.css'

type Section = 'profile' | 'fitness' | 'security'

interface Profile {
  first_name: string
  last_name: string
  email: string
  date_of_birth?: string
  gender?: string
  height?: string | number
  current_weight?: string | number
  target_weight?: string | number
  fitness_goal?: string
  activity_level?: string
  primary_focus?: string
  weight_unit?: string
  height_unit?: string
}

interface SettingsFormData {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: string
  height: string
  currentWeight: string
  targetWeight: string
  fitnessGoal: string
  activityLevel: string
  primaryFocus: string
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

type Errors = Partial<Record<keyof SettingsFormData | 'submit', string>>

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    fitnessGoal: '',
    activityLevel: '',
    primaryFocus: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [errors, setErrors] = useState<Errors>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  // Utility – safely format date for <input type="date" />
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    } catch {
      /* fallback empty string */
    }
    return ''
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getProfile()
        setUserProfile(profile)
        setFormData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          dateOfBirth: formatDateForInput(profile.date_of_birth),
          gender: profile.gender || '',
          height: profile.height ? String(profile.height) : '',
          currentWeight: profile.current_weight ? String(profile.current_weight) : '',
          targetWeight: profile.target_weight ? String(profile.target_weight) : '',
          fitnessGoal: profile.fitness_goal || '',
          activityLevel: profile.activity_level || '',
          primaryFocus: profile.primary_focus || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        })
      } catch (error) {
        console.error('Error fetching profile', error)
      }
    }
    fetchUserProfile()
  }, [])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // --- Validations --- //

  const validateProfileSection = (): boolean => {
    const newErrors: Errors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateFitnessSection = (): boolean => {
    const newErrors: Errors = {}
    if (!formData.height) newErrors.height = 'Height is required'
    if (!formData.currentWeight) newErrors.currentWeight = 'Current weight is required'
    if (!formData.fitnessGoal) newErrors.fitnessGoal = 'Fitness goal is required'
    if (!formData.primaryFocus) newErrors.primaryFocus = 'Primary focus is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSecuritySection = (): boolean => {
    const newErrors: Errors = {}

    // Only validate if passwords are being changed
    if (formData.newPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required'
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match'
      }
      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccessMessage('')
    let isValid = false

    switch (activeSection) {
      case 'profile':
        isValid = validateProfileSection()
        break
      case 'fitness':
        isValid = validateFitnessSection()
        break
      case 'security':
        isValid = validateSecuritySection()
        break
      default:
        isValid = false
    }
    if (!isValid) return

    try {
      switch (activeSection) {
        case 'profile':
          await userService.updateProfile({
            first_name: formData.firstName || null,
            last_name: formData.lastName || null,
            email: formData.email || null,
            date_of_birth: formData.dateOfBirth || null,
            gender: formData.gender || null,
            height: userProfile?.height || null,
            current_weight: userProfile?.current_weight || null,
            target_weight: userProfile?.target_weight || null,
            fitness_goal: userProfile?.fitness_goal || null,
            activity_level: userProfile?.activity_level || null,
            primary_focus: userProfile?.primary_focus || null,
            weight_unit: 'kg',
            height_unit: 'cm'
          })
          break
        case 'fitness':
          await userService.updateProfile({
            height: formData.height ? parseFloat(formData.height) : null,
            current_weight: formData.currentWeight
              ? parseFloat(formData.currentWeight)
              : null,
            target_weight: formData.targetWeight
              ? parseFloat(formData.targetWeight)
              : null,
            fitness_goal: formData.fitnessGoal,
            activity_level: formData.activityLevel,
            primary_focus: formData.primaryFocus,
            first_name: userProfile?.first_name || null,
            last_name: userProfile?.last_name || null,
            email: userProfile?.email || null,
            date_of_birth: userProfile?.date_of_birth || null,
            gender: userProfile?.gender || null,
            weight_unit: 'kg',
            height_unit: 'cm'
          })
          break
        case 'security':
          try {
            await userService.updatePassword({
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword
            })
            setFormData(prev => ({
              ...prev,
              currentPassword: '',
              newPassword: '',
              confirmNewPassword: ''
            }))
            setSuccessMessage('Password updated successfully!')
            setErrors({})
          } catch (passwordError: any) {
            if (passwordError.status === 400) {
              setErrors({
                submit:
                  passwordError.message ||
                  'Invalid current password or new password',
                currentPassword:
                  passwordError.message || 'Current password is incorrect'
              })
            } else {
              setErrors({
                submit: passwordError.message || 'Failed to update password'
              })
            }
            return
          }
          break
      }
      // Refetch profile after update
      const updatedProfile = await userService.getProfile()
      setUserProfile(updatedProfile)
      if (!successMessage) {
        setSuccessMessage(
          `${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} updated successfully!`
        )
      }
    } catch (error: any) {
      if (error.response) {
        setErrors({
          submit:
            error.response.data.message ||
            error.response.data.error ||
            'An error occurred while updating profile'
        })
      } else if (error.request) {
        setErrors({ submit: 'No response received from server' })
      } else {
        setErrors({ submit: 'Error setting up the request' })
      }
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && (
                <span className="error">{errors.dateOfBirth}</span>
              )}
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer Not to Say</option>
              </select>
              {errors.gender && <span className="error">{errors.gender}</span>}
            </div>
          </div>
        )
      case 'fitness':
        return (
          <div className="settings-section">
            <h2>Fitness Goals</h2>
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
              />
              {errors.height && <span className="error">{errors.height}</span>}
            </div>
            <div className="form-group">
              <label>Current Weight (kg)</label>
              <input
                type="number"
                name="currentWeight"
                value={formData.currentWeight}
                onChange={handleChange}
              />
              {errors.currentWeight && (
                <span className="error">{errors.currentWeight}</span>
              )}
            </div>
            <div className="form-group">
              <label>Target Weight (kg)</label>
              <input
                type="number"
                name="targetWeight"
                value={formData.targetWeight}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleChange}
              >
                <option value="">Select Goal</option>
                <option value="weight_loss">Lose Weight</option>
                <option value="muscle_gain">Build Muscle</option>
                <option value="maintenance">Maintain Weight</option>
                <option value="endurance">Improve Endurance</option>
                <option value="general_fitness">General Fitness</option>
              </select>
              {errors.fitnessGoal && (
                <span className="error">{errors.fitnessGoal}</span>
              )}
            </div>
            <div className="form-group">
              <label>Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
              >
                <option value="">Select Activity Level</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div className="form-group">
              <label>Primary Focus</label>
              <select
                name="primaryFocus"
                value={formData.primaryFocus}
                onChange={handleChange}
              >
                <option value="">Select Primary Focus</option>
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardiovascular Fitness</option>
                <option value="flexibility">Flexibility</option>
                <option value="muscle_building">Muscle Building</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="endurance">Endurance</option>
                <option value="overall_fitness">Overall Fitness</option>
              </select>
              {errors.primaryFocus && <span className="error">{errors.primaryFocus}</span>}
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="settings-section">
            <h2>Account Security</h2>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
              {errors.currentPassword && (
                <span className="error">{errors.currentPassword}</span>
              )}
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
              {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
              />
              {errors.confirmNewPassword && (
                <span className="error">{errors.confirmNewPassword}</span>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-sidebar">
          <h1>Settings</h1>
          <nav>
            <button
              className={activeSection === 'profile' ? 'active' : ''}
              onClick={() => setActiveSection('profile')}
              type="button"
            >
              Personal Information
            </button>
            <button
              className={activeSection === 'fitness' ? 'active' : ''}
              onClick={() => setActiveSection('fitness')}
              type="button"
            >
              Fitness Goals
            </button>
            <button
              className={activeSection === 'security' ? 'active' : ''}
              onClick={() => setActiveSection('security')}
              type="button"
            >
              Account Security
            </button>
          </nav>
        </div>
        <div className="settings-content">
          <form onSubmit={handleSubmit}>
            {renderSection()}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
