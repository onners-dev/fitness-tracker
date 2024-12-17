import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified') === 'true';
  const isFirstTimeSetup = localStorage.getItem('firstTimeSetup') === 'true';

  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If this is a first-time setup, allow access to profile setup
  if (isFirstTimeSetup) {
    return children;
  }

  // If not verified, redirect to verification page
  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If logged in, verified, and not in first-time setup, show the protected component
  return children;
};

export default ProtectedRoute;
