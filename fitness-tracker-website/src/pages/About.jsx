import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Fitness App</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            At Fitness App, we're dedicated to making fitness tracking simple, 
            intuitive, and effective. Our mission is to help every individual 
            achieve their health and fitness goals through smart tracking and 
            personalized insights.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Workout Tracking</h3>
              <p>Log and monitor your exercises, sets, and reps with ease.</p>
            </div>
            <div className="feature-card">
              <h3>Calorie Counter</h3>
              <p>Keep track of your daily caloric intake and nutritional goals.</p>
            </div>
            <div className="feature-card">
              <h3>Progress Analytics</h3>
              <p>Visualize your fitness journey with detailed progress charts.</p>
            </div>
            <div className="feature-card">
              <h3>Custom Plans</h3>
              <p>Get personalized workout and nutrition plans tailored to your goals.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Why Choose Us</h2>
          <ul className="benefits-list">
            <li>User-friendly interface designed for all fitness levels</li>
            <li>Comprehensive tracking tools for both workouts and nutrition</li>
            <li>Regular updates and new features based on user feedback</li>
            <li>Supportive community of fitness enthusiasts</li>
            <li>Data-driven insights to optimize your fitness journey</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Get Started</h2>
          <p>
            Ready to begin your fitness journey? Join thousands of users who have 
            already transformed their lives with Fitness App.
          </p>
          <div className="cta-buttons">
            <a href="/signup" className="primary-button">Sign Up Now</a>
            <a href="/login" className="secondary-button">Login</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
