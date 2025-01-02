import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { workoutPlanService } from '../services/workoutPlanService';
import './Header.css';

const WorkoutPlansLink = ({ onClick, className }) => {
  const navigate = useNavigate();
  const [hasExistingPlans, setHasExistingPlans] = useState(false);

  useEffect(() => {
    const checkExistingPlans = async () => {
      try {
        const plans = await workoutPlanService.getUserWorkoutPlans();
        setHasExistingPlans(plans.length > 0);
      } catch (error) {
        console.error('Error checking existing workout plans:', error);
        // Fallback to onboarding if there's an error
        setHasExistingPlans(false);
      }
    };

    checkExistingPlans();
  }, []);

  const handleClick = () => {
    if (onClick) onClick();
    navigate(hasExistingPlans ? '/workout-plans/existing' : '/workout-plans/onboarding');
  };

  return (
    <span 
      onClick={handleClick} 
      style={{ cursor: 'pointer' }}
      className={className}
    >
      Workout Plans
    </span>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  const [userInitials, setUserInitials] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

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
    localStorage.removeItem('isAdmin');  // Clear admin status
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
              {/* Tracking Dropdown */}
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

              {/* Fitness Dropdown */}
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
                    <WorkoutPlansLink 
                      onClick={() => setActiveDropdown(null)} 
                      className="dropdown-item"
                    />
                  </div>
                )}
              </div>

              {/* Admin Dropdown - Only visible to admin users */}
              {isAdmin && (
                <div 
                  className="header-dropdown"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'admin' ? null : 'admin');
                  }}
                >
                  <span>Admin</span>
                  {activeDropdown === 'admin' && (
                    <div className="dropdown-menu">
                      <Link to="/admin" className="dropdown-item">Dashboard</Link>
                      <Link to="/admin/users" className="dropdown-item">User Management</Link>
                      <Link to="/admin/content" className="dropdown-item">Content Moderation</Link>
                      <Link to="/admin/workouts" className="dropdown-item">Workout Moderation</Link>
                      <Link to="/admin/workouts/exercises" className="dropdown-item">Edit Exercises</Link> {/* New Link */}
                      <Link to="/admin/nutrition" className="dropdown-item">Nutrition Moderation</Link>
                      <Link to="/admin/analytics" className="dropdown-item">System Analytics</Link>
                    </div>
                  )}
                </div>
              )}

              <Link to="/dashboard" className="link">Dashboard</Link>

              {/* Profile Dropdown */}
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
                      <WorkoutPlansLink 
                        onClick={toggleMobileMenu}
                        className="mobile-dropdown-item"
                      />
                    </div>
                  </div>

                  {/* Mobile Admin Dropdown */}
                  {isAdmin && (
                    <div className="mobile-dropdown">
                      <span>Admin</span>
                      <div className="mobile-dropdown-content">
                        <Link to="/admin" onClick={toggleMobileMenu}>Dashboard</Link>
                        <Link to="/admin/users" onClick={toggleMobileMenu}>User Management</Link>
                        <Link to="/admin/content" onClick={toggleMobileMenu}>Content Moderation</Link>
                        <Link to="/admin/workouts" onClick={toggleMobileMenu}>Workout Moderation</Link>
                        <Link to="/admin/workouts/exercises" onClick={toggleMobileMenu}>Edit Exercises</Link> {/* New Link */}
                        <Link to="/admin/nutrition" onClick={toggleMobileMenu}>Nutrition Moderation</Link>
                        <Link to="/admin/analytics" onClick={toggleMobileMenu}>System Analytics</Link>
                      </div>
                    </div>
                  )}

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
