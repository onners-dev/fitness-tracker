import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './NutritionModeration.css';

const NutritionModeration = () => {
  const [nutritionSubmissions, setNutritionSubmissions] = useState([]);

  useEffect(() => {
    const fetchNutritionSubmissions = async () => {
      try {
        const submissions = await adminService.getNutritionSubmissions();
        setNutritionSubmissions(submissions);
      } catch (error) {
        console.error('Failed to fetch nutrition submissions', error);
      }
    };

    fetchNutritionSubmissions();
  }, []);

  const handleNutritionAction = async (submissionId, action) => {
    try {
      await adminService.reviewNutritionSubmission(submissionId, action);
      // Remove the submission from the list or refresh the list
      setNutritionSubmissions(prev => 
        prev.filter(submission => submission.id !== submissionId)
      );
    } catch (error) {
      console.error(`Failed to ${action} nutrition submission`, error);
    }
  };

  return (
    <div className="nutrition-moderation">
      <h1>User Contributed Foods</h1>
      
      {nutritionSubmissions.map((submission) => (
        <div key={submission.id} className="nutrition-submission">
          <h2>{submission.name}</h2>
          {submission.brand && <p>Brand: {submission.brand}</p>}
          {submission.barcode && <p>Barcode: {submission.barcode}</p>}
          <p>Calories: {submission.calories}</p>
          <p>Protein: {submission.protein}g</p>
          <p>Carbs: {submission.carbs}g</p>
          <p>Fats: {submission.fats}g</p>
          <p>Serving Size: {submission.serving_size || 'Not specified'}</p>
          <p>Category: {submission.category || 'Uncategorized'}</p>
          <p>Submitted By: {submission.email}</p>
          <p>Submitted At: {new Date(submission.created_at).toLocaleString()}</p>
          
          <div className="nutrition-actions">
            <button 
              onClick={() => handleNutritionAction(submission.id, 'approve')}
              className="approve-btn"
            >
              Approve
            </button>
            <button 
              onClick={() => handleNutritionAction(submission.id, 'reject')}
              className="reject-btn"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NutritionModeration;
