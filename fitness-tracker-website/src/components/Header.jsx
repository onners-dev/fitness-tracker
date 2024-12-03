import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('token');
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        try {
          const profile = await userService.getProfile();
          const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
          setUserInitials(initials);
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
    };

    fetchUserProfile();
  }, [isLoggedIn]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/home') {
      navigate('/home');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <Link to="/home" className="logo">Fitness App</Link>
      <nav>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="link">Dashboard</Link>
            <Link to="/about" className="link">About</Link>
            <div className="profile-menu">
              <div className="avatar">
                {userInitials}
              </div>
              <div className="dropdown-content">
                <Link to="/dashboard" className="dropdown-item">Profile</Link>
                <Link to="/settings" className="dropdown-item">Settings</Link>
                <button onClick={handleSignOut} className="dropdown-item sign-out-btn">
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <a href="#features" onClick={handleFeaturesClick} className="link">Features</a>
            <Link to="/about" className="link">About</Link>
            <Link to="/login" className="link">Login</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
