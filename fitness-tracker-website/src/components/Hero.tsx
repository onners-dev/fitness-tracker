import React from "react";
import { Link } from "react-router-dom";
import './Hero.css'

const Hero = ({ 
  title = "Track Workouts. Count Calories. Stay Fit.", 
  subtitle = "Join Fitness App today", 
  description = "Take control of your fitness journey!",
  ctaText = "Get Started",
  ctaLink = "/signup"
}) => {
  return (
    <section className="hero">
      <h2>{subtitle}</h2>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link to={ctaLink} className="cta-button">{ctaText}</Link>
    </section>
  );
};

export default Hero;
