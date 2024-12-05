import { useNavigate } from 'react-router-dom'
import './Features.css'

const Features = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="features">
      <h2>Features</h2>
      <div className="features-grid">
        <div className="feature" onClick={() => navigate('/calorietracker')}>
          <h3>Calorie Tracking</h3>
          <p>Track your daily calorie intake</p>
        </div>
        <div className="feature" onClick={() => navigate('/workouts')}>
          <h3>Workout Plans</h3>
          <p>Custom workout routines</p>
        </div>
        <div className="feature" onClick={() => navigate('/trends')}>
          <h3>Progress Tracking</h3>
          <p>Keep track of your workouts</p>
        </div>
        <div className="feature" onClick={() => navigate('/nutrition')}>
          <h3>Nutrition Guide</h3>
          <p>Healthy meal suggestions</p>
        </div>
      </div>
    </section>
  )
}

export default Features
