import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Settings.css';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    // Profile Section
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    
    // Fitness Goals
    height: '',
    currentWeight: '',
    targetWeight: '',
    fitnessGoal: '',
    activityLevel: '',
    primaryFocus: '',
    
    // Account Security
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setUserProfile(profile);
        setFormData({
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          dateOfBirth: profile.date_of_birth 
            ? new Date(profile.date_of_birth).toISOString().split('T')[0] 
            : '',
          gender: profile.gender || '',
          height: profile.height,
          currentWeight: profile.current_weight,
          targetWeight: profile.target_weight || '',
          fitnessGoal: profile.fitness_goal,
          activityLevel: profile.activity_level,
          primaryFocus: profile.primary_focus || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } catch (error) {
        console.error('Error fetching profile', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any existing errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileSection = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFitnessSection = () => {
    const newErrors = {};
    if (!formData.height) newErrors.height = 'Height is required';
    if (!formData.currentWeight) newErrors.currentWeight = 'Current weight is required';
    if (!formData.fitnessGoal) newErrors.fitnessGoal = 'Fitness goal is required';
    if (!formData.primaryFocus) newErrors.primaryFocus = 'Primary focus is required'; 
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSecuritySection = () => {
    const newErrors = {};
    
    // Only validate if passwords are being changed
    if (formData.newPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }
      
      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    let isValid = false;
    
    switch(activeSection) {
      case 'profile':
        isValid = validateProfileSection();
        break;
      case 'fitness':
        isValid = validateFitnessSection();
        break;
      case 'security':
        isValid = validateSecuritySection();
        break;
      default:
        isValid = false;
    }

    if (!isValid) return;

    try {
      switch(activeSection) {
        case 'profile':
          await userService.updateProfile({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender
          });
          break;
        case 'fitness':
          await userService.updateProfile({
            height: parseFloat(formData.height),
            current_weight: parseFloat(formData.currentWeight),
            target_weight: parseFloat(formData.targetWeight) || null,
            fitness_goal: formData.fitnessGoal,
            activity_level: formData.activityLevel,
            primary_focus: formData.primaryFocus // Add this
          });
          break;
        case 'security':
          await userService.updatePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          });
          break;
      }

      setSuccessMessage(`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} updated successfully!`);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'An error occurred' });
    }
  };

  const renderSection = () => {
    switch(activeSection) {
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
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
              {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer Not to Say</option>
              </select>
              {errors.gender && <span className="error">{errors.gender}</span>}
            </div>
          </div>
        );
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
              {errors.currentWeight && <span className="error">{errors.currentWeight}</span>}
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
              {errors.fitnessGoal && <span className="error">{errors.fitnessGoal}</span>}
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
        );
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
              {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
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
              {errors.confirmNewPassword && <span className="error">{errors.confirmNewPassword}</span>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-sidebar">
          <h1>Settings</h1>
          <nav>
            <button 
              className={activeSection === 'profile' ? 'active' : ''}
              onClick={() => setActiveSection('profile')}
            >
              Personal Information
            </button>
            <button 
              className={activeSection === 'fitness' ? 'active' : ''}
              onClick={() => setActiveSection('fitness')}
            >
              Fitness Goals
            </button>
            <button 
              className={activeSection === 'security' ? 'active' : ''}
              onClick={() => setActiveSection('security')}
            >
              Account Security
            </button>
          </nav>
        </div>
        <div className="settings-content">
          <form onSubmit={handleSubmit}>
            {renderSection()}
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errors.submit && <div className="error-message">{errors.submit}</div>}
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
