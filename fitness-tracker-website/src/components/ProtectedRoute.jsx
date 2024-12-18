import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified') === 'true';
  const isFirstTimeSetup = localStorage.getItem('firstTimeSetup') === 'true';

  console.group('🛡️ Protected Route Comprehensive Check');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('Is Verified:', isVerified);
  console.log('First Time Setup:', isFirstTimeSetup);
  console.log('Current Path:', location.pathname);
  console.log('Children Type:', children?.type?.name);
  console.groupEnd();

  // Always check for token first
  if (!token) {
    console.warn('❌ No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check verification status
  if (!isVerified) {
    console.warn('🔒 Not verified, redirecting to email verification');
    return <Navigate to="/verify-email" replace />;
  }

  // Check first-time setup
  if (isFirstTimeSetup) {
    console.warn('🆕 First-time setup required');
    
    // If already on profile-setup page, render children
    if (location.pathname === '/profile-setup') {
      return children;
    }

    // Otherwise, redirect to profile setup
    return <Navigate to="/profile-setup" replace />;
  }

  // If all checks pass, render children
  return children;
};

export default ProtectedRoute;
