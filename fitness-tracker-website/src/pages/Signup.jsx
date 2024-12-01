import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Signup.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return false;
    }
    return true;
  };

  const [isLoading, setIsLoading] = useState(false);



// In Signup.jsx, modify the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  try {
    // Register user and get token
    await authService.register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender
    });
    navigate('/profile-setup');
  } catch (err) {
    setError(err.response?.data?.message || 'An error occurred');
  }
};



  const renderStep1 = () => (
    <form onSubmit={handleNextStep} className="signup-form">
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="signup-button">
        Next
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="signup-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="8"
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength="8"
        />
      </div>

      <div className="button-group">
        <button type="button" onClick={handlePrevStep} className="back-button">
          Back
        </button>
        <button type="submit" className="signup-button" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create Account</h2>
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>
        {error && <div className="error-message">{error}</div>}
        
        {step === 1 ? renderStep1() : renderStep2()}

        <div className="signup-footer">
          <p>
            Already have an account? <Link to="/login" className="login-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
