import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './WorkoutExerciseEdit.css';

const WorkoutExerciseEdit = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState({
    name: '',
    description: '',
    instructions: '',
    difficulty: '',
    video_url: '',
    equipment_options: [],
    muscle_groups: [],
    muscles: []
  });
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);
  const [availableMuscles, setAvailableMuscles] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch available equipment and muscle groups
        const equipment = await adminService.getAvailableEquipment();
        const muscleGroups = await adminService.getAvailableMuscleGroups();
        
        setAvailableEquipment(equipment);
        setAvailableMuscleGroups(muscleGroups);
        
        // If there's an exerciseId, fetch its details
        if (exerciseId && exerciseId !== 'new') {
          const exerciseData = await adminService.getExerciseDetails(exerciseId);
          setExercise({
            name: exerciseData.name || '',
            description: exerciseData.description || '',
            instructions: exerciseData.instructions || '',
            difficulty: exerciseData.difficulty || '',
            video_url: exerciseData.video_url || '',
            equipment_options: exerciseData.equipment_options || [],
            muscle_groups: exerciseData.muscle_groups || [],
            muscles: exerciseData.muscles || []
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching exercise details:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
  
    fetchExerciseDetails();
  }, [exerciseId]);

  // Fetch muscles when a muscle group is selected
  useEffect(() => {
    const fetchMusclesInGroup = async () => {
      if (selectedMuscleGroup) {
        try {
          const muscles = await adminService.getMusclesInMuscleGroup(selectedMuscleGroup);
          setAvailableMuscles(muscles);
        } catch (err) {
          console.error('Error fetching muscles:', err);
          setError('Failed to fetch muscles');
        }
      }
    };

    fetchMusclesInGroup();
  }, [selectedMuscleGroup]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExercise(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    setExercise(prev => {
      const currentEquipment = prev.equipment_options || [];
      if (checked) {
        return { ...prev, equipment_options: [...currentEquipment, value] };
      } else {
        return { 
          ...prev, 
          equipment_options: currentEquipment.filter(eq => eq !== value) 
        };
      }
    });
  };

  const handleMuscleGroupChange = (e) => {
    const { value, checked } = e.target;
    setExercise(prev => {
      const currentMuscleGroups = prev.muscle_groups || [];
      if (checked) {
        // When a muscle group is selected, set it as the selected group
        setSelectedMuscleGroup(value);
        return { ...prev, muscle_groups: [...currentMuscleGroups, value] };
      } else {
        // Remove muscle group and associated muscles
        const updatedMuscleGroups = currentMuscleGroups.filter(mg => mg !== value);
        const updatedMuscles = prev.muscles.filter(muscle => 
          !availableMuscles.some(m => m.name === muscle)
        );
        
        // Reset selected muscle group if it's the one being unchecked
        if (selectedMuscleGroup === value) {
          setSelectedMuscleGroup(null);
          setAvailableMuscles([]);
        }

        return { 
          ...prev, 
          muscle_groups: updatedMuscleGroups,
          muscles: updatedMuscles
        };
      }
    });
  };

  const handleMuscleChange = (e) => {
    const { value, checked } = e.target;
    setExercise(prev => {
      const currentMuscles = prev.muscles || [];
      if (checked) {
        return { ...prev, muscles: [...currentMuscles, value] };
      } else {
        return { 
          ...prev, 
          muscles: currentMuscles.filter(muscle => muscle !== value) 
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!exercise.name || !exercise.difficulty) {
      setError('Name and Difficulty are required');
      return;
    }

    try {
      // Prepare data for submission
      const submissionData = {
        ...exercise,
        // Ensure empty arrays are handled correctly
        equipment_options: exercise.equipment_options || [],
        muscle_groups: exercise.muscle_groups || [],
        muscles: exercise.muscles || [],
        // Ensure string fields are not null
        description: exercise.description || '',
        instructions: exercise.instructions || '',
        video_url: exercise.video_url || ''
      };

      if (exerciseId && exerciseId !== 'new') {
        // Update existing exercise
        await adminService.updateExercise(exerciseId, submissionData);
      } else {
        // Create new exercise
        await adminService.createExercise(submissionData);
      }
      
      // Redirect back to exercise list or show success message
      navigate('/admin/workouts/exercises');
    } catch (err) {
      setError(err.message || 'An error occurred while saving the exercise');
    }
  };

  // Render error message if exists
  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="workout-exercise-edit">
      <h1>{exerciseId ? 'Edit Exercise' : 'Create New Exercise'}</h1>
      
      {renderErrorMessage()}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Exercise Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={exercise.name}
            onChange={handleInputChange}
            required
            placeholder="Enter exercise name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={exercise.description}
            onChange={handleInputChange}
            placeholder="Enter exercise description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={exercise.instructions}
            onChange={handleInputChange}
            placeholder="Enter exercise instructions"
          />
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty *</label>
          <select
            id="difficulty"
            name="difficulty"
            value={exercise.difficulty}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="video_url">Tutorial Video URL</label>
          <input
            type="url"
            id="video_url"
            name="video_url"
            value={exercise.video_url}
            onChange={handleInputChange}
            placeholder="Enter video URL (optional)"
          />
        </div>

        <div className="form-group">
          <h3>Equipment Options</h3>
          {availableEquipment.map((equip) => {
            const equipName = typeof equip === 'object' ? equip.name : equip;
            
            return (
              <div key={equipName} className="checkbox-group">
                <input
                  type="checkbox"
                  id={`equip-${equipName}`}
                  value={equipName}
                  checked={(exercise.equipment_options || []).includes(equipName)}
                  onChange={handleEquipmentChange}
                />
                <label htmlFor={`equip-${equipName}`}>{equipName}</label>
              </div>
            );
          })}
        </div>

        <div className="form-group">
          <h3>Muscle Groups</h3>
          {availableMuscleGroups.map((group) => {
            const groupName = typeof group === 'object' ? group.name : group;
            
            return (
              <div key={groupName} className="checkbox-group">
                <input
                  type="checkbox"
                  id={`muscle-group-${groupName}`}
                  value={groupName}
                  checked={(exercise.muscle_groups || []).includes(groupName)}
                  onChange={handleMuscleGroupChange}
                />
                <label htmlFor={`muscle-group-${groupName}`}>{groupName}</label>
              </div>
            );
          })}
        </div>

        {selectedMuscleGroup && (
          <div className="form-group">
            <h3>Muscles in {selectedMuscleGroup}</h3>
            {availableMuscles.map((muscle) => (
              <div key={muscle.name} className="checkbox-group">
                <input
                  type="checkbox"
                  id={`muscle-${muscle.name}`}
                  value={muscle.name}
                  checked={(exercise.muscles || []).includes(muscle.name)}
                  onChange={handleMuscleChange}
                />
                <label htmlFor={`muscle-${muscle.name}`}>{muscle.name}</label>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="submit-btn">
          {exerciseId ? 'Update Exercise' : 'Create Exercise'}
        </button>
      </form>
    </div>
  );
};

export default WorkoutExerciseEdit;
