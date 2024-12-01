import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="signup-form">
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
            />
          </div>

          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>

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
