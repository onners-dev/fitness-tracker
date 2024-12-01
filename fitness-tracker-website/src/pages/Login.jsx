import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(credentials.email, credentials.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
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
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>
          
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>

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
