import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <Hero 
        title="Start your fitness arc!" 
        subtitle="Arcus: Your Personal Fitness Companion" 
        description="Transform your health journey with intelligent tracking, personalized insights, and motivational tools. Whether you're a beginner or a fitness enthusiast, Arcus helps you visualize progress, set achievable goals, and stay motivated."
        ctaText="Begin Your Transformation"
        ctaLink="/signup"
      />
      
      <Features />
      
      <section className="value-proposition">
        <div className="container">
          <h2>Why Arcus?</h2>
          <div className="value-grid">
            <div className="value-item">
              <h3>Intelligent Tracking</h3>
              <p>Advanced algorithms that adapt to your unique fitness profile and goals.</p>
            </div>
            <div className="value-item">
              <h3>Data-Driven Progress</h3>
              <p>Visualize your fitness journey with comprehensive, easy-to-understand analytics.</p>
            </div>
            <div className="value-item">
              <h3>Seamless Experience</h3>
              <p>Intuitive design that makes fitness tracking effortless and engaging.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
