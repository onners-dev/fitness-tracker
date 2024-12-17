import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in and verified
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified') === 'true';

  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If not verified, redirect to a verification notice page
  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If logged in and verified, show the protected component
  return children;
};

export default ProtectedRoute;
