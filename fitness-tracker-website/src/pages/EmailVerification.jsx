import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './EmailVerification.css';

const EmailVerification = () => {
  const [message, setMessage] = useState('Verifying...');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = location.state?.token || new URLSearchParams(location.search).get('token');
      const email = location.state?.email;
  
      if (!token) {
        setMessage('No verification token found');
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await authService.verifyEmail(token);
        
        // Set verification state and local storage
        setIsVerified(true);
        localStorage.setItem('isVerified', 'true');
        
        // Check if this is a first-time verification
        const isFirstTimeSetup = localStorage.getItem('firstTimeSetup') === 'true';
        
        if (isFirstTimeSetup) {
          // Automatically redirect to profile setup for first-time users
          localStorage.removeItem('firstTimeSetup');
          navigate('/profile-setup');
        } else {
          // For existing users, show verification success
          setMessage(response.message);
          setIsLoading(false);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
        setIsVerified(false);
        setIsLoading(false);
      }
    };
  
    verifyEmail();
  }, [location, navigate]);
  

  const handleResendEmail = async () => {
    try {
      setIsResendDisabled(true);
      const email = location.state?.email;
      
      if (!email) {
        setMessage('Email not found. Please register again.');
        return;
      }
      
      const response = await authService.resendVerificationEmail(email);
      
      setMessage(response.message);
      
      // Re-enable resend after 60 seconds
      setTimeout(() => setIsResendDisabled(false), 60000);
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again later.');
      setIsResendDisabled(false);
    }
  };

  const handleContinueToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        {isLoading ? (
          <div className="loading-spinner">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="verification-message">
            <h2>{message}</h2>
            
            {isVerified ? (
              <div className="verified-actions">
                <p>Your email has been successfully verified!</p>
                <button 
                  onClick={handleContinueToLogin} 
                  className="continue-button"
                >
                  Continue to Login
                </button>
              </div>
            ) : (
              <div className="unverified-actions">
                <button 
                  onClick={handleResendEmail} 
                  className="resend-button"
                  disabled={isResendDisabled}
                >
                  {isResendDisabled ? 'Resend in 60s' : "Didn't receive an email? Resend"}
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="retry-button"
                >
                  Go Back to Signup
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
