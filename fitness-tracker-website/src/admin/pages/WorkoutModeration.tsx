import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import './WorkoutModeration.css';

const WorkoutModeration = () => {
  const [workoutSubmissions, setWorkoutSubmissions] = useState([]);

  useEffect(() => {
    const fetchWorkoutSubmissions = async () => {
      try {
        const submissions = await adminService.getWorkoutSubmissions();
        setWorkoutSubmissions(submissions);
      } catch (error) {
        console.error('Failed to fetch workout submissions', error);
      }
    };

    fetchWorkoutSubmissions();
  }, []);

  const handleWorkoutAction = async (workoutId, action) => {
    try {
      // Implement workout submission review logic
      console.log(`${action} workout with ID: ${workoutId}`);
      // You might want to call a method in adminService to handle this
    } catch (error) {
      console.error(`Failed to ${action} workout`, error);
    }
  };

  return (
    <div className="workout-moderation">
      <h1>Workout Submissions</h1>
      
      {workoutSubmissions.map((workout) => (
        <div key={workout.id} className="workout-submission">
          <h2>{workout.name}</h2>
          <p>Description: {workout.description}</p>
          <p>Difficulty: {workout.difficulty}</p>
          <p>Submitted By: {workout.submittedBy}</p>
          <p>Submitted At: {new Date(workout.submittedAt).toLocaleString()}</p>
          
          <div className="workout-actions">
            <button 
              onClick={() => handleWorkoutAction(workout.id, 'approve')}
              className="approve-btn"
            >
              Approve
            </button>
            <button 
              onClick={() => handleWorkoutAction(workout.id, 'reject')}
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

export default WorkoutModeration;
