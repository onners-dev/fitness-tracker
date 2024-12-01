import { Link, useNavigate } from "react-router-dom";
import './Header.css'

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/home');
  };

  return (
    <header className="header">
      <Link to="/home" className="logo">Fitness App</Link>
      <nav>
        {isLoggedIn ? (
          // Links for logged-in users
          <>
            <Link to="/dashboard" className="link">Dashboard</Link>
            <Link to="/about" className="link">About</Link>
            <button onClick={handleSignOut} className="link">Sign Out</button>
          </>
        ) : (
          // Links for logged-out users
          <>
            <Link to="/home#features" className="link">Features</Link>
            <Link to="/about" className="link">About</Link>
            <Link to="/login" className="link">Login</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
