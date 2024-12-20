import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { userService } from '../services/api';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle input changes and clear previous errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  // Validate input before submission
  const validateInput = () => {
    if (!credentials.email.trim()) {
      setError('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!credentials.password) {
      setError('Please enter your password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInput()) return;
    
    setIsLoading(true);
    
    try {
      const loginResponse = await authService.login(
        credentials.email, 
        credentials.password
      );
      
      console.log('Login Response:', loginResponse);
  
      // Ensure token is set
      if (!loginResponse.token) {
        throw new Error('No token received from login');
      }
  
      // Store token
      localStorage.setItem('token', loginResponse.token);
      
      // Set verification status
      localStorage.setItem('isVerified', 
        (loginResponse.user.email_verified === true).toString()
      );
      
      // Navigate based on profile completeness
      if (!loginResponse.user.is_profile_complete) {
        navigate('/profile-setup');
      } else if (loginResponse.user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome Back</h2>
        
        {/* Error Message Display */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
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
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        {/* Footer with Signup Link */}
        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
