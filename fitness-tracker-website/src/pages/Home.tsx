import React from 'react'
import './Home.css'

function Home() {
  return (
    <div className="home bg-dark">
      <main className="landing-hero">
        <h1 className="landing-title">Unleash Your Potential</h1>
        <p className="landing-subtitle">Tracking. Workouts. Results.</p>
        <a href="/signup" className="landing-cta">Join</a>
      </main>
    </div>
  )
}

export default Home
