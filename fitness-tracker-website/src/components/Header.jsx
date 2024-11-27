import React from "react";

const Header = () => {
  return (
    <header className="header">
      <h1 className="logo">FitTrack</h1>
      <nav>
        <a href="#features" className="link">Features</a>
        <a href="#about" className="link">About</a>
        <a href="#contact" className="link">Contact</a>
      </nav>
    </header>
  );
};

export default Header;
