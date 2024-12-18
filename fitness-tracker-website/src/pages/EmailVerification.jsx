import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './EmailVerification.css';
import jwtDecode from 'jwt-decode'; // Make sure to install jwt-decode

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Extract email from token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    try {
      if (token) {
        const decodedToken = jwtDecode(token);
        
        console.group('🔍 Token Verification');
        console.log('Decoded Token:', decodedToken);
        console.log('Email from Token:', decodedToken.email);
        console.log('Email Verified:', decodedToken.email_verified);
        console.groupEnd();

        // If email exists in token and is not verified
        if (decodedToken.email && !decodedToken.email_verified) {
          setEmail(decodedToken.email);
        } else {
          // Redirect to dashboard if already verified
          navigate('/dashboard');
        }
      } else {
        // No token, redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('❌ Token Decoding Error:', error);
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  // Countdown effect
  useEffect(() => {
    let intervalId;
    if (resendCountdown > 0) {
      intervalId = setInterval(() => {
        setResendCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [resendCountdown]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await authService.verifyCode(email, verificationCode);
      
      console.log('✅ Email Verification Response:', response);
  
      // Always set token if present
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      localStorage.setItem('isVerified', 'true');
      localStorage.setItem('firstTimeSetup', 'true');
      
      // Redirect to profile setup, not login
      navigate('/profile-setup');
    } catch (error) {
      console.error('❌ Verification Error:', error);
      
      setMessage(
        error.response?.data?.message || 
        'Verification failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    try {
      // Start 60-second countdown
      setResendCountdown(60);
      
      const response = await authService.resendVerificationCode(email);
      
      // Use the message from the server response
      setMessage(response.message || 'New verification code sent!');
    } catch (error) {
      // More specific error handling
      setMessage(
        error.message || 
        'Failed to resend verification code. Please try again.'
      );
      
      // Reset countdown if there's an error
      setResendCountdown(0);
    }
  };

  // Don't render anything until email is set
  if (!email) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifying your account...</p>
      </div>
    );
  }

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <h2>Verify Your Email</h2>
        
        <div className="verification-instructions">
          <p>We've sent a 6-digit verification code to</p>
          <p><strong>{email}</strong></p>
          <p>Enter the code below to verify your email address</p>
          <p>If you haven't received the email, check your spam folder.</p>
        </div>

        <form onSubmit={handleVerifyCode} className="verification-form">
          <input 
            type="text" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="_ _ _ _ _ _"
            maxLength="6"
            required
            pattern="\d{6}"
          />
          
          <button 
            type="submit" 
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        {message && <div className="verification-message">{message}</div>}

        <div className="verification-actions">
          <button 
            onClick={handleResendCode}
            disabled={resendCountdown > 0}
          >
            {resendCountdown > 0 
              ? `Resend in ${resendCountdown}s` 
              : 'Resend Verification Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
