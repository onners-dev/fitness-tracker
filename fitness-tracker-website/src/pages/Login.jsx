import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic input validation
    if (!credentials.email.trim()) {
      setError('Please enter your email');
      setIsLoading(false);
      return;
    }

    if (!credentials.password) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to log in
      const response = await authService.login(
        credentials.email, 
        credentials.password
      );
      
      console.log('Login Response:', response);

      // Remove any existing first-time setup flag
      localStorage.removeItem('firstTimeSetup');
      
      // Determine navigation based on verification status
      if (response.user.email_verified) {
        navigate('/dashboard');
      } else {
        navigate('/verify-email', { 
          state: { 
            email: credentials.email 
          } 
        });
      }
    } catch (err) {
      console.error('Login Error:', err);
      
      // Handle specific error types
      if (err.response) {
        // Server responded with an error
        switch (err.response.status) {
          case 400:
            setError('Invalid email or password');
            break;
          case 403:
            setError('Account is inactive or suspended');
            break;
          case 401:
            setError('Unauthorized. Please verify your email.');
            break;
          default:
            setError(err.response.data.message || 'Login failed');
        }
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
