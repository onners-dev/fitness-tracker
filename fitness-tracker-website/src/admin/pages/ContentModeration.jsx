import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './ContentModeration.css';

const ContentModeration = () => {
  const [flaggedContent, setFlaggedContent] = useState({
    workoutFlags: [],
    mealFlags: []
  });

  useEffect(() => {
    const fetchFlaggedContent = async () => {
      try {
        const content = await adminService.getFlaggedContent();
        setFlaggedContent(content);
      } catch (error) {
        console.error('Failed to fetch flagged content', error);
      }
    };

    fetchFlaggedContent();
  }, []);

  const handleContentAction = async (type, id, action) => {
    try {
      // Implement content moderation logic
      console.log(`${action} ${type} with ID: ${id}`);
      // You might want to call a method in adminService to handle this
    } catch (error) {
      console.error(`Failed to ${action} content`, error);
    }
  };

  return (
    <div className="content-moderation">
      <h1>Content Moderation</h1>
      
      <section className="flagged-workouts">
        <h2>Flagged Workouts</h2>
        {flaggedContent.workoutFlags.map((workout) => (
          <div key={workout.id} className="flagged-item">
            <p>Workout: {workout.name}</p>
            <p>Submitted By: {workout.userEmail}</p>
            <p>Reason: {workout.reason}</p>
            <div className="content-actions">
              <button 
                onClick={() => handleContentAction('workout', workout.id, 'approve')}
                className="approve-btn"
              >
                Approve
              </button>
              <button 
                onClick={() => handleContentAction('workout', workout.id, 'reject')}
                className="reject-btn"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="flagged-meals">
        <h2>Flagged Meals</h2>
        {flaggedContent.mealFlags.map((meal) => (
          <div key={meal.id} className="flagged-item">
            <p>Meal: {meal.name}</p>
            <p>Submitted By: {meal.userEmail}</p>
            <p>Reason: {meal.reason}</p>
            <div className="content-actions">
              <button 
                onClick={() => handleContentAction('meal', meal.id, 'approve')}
                className="approve-btn"
              >
                Approve
              </button>
              <button 
                onClick={() => handleContentAction('meal', meal.id, 'reject')}
                className="reject-btn"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ContentModeration;
