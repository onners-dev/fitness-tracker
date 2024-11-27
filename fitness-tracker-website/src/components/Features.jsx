import React from "react";

const Features = () => {
  const features = [
    { title: "Workout Tracking", description: "Log your exercises and monitor your progress." },
    { title: "Calorie Counting", description: "Track your meals and manage your diet effortlessly." },
    { title: "Progress Insights", description: "View detailed reports and stay motivated." },
  ];

  return (
    <section id="features" className="features">
      <h2>Features</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
