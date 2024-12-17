import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import './ProfileSetup.css';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    height: '',
    currentWeight: '',
    targetWeight: '',
    fitnessGoal: '',
    activityLevel: '',
    primaryFocus: '',
    weightUnit: 'kg',
    heightUnit: 'cm'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lifecycle methods and side effects
  useEffect(() => {
    // Check if user is authorized to be on this page
    const firstTimeSetup = localStorage.getItem('firstTimeSetup');
    if (firstTimeSetup !== 'true') {
      navigate('/dashboard');
    }

    // Optional: Retrieve pre-filled data from local storage
    const storedGoals = JSON.parse(localStorage.getItem('signupFitnessGoals') || '{}');
    
    // Pre-fill fitness goals if available
    if (storedGoals.fitnessGoal || storedGoals.activityLevel) {
      setFormData(prev => ({
        ...prev,
        fitnessGoal: storedGoals.fitnessGoal || '',
        activityLevel: storedGoals.activityLevel || ''
      }));

      // Clear the stored goals
      localStorage.removeItem('signupFitnessGoals');
    }
  }, [navigate]);

  // Handle input changes and clear previous errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  // Comprehensive input validation
  const validateForm = () => {
    const requiredFields = [
      'height', 'currentWeight', 'fitnessGoal', 
      'activityLevel', 'primaryFocus'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Additional validations
    const height = parseFloat(formData.height);
    const currentWeight = parseFloat(formData.currentWeight);
    const targetWeight = parseFloat(formData.targetWeight) || null;

    if (height < 50 || height > 250) {
      setError('Please enter a valid height between 50 and 250 cm');
      return false;
    }

    if (currentWeight < 20 || currentWeight > 300) {
      setError('Please enter a valid current weight between 20 and 300 kg');
      return false;
    }

    if (targetWeight !== null && (targetWeight < 20 || targetWeight > 300)) {
      setError('Please enter a valid target weight between 20 and 300 kg');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Prepare profile data for submission
      const profileData = {
        height: parseFloat(formData.height),
        current_weight: parseFloat(formData.currentWeight),
        target_weight: parseFloat(formData.targetWeight) || null,
        fitness_goal: formData.fitnessGoal,
        activity_level: formData.activityLevel,
        primary_focus: formData.primaryFocus,
        weight_unit: formData.weightUnit,
        height_unit: formData.heightUnit
      };
  
      // Submit profile data
      await userService.updateProfile(profileData);
  
      // Clear first-time setup flag
      localStorage.removeItem('firstTimeSetup');
      
      // Set verification to true
      localStorage.setItem('isVerified', 'true');
  
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile setup error:', err);
      
      // Handle specific error scenarios
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.message || 'Failed to update profile');
      } else if (err.request) {
        // Request made but no response received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <h2>Complete Your Profile</h2>
        
        {/* Error Message Display */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Profile Setup Form */}
        <form onSubmit={handleSubmit} className="profile-setup-form">
          {/* Height Input */}
          <div className="form-group">
            <label htmlFor="height">Height</label>
            <div className="input-group">
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                min="50"
                max="250"
                step="0.1"
                placeholder="Enter height"
              />
              <select 
                name="heightUnit"
                value={formData.heightUnit}
                onChange={handleChange}
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          {/* Current Weight Input */}
          <div className="form-group">
            <label htmlFor="currentWeight">Current Weight</label>
            <div className="input-group">
              <input
                type="number"
                id="currentWeight"
                name="currentWeight"
                value={formData.currentWeight}
                onChange={handleChange}
                required
                min="20"
                max="300"
                step="0.1"
                placeholder="Enter current weight"
              />
              <select 
                name="weightUnit"
                value={formData.weightUnit}
                onChange={handleChange}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Target Weight Input (Optional) */}
          <div className="form-group">
            <label htmlFor="targetWeight">Target Weight (Optional)</label>
            <div className="input-group">
              <input
                type="number"
                id="targetWeight"
                name="targetWeight"
                value={formData.targetWeight}
                onChange={handleChange}
                min="20"
                max="300"
                step="0.1"
                placeholder="Enter target weight"
              />
              <select 
                name="weightUnit"
                value={formData.weightUnit}
                onChange={handleChange}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Fitness Goal Selection */}
          <div className="form-group">
            <label htmlFor="fitnessGoal">Primary Fitness Goal</label>
            <select
              id="fitnessGoal"
              name="fitnessGoal"
              value={formData.fitnessGoal}
              onChange={handleChange}
              required
            >
              <option value="">Select your goal</option>
              <option value="weight_loss">Lose Weight</option>
              <option value="muscle_gain">Build Muscle</option>
              <option value="maintenance">Maintain Weight</option>
              <option value="endurance">Improve Endurance</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          {/* Activity Level Selection */}
          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level</label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              required
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightly_active">Lightly Active (1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (3-5 days/week)</option>
              <option value="very_active">Very Active (6-7 days/week)</option>
            </select>
          </div>

          {/* Primary Focus Selection */}
          <div className="form-group">
            <label htmlFor="primaryFocus">Primary Focus</label>
            <select
              id="primaryFocus"
              name="primaryFocus"
              value={formData.primaryFocus}
              onChange={handleChange}
              required
            >
              <option value="">Select your primary focus</option>
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardiovascular Health</option>
              <option value="flexibility">Flexibility and Mobility</option>
              <option value="weight_management">Weight Management</option>
              <option value="overall_wellness">Overall Wellness</option>
            </select>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="profile-setup-button"
            disabled={isLoading}
          >
            {isLoading ? 'Saving Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
