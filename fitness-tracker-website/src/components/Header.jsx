import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  const [userInitials, setUserInitials] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <>
      <header className="header">
        <Link to="/home" className="logo">Arcus</Link>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {isLoggedIn ? (
            <>
              <div 
                className="header-dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'tracking' ? null : 'tracking');
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

              <div 
                className="header-dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'fitness' ? null : 'fitness');
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

              <div 
                className="header-dropdown profile-dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'profile' ? null : 'profile');
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

        {/* Mobile Hamburger Menu */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="mobile-nav-overlay open" 
            onClick={toggleMobileMenu}
          ></div>
          <div className="mobile-nav open">
            <div className="mobile-nav-header">
              <Link to="/home" className="logo">Arcus</Link>
              <button 
                className="mobile-nav-close" 
                onClick={toggleMobileMenu}
              >
                ✕
              </button>
            </div>
            <div className="mobile-nav-content">
              {isLoggedIn ? (
                <>
                  <div className="mobile-dropdown">
                    <span>Navigation</span>
                    <div className="mobile-dropdown-content">
                      <Link to="/dashboard" onClick={toggleMobileMenu}>Dashboard</Link>
                      <Link to="/settings" onClick={toggleMobileMenu}>Settings</Link>
                    </div>
                  </div>

                  <div className="mobile-dropdown">
                    <span>Tracking</span>
                    <div className="mobile-dropdown-content">
                      <Link to="/calorietracker" onClick={toggleMobileMenu}>Calorie Tracking</Link>
                      <Link to="/workout-logging" onClick={toggleMobileMenu}>Log Workout</Link>
                      <Link to="/trends" onClick={toggleMobileMenu}>Progress Trends</Link>
                    </div>
                  </div>

                  <div className="mobile-dropdown">
                    <span>Fitness</span>
                    <div className="mobile-dropdown-content">
                      <Link to="/workouts" onClick={toggleMobileMenu}>Workout Library</Link>
                      <Link to="/workout-plans" onClick={toggleMobileMenu}>Workout Plans</Link>
                    </div>
                  </div>

                  <button onClick={handleSignOut} className="mobile-signout">Sign Out</button>
                </>
              ) : (
                <div className="mobile-dropdown">
                  <span>Navigation</span>
                  <div className="mobile-dropdown-content">
                    <Link to="/about" onClick={toggleMobileMenu}>About</Link>
                    <Link to="/login" onClick={toggleMobileMenu}>Log in</Link>
                    <Link to="/signup" onClick={toggleMobileMenu}>Sign up</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
