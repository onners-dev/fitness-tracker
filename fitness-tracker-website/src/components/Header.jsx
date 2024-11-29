import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <Link to="/home" className="logo">FitTrack</Link>
      <nav>
        <Link to="/home#features" className="link">Features</Link>
        <Link to="/home#about" className="link">About</Link>
        <Link to="/home#contact" className="link">Contact</Link>
      </nav>
    </header>
  );
};

export default Header;
