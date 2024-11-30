import { Link } from "react-router-dom";
import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <Link to="/home" className="logo">Fitness App</Link>
      <nav>
        <Link to="/home#features" className="link">Features</Link>
        <Link to="/home#about" className="link">About</Link>
        <Link to="/home#contact" className="link">Contact</Link>
      </nav>
    </header>
  );
};

export default Header;
