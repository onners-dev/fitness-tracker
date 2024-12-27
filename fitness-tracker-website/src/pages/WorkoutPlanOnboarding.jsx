import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkoutPlanOnboarding.css';

const WorkoutPlanOnboarding = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  const planOptions = [
    {
      id: 'auto-generate',
      title: 'AI-Powered Plan',
      description: 'Let our intelligent algorithm create a personalized workout plan tailored to your fitness goals, activity level, and profile.',
      icon: '🤖',
      benefits: [
        'Personalized recommendations',
        'Data-driven exercise selection',
        'Adaptive to your fitness level'
      ]
    },
    {
      id: 'custom-create',
      title: 'Custom Workout Builder',
      description: 'Take complete control and design a workout plan that matches your exact preferences, exercise preferences, and schedule.',
      icon: '✍️',
      benefits: [
        'Full customization',
        'Choose your exercises',
        'Flexible day selection'
      ]
    }
  ];

  const handleOptionSelect = () => {
    switch(selectedOption) {
      case 'auto-generate':
        navigate('/fitness-profile-onboarding');
        break;
      case 'custom-create':
        navigate('/workout-plans/builder');
        break;
      default:
        alert('Please select a plan creation method');
    }
  };

  return (
    <div className="workout-plan-onboarding">
      <div className="onboarding-container">
        <h1>Design Your Fitness Journey</h1>
        <p>Choose how you want to create your personalized workout plan</p>

        <div className="plan-options">
          {planOptions.map(option => (
            <div 
              key={option.id}
              className={`plan-option ${selectedOption === option.id ? 'selected' : ''}`}
              onClick={() => setSelectedOption(option.id)}
            >
              <div className="option-header">
                <div className="option-icon">{option.icon}</div>
                <h2>{option.title}</h2>
              </div>
              
              <p className="option-description">{option.description}</p>
              
              <div className="option-benefits">
                <h3>Benefits:</h3>
                <ul>
                  {option.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>

              {selectedOption === option.id && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
          ))}
        </div>

        <button 
          className="continue-btn"
          onClick={handleOptionSelect}
          disabled={!selectedOption}
        >
          Continue to Plan Creation
        </button>
      </div>
    </div>
  );
};

export default WorkoutPlanOnboarding;
