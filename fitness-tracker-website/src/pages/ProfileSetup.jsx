import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes and clear previous errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  // Calculate user's age based on date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Validate first step of signup form
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

  // Validate second step of signup form
  const validateStep2 = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long, include uppercase, lowercase, number, and special character');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate both steps
    if (!validateStep1() || !validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Calculate user's age
      const age = calculateAge(formData.dateOfBirth);
      
      // Attempt to register user
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        age: age
      });
      
      // Check if registration was successful
      if (response.email) {
        console.log('Registration successful', response);
        
        // Navigate to email verification with signup context
        navigate('/verify-email', { 
          state: { 
            email: response.email,
            fromSignup: true,
            token: response.token  // Pass token if available
          } 
        });
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      console.error('Full Registration error:', err);
      
      // Handle specific error types
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.message || 'Registration failed');
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

  // Render first step of signup form (personal details)
  const renderStep1 = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (validateStep1()) {
        setStep(2);
      }
    }} className="signup-form">
      {/* First Name Input */}
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="Enter your first name"
        />
      </div>

      {/* Last Name Input */}
      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Enter your last name"
        />
      </div>

      {/* Gender Selection */}
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

      {/* Date of Birth Input */}
      <div className="form-group">
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <button type="submit" className="signup-button">
        Next
      </button>
    </form>
  );

  // Render second step of signup form (account details)
  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="signup-form">
      {/* Email Input */}
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
      </div>

      {/* Password Input */}
      <div className="form-group password-group">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
            placeholder="Create a strong password"
          />
          <button 
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="form-group password-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="8"
            placeholder="Confirm your password"
          />
          <button 
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="button-group">
        <button 
          type="button" 
          onClick={() => setStep(1)} 
          className="back-button"
        >
          Back
        </button>
        <button 
          type="submit" 
          className="signup-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create Account</h2>
        
        {/* Steps Indicator */}
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>
        
        {/* Error Message Display */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Conditional Rendering of Steps */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}

        {/* Footer with Login Link */}
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
