import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified') === 'true';
  const isFirstTimeSetup = localStorage.getItem('firstTimeSetup') === 'true';

  console.log('🛡️ Protected Route Detailed Check:', {
    token: token ? 'Present' : 'Missing',
    isVerified,
    isFirstTimeSetup,
    currentPath: location.pathname,
    children: children ? 'Present' : 'Missing'
  });

  // Always check for token first
  if (!token) {
    console.log('❌ No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check verification status
  if (!isVerified) {
    console.log('🔒 Not verified, redirecting to email verification');
    return <Navigate to="/verify-email" replace />;
  }

  // Check first-time setup
  if (isFirstTimeSetup) {
    console.log('🆕 First-time setup required, redirecting to profile setup');
    return children.type.name === 'ProfileSetup' 
      ? children 
      : <Navigate to="/profile-setup" replace />;
  }

  // If all checks pass, render children
  return children;
};

export default ProtectedRoute;
