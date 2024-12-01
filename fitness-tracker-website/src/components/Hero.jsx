import React from "react";
import { Link } from "react-router-dom";
import './Hero.css'

const Hero = () => {
  return (
    <section className="hero">
      <h1>Track Workouts. Count Calories. Stay Fit.</h1>
      <p>Join Fitness App today and take control of your fitness journey!</p>
      <Link to="/signup" className="cta-button">Get Started</Link>
    </section>
  );
};

export default Hero;
