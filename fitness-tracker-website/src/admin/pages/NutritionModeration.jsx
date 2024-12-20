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
      // Implement nutrition submission review logic
      console.log(`${action} nutrition submission with ID: ${submissionId}`);
      // You might want to call a method in adminService to handle this
    } catch (error) {
      console.error(`Failed to ${action} nutrition submission`, error);
    }
  };

  return (
    <div className="nutrition-moderation">
      <h1>Nutrition Submissions</h1>
      
      {nutritionSubmissions.map((submission) => (
        <div key={submission.id} className="nutrition-submission">
          <h2>{submission.name}</h2>
          <p>Calories: {submission.calories}</p>
          <p>Protein: {submission.protein}g</p>
          <p>Carbs: {submission.carbs}g</p>
          <p>Fat: {submission.fat}g</p>
          <p>Submitted By: {submission.submittedBy}</p>
          <p>Submitted At: {new Date(submission.submittedAt).toLocaleString()}</p>
          
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
