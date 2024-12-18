import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './EmailVerification.css';

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const email = location.state?.email;
  const fromSignup = location.state?.fromSignup || false;
  const initialToken = location.state?.token;

  // Use effect to handle initial token
  useEffect(() => {
    if (initialToken) {
      localStorage.setItem('token', initialToken);
    }
  }, [initialToken]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await authService.verifyCode(email, verificationCode);
      
      // Always set token
      localStorage.setItem('token', response.token || '');
      localStorage.setItem('isVerified', 'true');
      localStorage.removeItem('firstTimeSetup');
      
      navigate('/profile-setup');
    } catch (error) {
      console.error('Verification error:', error);
      setMessage(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleResendCode = async () => {
    try {
      setIsResendDisabled(true);
      const response = await authService.resendVerificationCode(email);
      
      setMessage(response.message);
      
      // Re-enable resend after 60 seconds
      setTimeout(() => setIsResendDisabled(false), 60000);
    } catch (error) {
      setMessage('Failed to resend verification code');
      setIsResendDisabled(false);
    }
  };

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <h2>Verify Your Email</h2>
        
        <div className="verification-instructions">
          <p>We've sent a 6-digit verification code to <strong>{email}</strong></p>
          <p>Please enter the code below to verify your email</p>
        </div>

        <form onSubmit={handleVerifyCode} className="verification-form">
          <input 
            type="text" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength="6"
            required
          />
          
          <button 
            type="submit" 
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {message && <div className="verification-message">{message}</div>}

        <div className="verification-actions">
          <button 
            onClick={handleResendCode}
            disabled={isResendDisabled}
          >
            {isResendDisabled ? 'Resend in 60s' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
