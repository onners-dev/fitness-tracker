import { useState, useEffect } from 'react';
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
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve pre-filled data from local storage if available
  useEffect(() => {
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Comprehensive validation
    const requiredFields = [
      'height', 'currentWeight', 'fitnessGoal', 
      'activityLevel', 'primaryFocus'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        height: parseFloat(formData.height),
        current_weight: parseFloat(formData.currentWeight),
        target_weight: parseFloat(formData.targetWeight) || null,
        fitness_goal: formData.fitnessGoal,
        activity_level: formData.activityLevel,
        primary_focus: formData.primaryFocus,
      };


      await userService.updateProfile(profileData);

      // Remove first-time setup flag
      localStorage.removeItem('firstTimeSetup');
  
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <h2>Complete Your Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="profile-setup-form">
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
              min="50"
              max="300"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentWeight">Current Weight (kg)</label>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetWeight">Target Weight (kg, optional)</label>
            <input
              type="number"
              id="targetWeight"
              name="targetWeight"
              value={formData.targetWeight}
              onChange={handleChange}
              min="20"
              max="300"
              step="0.1"
            />
          </div>

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

          <button 
            type="submit" 
            className="profile-setup-button"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
