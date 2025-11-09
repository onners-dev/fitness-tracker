import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { userService } from "../services/api.js";
import { workoutPlanService } from "../services/workoutPlanService.js";
import LogoIcon from "./LogoIcon.js";
import "./Header.css";

type WorkoutPlansLinkProps = {
  onClick?: () => void;
  className?: string;
};

const WorkoutPlansLink = ({ onClick, className }: WorkoutPlansLinkProps) => {
  const navigate = useNavigate();
  const [hasExistingPlans, setHasExistingPlans] = useState<boolean>(false);

  useEffect(() => {
    const checkExistingPlans = async () => {
      try {
        const plans = await workoutPlanService.getUserWorkoutPlans();
        setHasExistingPlans(Array.isArray(plans) && plans.length > 0);
      } catch {
        setHasExistingPlans(false);
      }
    };
    checkExistingPlans();
  }, []);

  const handleClick = () => {
    if (onClick) onClick();
    navigate(hasExistingPlans ? "/workout-plans/existing" : "/workout-plans/onboarding");
  };

  return (
    <span
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      className={className}
    >
      Workout Plans
    </span>
  );
};

type DropdownKey = "tracking" | "fitness" | "admin" | "profile" | null;

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [userInitials, setUserInitials] = useState<string>("");
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [logoHovered, setLogoHovered] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        try {
          const profile = await userService.getProfile();
          const initials = `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase();
          setUserInitials(initials);
        } catch {
          setUserInitials("");
        }
      }
    };
    fetchUserProfile();
  }, [isLoggedIn]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/home");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((open) => !open);
  };

  useEffect(() => {
    if (!activeDropdown) return;
    function handleClickOutside(event: MouseEvent | globalThis.MouseEvent) {
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside as EventListener);
  }, [activeDropdown]);

  return (
    <>
      <header className="header">
        <Link
          to="/home"
          className="logo"
          style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          <LogoIcon
            width={80}
            height={80}
            hovered={logoHovered}
            style={{}}
            color1="#6366F1"
            color2="#06B6D4"
          />

          <span style={{ fontSize: "2rem" }}>Arcus</span>
        </Link>
        <nav className="desktop-nav" ref={desktopNavRef}>
          {isLoggedIn ? (
            <>
              <div
                className="header-dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "tracking" ? null : "tracking");
                }}
              >
                <span>Tracking</span>
                {activeDropdown === "tracking" && (
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
                  setActiveDropdown(activeDropdown === "fitness" ? null : "fitness");
                }}
              >
                <span>Fitness</span>
                {activeDropdown === "fitness" && (
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
              {isAdmin && (
                <div
                  className="header-dropdown"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === "admin" ? null : "admin");
                  }}
                >
                  <span>Admin</span>
                  {activeDropdown === "admin" && (
                    <div className="dropdown-menu">
                      <Link to="/admin" className="dropdown-item">Dashboard</Link>
                      <Link to="/admin/users" className="dropdown-item">User Management</Link>
                      <Link to="/admin/content" className="dropdown-item">Content Moderation</Link>
                      <Link to="/admin/workouts" className="dropdown-item">Workout Moderation</Link>
                      <Link to="/admin/workouts/exercises" className="dropdown-item">Edit Exercises</Link>
                      <Link to="/admin/nutrition" className="dropdown-item">Nutrition Moderation</Link>
                      <Link to="/admin/analytics" className="dropdown-item">System Analytics</Link>
                    </div>
                  )}
                </div>
              )}
              <Link to="/dashboard" className="link">Dashboard</Link>
              <div
                className={`header-dropdown profile-dropdown${activeDropdown === "profile" ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "profile" ? null : "profile");
                }}
              >
                <div
                  className="avatar"
                  tabIndex={0}
                  aria-label="Open Profile Menu"
                  onFocus={() => setActiveDropdown("profile")}
                  onBlur={() => setActiveDropdown(null)}
                >
                  {userInitials}
                </div>
                {activeDropdown === "profile" && (
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
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header> 
      {isMobileMenuOpen && (
        <>
          <div className="mobile-nav-overlay open" onClick={toggleMobileMenu}></div>
          <div className="mobile-nav open">
            <div className="mobile-nav-header">
              <Link to="/home" className="logo" style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <LogoIcon
                width={30}
                height={30}
                hovered={true}
                style={{}}
                color1="#6366F1"
                color2="#06B6D4"
              />

                <span>Arcus</span>
              </Link>
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
                  {isAdmin && (
                    <div className="mobile-dropdown">
                      <span>Admin</span>
                      <div className="mobile-dropdown-content">
                        <Link to="/admin" onClick={toggleMobileMenu}>Dashboard</Link>
                        <Link to="/admin/users" onClick={toggleMobileMenu}>User Management</Link>
                        <Link to="/admin/content" onClick={toggleMobileMenu}>Content Moderation</Link>
                        <Link to="/admin/workouts" onClick={toggleMobileMenu}>Workout Moderation</Link>
                        <Link to="/admin/workouts/exercises" onClick={toggleMobileMenu}>Edit Exercises</Link>
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
