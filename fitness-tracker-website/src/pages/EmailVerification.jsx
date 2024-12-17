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

  // Get email and token from location state
  const email = location.state?.email;
  const token = location.state?.token;

  useEffect(() => {
    const verifyEmail = async () => {
      // If no token is present, redirect to signup
      if (!token) {
        navigate('/signup');
        return;
      }

      try {
        const response = await axios.get(`/api/verify-email?token=${token}`);
        setMessage(response.data.message);
        setTimeout(() => navigate('/profile-setup'), 3000);
      } catch (error) {
        setMessage('Verification failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleResendEmail = async () => {
    try {
      setIsResendDisabled(true);
      
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
            {(message.includes('failed') || message.includes('Verification')) && (
              <>
                <button 
                  onClick={handleResendEmail} 
                  className="resend-button"
                  disabled={isResendDisabled}
                >
                  {isResendDisabled ? 'Resend in 60s' : "Didn't receive an email? Resend"}
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="retry-button"
                >
                  Retry Verification
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
