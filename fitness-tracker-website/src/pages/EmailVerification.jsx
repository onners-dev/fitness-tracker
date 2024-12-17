import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './EmailVerification.css';

const EmailVerification = () => {
  const [message, setMessage] = useState('Verification Pending');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if email and token are available from signup
  const initialEmail = location.state?.email;
  const initialToken = location.state?.token;
  const verificationStatus = new URLSearchParams(location.search).get('verified');
  const tokenFromUrl = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      // If verification status is true, attempt to verify
      if (verificationStatus === 'true' && tokenFromUrl) {
        try {
          const response = await authService.verifyEmail(tokenFromUrl);
          
          setIsVerified(true);
          setMessage('Email verified successfully!');
          
          // Set up first-time setup flag
          localStorage.setItem('firstTimeSetup', 'true');
          localStorage.setItem('isVerified', 'true');
        } catch (error) {
          setMessage('Verification failed. Please try again.');
          setIsVerified(false);
        }
      }
    };

    // If no initial email or token, and no verification in progress
    if (!initialEmail && !initialToken && verificationStatus !== 'true') {
      navigate('/signup');
      return;
    }

    verifyEmail();
  }, [initialEmail, initialToken, verificationStatus, tokenFromUrl, navigate]);

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      setIsResendDisabled(true);
      
      if (!initialEmail) {
        setMessage('Email not found. Please register again.');
        return;
      }
      
      const response = await authService.resendVerificationEmail(initialEmail);
      
      setMessage(response.message);
      
      // Re-enable resend after 60 seconds
      setTimeout(() => {
        setIsResendDisabled(false);
        setIsLoading(false);
      }, 60000);
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again later.');
      setIsResendDisabled(false);
      setIsLoading(false);
    }
  };

  const handleContinueToProfileSetup = () => {
    navigate('/profile-setup');
  };

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <h2>Verify Your Email</h2>
        
        {!isVerified ? (
          <>
            <div className="verification-instructions">
              <p>We've sent a verification email to <strong>{initialEmail}</strong></p>
              <p>Please check your inbox and click the verification link to activate your account.</p>
            </div>

            <div className="verification-actions">
              <button 
                onClick={handleResendEmail} 
                className="resend-button"
                disabled={isResendDisabled || isLoading}
              >
                {isResendDisabled ? 'Resend in 60s' : "Didn't receive an email? Resend"}
              </button>

              <button 
                onClick={() => navigate('/signup')} 
                className="back-button"
              >
                Back to Signup
              </button>
            </div>
          </>
        ) : (
          <div className="verified-container">
            <p>{message}</p>
            <button 
              onClick={handleContinueToProfileSetup} 
              className="continue-button"
            >
              Continue to Profile Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
