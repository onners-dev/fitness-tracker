import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('token');
  const [userInitials, setUserInitials] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="header" onClick={closeDropdowns}>
      <Link to="/home" className="logo">Arcus</Link>
      <nav>
        {isLoggedIn ? (
          <>
            {/* Tracking Dropdown */}
            <div 
              className="header-dropdown"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('tracking');
              }}
            >
              <span>Tracking</span>
              {activeDropdown === 'tracking' && (
                <div className="dropdown-menu">
                  <Link to="/calorietracker" className="dropdown-item">
                    Calorie Tracking
                  </Link>
                  <Link to="/workout-logging" className="dropdown-item">
                    Log Workout
                  </Link>
                  <Link to="/trends" className="dropdown-item">
                    Progress Trends
                  </Link>
                </div>
              )}
            </div>

            {/* Fitness Dropdown */}
            <div 
              className="header-dropdown"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('fitness');
              }}
            >
              <span>Fitness</span>
              {activeDropdown === 'fitness' && (
                <div className="dropdown-menu">
                  <Link to="/workouts" className="dropdown-item">
                    Workout Library
                  </Link>
                  <Link to="/workout-plans" className="dropdown-item">
                    Workout Plans
                  </Link>
                </div>
              )}
            </div>

            <Link to="/dashboard" className="link">Dashboard</Link>

            {/* Profile Dropdown */}
            <div 
              className="header-dropdown profile-dropdown"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('profile');
              }}
            >
              <div className="avatar">{userInitials}</div>
              {activeDropdown === 'profile' && (
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item">Profile</Link>
                  <Link to="/settings" className="dropdown-item">Settings</Link>
                  <button 
                    onClick={handleSignOut} 
                    className="dropdown-item sign-out-btn"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/about" className="link">About</Link>
            <div className="auth-buttons">
              <Link to="/login" className="link">Log in</Link>
              <Link to="/signup" className="signup-button">Sign up</Link>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
