import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in and verified
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified'); // Assume this is set after verification

  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If not verified, redirect to a verification notice page
  if (isVerified !== 'true') {
    return <Navigate to="/verify-email" replace />;
  }

  // If logged in and verified, show the protected component
  return children;
};

export default ProtectedRoute;
