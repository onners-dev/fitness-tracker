import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import './Home.css' // We'll create this CSS file for additional styling

function Home() {
  return (
    <div className="home">
      <Hero 
        title="Transform Your Fitness with Arcus" 
        subtitle="Your Comprehensive Fitness Companion" 
        description="Track workouts, monitor nutrition, and achieve your fitness goals with personalized insights and data-driven progress tracking."
        ctaText="Start Your Fitness Journey"
        ctaLink="/signup"
      />
      
      <Features />
      
      <section className="value-proposition">
        <div className="container">
          <h2>Why Choose Arcus?</h2>
          <div className="value-grid">
            <div className="value-item">
              <h3>Personalized Tracking</h3>
              <p>Custom workout and nutrition plans tailored to your unique fitness goals.</p>
            </div>
            <div className="value-item">
              <h3>Comprehensive Insights</h3>
              <p>Detailed analytics to help you understand and optimize your fitness journey.</p>
            </div>
            <div className="value-item">
              <h3>Easy to Use</h3>
              <p>Intuitive interface designed to make fitness tracking simple and enjoyable.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
