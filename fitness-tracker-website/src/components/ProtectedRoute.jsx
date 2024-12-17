import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isVerified = localStorage.getItem('isVerified') === 'true';
  const isFirstTimeSetup = localStorage.getItem('firstTimeSetup') === 'true';

  console.log('ProtectedRoute Detailed Checks:', {
    token: token,
    tokenType: typeof token,
    isVerified: isVerified,
    isFirstTimeSetup: isFirstTimeSetup
  });

  // More robust token checking
  const isValidToken = token && 
                       token !== 'null' && 
                       token !== 'undefined' && 
                       typeof token === 'string';

  // If no valid token, redirect to login
  if (!isValidToken) {
    console.log('Invalid token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If first-time setup is needed, allow access to profile setup
  if (isFirstTimeSetup) {
    console.log('First-time setup needed, allowing profile setup access');
    return children;
  }

  // If not verified, redirect to verification
  if (!isVerified) {
    console.log('Not verified, redirecting to email verification');
    return <Navigate to="/verify-email" replace />;
  }

  // If all checks pass, show the component
  return children;
};

export default ProtectedRoute;
