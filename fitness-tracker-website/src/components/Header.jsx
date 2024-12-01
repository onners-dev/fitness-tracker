import { Link } from "react-router-dom";
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <Link to="/home" className="logo">Fitness App</Link>
      <nav>
        <Link to="/home#features" className="link">Features</Link>
        <Link to="/about" className="link">About</Link>
        <Link to="/login" className="link">Login</Link>
      </nav>
    </header>
  );
};

export default Header;
