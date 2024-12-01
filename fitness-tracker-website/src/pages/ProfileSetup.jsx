import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import './ProfileSetup.css';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    height: '',
    current_weight: '',
    fitness_goal: '',
    activity_level: ''
  });
  const [existingProfile, setExistingProfile] = useState(null);

  // Fetch existing profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setExistingProfile(profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine existing profile data with new form data
      const updatedProfile = {
        ...(existingProfile || {}),
        ...formData
      };
      
      await userService.updateProfile(updatedProfile);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const renderStep1 = () => (
    <div className="setup-step">
      <h3>Let's set your fitness goals</h3>
      <div className="form-group">
        <label htmlFor="fitness_goal">What's your primary fitness goal?</label>
        <select
          id="fitness_goal"
          name="fitness_goal"
          value={formData.fitness_goal}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select a goal</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Build Muscle</option>
          <option value="maintenance">Maintain Weight</option>
          <option value="general_fitness">General Fitness</option>
        </select>
      </div>
      <button onClick={() => setStep(2)} className="next-button">
        Next
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="setup-step">
      <h3>Physical Measurements</h3>
      <div className="form-group">
        <label htmlFor="height">Height (cm)</label>
        <input
          type="number"
          id="height"
          name="height"
          value={formData.height}
          onChange={handleChange}
          placeholder="Enter your height in centimeters"
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="current_weight">Weight (kg)</label>
        <input
          type="number"
          id="current_weight"
          name="current_weight"
          value={formData.current_weight}
          onChange={handleChange}
          placeholder="Enter your weight in kilograms"
          className="form-input"
        />
      </div>
      <button onClick={() => setStep(3)} className="next-button">
        Next
      </button>
      <button onClick={() => setStep(1)} className="back-button">
        Back
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="setup-step">
      <h3>Activity Level</h3>
      <div className="form-group">
        <label htmlFor="activity_level">How active are you?</label>
        <select
          id="activity_level"
          name="activity_level"
          value={formData.activity_level}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select activity level</option>
          <option value="sedentary">Sedentary (little or no exercise)</option>
          <option value="lightly_active">Lightly Active (1-3 days/week)</option>
          <option value="moderately_active">Moderately Active (3-5 days/week)</option>
          <option value="very_active">Very Active (6-7 days/week)</option>
        </select>
      </div>
      <button onClick={handleSubmit} className="complete-button">
        Complete Setup
      </button>
      <button onClick={() => setStep(2)} className="back-button">
        Back
      </button>
    </div>
  );

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <div className="setup-header">
          <h2>Complete Your Profile</h2>
          <p>Help us personalize your experience</p>
        </div>

        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="skip-section">
          <button onClick={handleSkip} className="skip-button">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
