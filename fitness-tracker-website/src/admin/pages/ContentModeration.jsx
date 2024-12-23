import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './ContentModeration.css';

const ContentModeration = () => {
  const [flaggedContent, setFlaggedContent] = useState({
    contributedFoods: [],
    workouts: [],
    meals: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlaggedContent = async () => {
      try {
        setIsLoading(true);
        const content = await adminService.getFlaggedContent();
        
        // Ensure each content type is an array, defaulting to empty array if undefined
        setFlaggedContent({
          contributedFoods: content.contributedFoods || [],
          workouts: content.workouts || [],
          meals: content.meals || []
        });
        
        setError(null);
      } catch (error) {
        console.error('Failed to fetch flagged content', error);
        setError(error.message || 'Failed to load flagged content');
        
        // Set to empty arrays in case of error
        setFlaggedContent({
          contributedFoods: [],
          workouts: [],
          meals: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlaggedContent();
  }, []);

  const handleContentAction = async (type, flagId, action) => {
    try {
      // Call admin service method to review flagged content
      await adminService.reviewFlaggedContent(type, flagId, action);
      
      // Remove the handled flag from the list
      setFlaggedContent(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.flag_id !== flagId)
      }));
    } catch (error) {
      console.error(`Failed to ${action} content`, error);
      alert(`Failed to ${action} content`);
    }
  };

  if (isLoading) {
    return <div>Loading flagged content...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Check if there are any flagged items at all
  const hasFlaggedContent = 
    flaggedContent.contributedFoods.length > 0 ||
    flaggedContent.workouts.length > 0 ||
    flaggedContent.meals.length > 0;

  return (
    <div className="content-moderation">
      <h1>Content Moderation</h1>
      
      {!hasFlaggedContent && (
        <div className="no-flagged-content">
          <p>No flagged content at the moment.</p>
        </div>
      )}
      
      {/* Contributed Foods Section */}
      {flaggedContent.contributedFoods.length > 0 && (
        <section className="flagged-contributed-foods">
          <h2>Flagged Contributed Foods</h2>
          {flaggedContent.contributedFoods.map((food) => (
            <div key={food.flag_id} className="flagged-item">
              <p>Food: {food.name}</p>
              <p>Submitted By: {food.email}</p>
              <p>Reason: {food.reason}</p>
              <div className="content-actions">
                <button 
                  onClick={() => handleContentAction('contributedFoods', food.flag_id, 'approve')}
                  className="approve-btn"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleContentAction('contributedFoods', food.flag_id, 'reject')}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Workouts Section */}
      {flaggedContent.workouts.length > 0 && (
        <section className="flagged-workouts">
          <h2>Flagged Workouts</h2>
          {flaggedContent.workouts.map((workout) => (
            <div key={workout.flag_id} className="flagged-item">
              <p>Workout: {workout.name}</p>
              <p>Submitted By: {workout.email}</p>
              <p>Reason: {workout.reason}</p>
              <div className="content-actions">
                <button 
                  onClick={() => handleContentAction('workouts', workout.flag_id, 'approve')}
                  className="approve-btn"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleContentAction('workouts', workout.flag_id, 'reject')}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Meals Section */}
      {flaggedContent.meals.length > 0 && (
        <section className="flagged-meals">
          <h2>Flagged Meals</h2>
          {flaggedContent.meals.map((meal) => (
            <div key={meal.flag_id} className="flagged-item">
              <p>Meal: {meal.name}</p>
              <p>Submitted By: {meal.email}</p>
              <p>Reason: {meal.reason}</p>
              <div className="content-actions">
                <button 
                  onClick={() => handleContentAction('meals', meal.flag_id, 'approve')}
                  className="approve-btn"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleContentAction('meals', meal.flag_id, 'reject')}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ContentModeration;
