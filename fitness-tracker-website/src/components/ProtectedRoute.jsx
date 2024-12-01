import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in by looking for the token
  const token = localStorage.getItem('token');

  // If not logged in, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the protected component
  return children;
};

export default ProtectedRoute;
