import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmailVerification.css';

const EmailVerification = () => {
  const [message, setMessage] = useState('Verifying...');
  const [isLoading, setIsLoading] = useState(true);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Log the location state to debug
  console.log('Location State:', location.state);

  useEffect(() => {
    const verifyEmail = async () => {
      // Use location state or fallback to URL query parameter
      const token = location.state?.token || new URLSearchParams(location.search).get('token');

      if (!token) {
        setMessage('No verification token found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/verify-email`, {
          params: { token }
        });
        
        setMessage(response.data.message);
        setTimeout(() => navigate('/profile-setup'), 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
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
      
      await axios.post('/api/resend-verification', { email });
      
      setMessage('Verification email resent. Please check your inbox.');
      
      // Re-enable resend after 60 seconds
      setTimeout(() => setIsResendDisabled(false), 60000);
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again later.');
      setIsResendDisabled(false);
    }
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
            {(message.includes('failed') || message.includes('No verification')) && (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
