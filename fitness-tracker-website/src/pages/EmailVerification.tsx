import React, { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/api.js'
import './EmailVerification.css'

// Simple decoding fallback type
type DecodedToken = {
  email?: string
  email_verified?: boolean
  [key: string]: unknown
}

// Try to import jwt-decode, fall back to atob
const jwtDecode = (() => {
  try {
    // Try to import default export first
    // @ts-ignore
    return require('jwt-decode').default || require('jwt-decode')
  } catch (e) {
    return (token?: string) => {
      if (typeof token !== 'string') return null;
      try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) return null;
        // Now TypeScript knows parts[1] is a string
        return JSON.parse(atob(parts[1]));
      } catch (error) {
        console.error('Token decoding error:', error);
        return null;
      }
    }   
  }
})()

const EmailVerification: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [verificationCode, setVerificationCode] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [resendCountdown, setResendCountdown] = useState<number>(0)

  // Extract email from token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    try {
      if (token) {
        const decodedToken = jwtDecode(token) as DecodedToken | null

        if (decodedToken && decodedToken.email && !decodedToken.email_verified) {
          setEmail(String(decodedToken.email))
        } else {
          navigate('/dashboard')
        }
      } else {
        navigate('/login')
      }
    } catch (error) {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }, [navigate])

  // Countdown effect
  useEffect(() => {
    let intervalId: number | undefined
    if (resendCountdown > 0) {
      intervalId = window.setInterval(() => {
        setResendCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [resendCountdown])

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await authService.verifyCode(email, verificationCode)
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      localStorage.setItem('isVerified', 'true')
      localStorage.setItem('firstTimeSetup', 'true')
      navigate('/profile-setup')
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
        error.message ||
        'Verification failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      setResendCountdown(60)
      const response = await authService.resendVerificationCode(email)
      setMessage(response.message || 'New verification code sent!')
    } catch (error: any) {
      setMessage(
        error.message ||
        'Failed to resend verification code. Please try again.'
      )
      setResendCountdown(0)
    }
  }

  if (!email) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifying your account...</p>
      </div>
    )
  }

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <h2>Verify Your Email</h2>
        <div className="verification-instructions">
          <p>We've sent a 6-digit verification code to</p>
          <p>
            <strong>{email}</strong>
          </p>
          <p>Enter the code below to verify your email address</p>
          <p>If you haven't received the email, check your spam folder.</p>
        </div>

        <form onSubmit={handleVerifyCode} className="verification-form">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="_ _ _ _ _ _"
            maxLength={6}
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
            type="button"
          >
            {resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : 'Resend Verification Code'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
