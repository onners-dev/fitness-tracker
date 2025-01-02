import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './WorkoutExerciseLibrary.css';

const WorkoutExerciseLibrary = () => {
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    equipment: 'all',
  });
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  // Fetch Muscle Groups
  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const data = await adminService.getMuscleGroups();
        console.log('Fetched Muscle Groups:', data);
        
        const processedData = data.map((group, index) => ({
          group_id: `group-${index}`,
          name: group.name,
          description: group.description
        }));

        setMuscleGroups(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load muscle groups');
        setLoading(false);
      }
    };

    fetchMuscleGroups();
  }, []);


  // Fetch Muscles for Selected Group
  useEffect(() => {
    if (selectedGroup) {
      const fetchMuscles = async () => {
        try {
          const data = await adminService.getMuscles(selectedGroup.name);
          
          console.log('Fetched Muscles:', data);
          
          setSelectedGroup(prev => ({ 
            ...prev, 
            muscles: data.map(muscle => ({
              ...muscle,
              name: muscle.name || 'Unknown Muscle'
            }))
          }));
        } catch (err) {
          console.error('Detailed Error fetching muscles:', err);
          setError(`Failed to load muscles for ${selectedGroup.name}`);
        }
      };

      fetchMuscles();
    }
  }, [selectedGroup?.name]);

  // Fetch Exercises for Selected Muscle
  useEffect(() => {
    if (selectedMuscle) {
      const fetchExercises = async () => {
        try {
          const data = await adminService.getExercises(selectedMuscle.name, filters);
          
          console.log('Fetched Exercises:', data);
          setExercises(data);
        } catch (err) {
          console.error('Detailed Error:', err);
          setError('Failed to load exercises');
        }
      };

      fetchExercises();
    }
  }, [selectedMuscle?.name, filters]);

  // Unique Equipment List
  const uniqueEquipment = [...new Set(
    exercises.flatMap(ex => ex.equipment_options || [])
  )].filter(Boolean);

  // Filtered and Sorted Exercises
  const filteredAndSortedExercises = exercises
    .filter(exercise => {
      const difficultyMatch = filters.difficulty === 'all' || exercise.difficulty === filters.difficulty;
      const equipmentMatch = filters.equipment === 'all' || 
        (exercise.equipment_options || []).some(eq => 
          eq.toLowerCase() === filters.equipment.toLowerCase()
        );
      return difficultyMatch && equipmentMatch;
    })
    .sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  // Handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleMuscleGroupClick = (group) => {
    setError(null);
    setSelectedGroup(group);
    setSelectedMuscle(null);
    setExercises([]);
  };

  const handleMuscleClick = (muscle) => {
    setError(null);
    setSelectedMuscle(muscle);
  };

  const handleBack = () => {
    setError(null);
    if (selectedMuscle) {
      setSelectedMuscle(null);
      setExercises([]);
    } else {
      setSelectedGroup(null);
    }
  };

  const handleEditExercise = (exerciseId) => {
    navigate(`/admin/workouts/exercises/${exerciseId}`);
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await adminService.deleteExercise(exerciseId);
        setExercises(exercises.filter(exercise => exercise.exercise_id !== exerciseId));
      } catch (err) {
        console.error('Error deleting exercise:', err);
        setError(err.message);
      }
    }
  };

  // Render Filters
  const renderFiltersAndSort = () => (
    <div className="filters-section">
      <div className="filters-group">
        <div className="filter">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="filter">
          <label htmlFor="equipment">Equipment:</label>
          <select
            id="equipment"
            value={filters.equipment}
            onChange={(e) => handleFilterChange('equipment', e.target.value)}
          >
            <option value="all">All Equipment</option>
            {uniqueEquipment.map((equip, index) => (
              <option key={`equip-${index}`} value={equip}>{equip}</option>
            ))}
          </select>
        </div>

        <button 
          className="sort-button"
          onClick={toggleSortOrder}
        >
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <div className="results-count">
        Showing {filteredAndSortedExercises.length} of {exercises.length} exercises
      </div>
    </div>
  );

  // Loading and Error States
  if (loading) return <div>Loading exercise library...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="workout-exercise-library">
      <h1>Exercise Library</h1>
      
      <button 
        className="add-exercise-btn" 
        onClick={() => navigate('/admin/workouts/exercises/new')}
      >
        Add New Exercise
      </button>

      {selectedMuscle && (
        <div className="exercises-section">
          <button onClick={handleBack} className="back-button">
            ← Back to {selectedGroup.name}
          </button>
          <h2>{selectedMuscle.name} Exercises</h2>
          
          {exercises.length > 0 && renderFiltersAndSort()}

          <div className="exercises-grid">
            {filteredAndSortedExercises.length > 0 ? (
              filteredAndSortedExercises.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className="exercise-card"
                >
                  <div className="exercise-header">
                    <h3>{exercise.name}</h3>
                    <div className="exercise-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditExercise(exercise.exercise_id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteExercise(exercise.exercise_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p><strong>Equipment:</strong> {exercise.equipment_options?.join(', ') || 'N/A'}</p>
                  <p><strong>Difficulty:</strong> {exercise.difficulty}</p>
                </div>
              ))
            ) : (
              <div className="no-exercises">
                No exercises found with current filters
              </div>
            )}
          </div>
        </div>
      )}

      {selectedGroup && !selectedMuscle && (
        <div className="muscles-section">
          <button onClick={handleBack} className="back-button">
            ← Back to Muscle Groups
          </button>
          <h2>{selectedGroup.name}</h2>
          <div className="muscles-grid">
            {selectedGroup.muscles?.map((muscle) => (
              <div
                key={muscle.muscle_id}
                className="muscle-card"
                onClick={() => handleMuscleClick(muscle)}
              >
                <h3>{muscle.name}</h3>
                {muscle.description && <p>{muscle.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedGroup && (
        <div className="muscle-groups-section">
          <div className="muscle-groups-grid">
            {muscleGroups.map((group) => (
              <div
                key={group.group_id}
                className="muscle-group-card"
                onClick={() => handleMuscleGroupClick(group)}
              >
                <h2>{group.name}</h2>
                {group.description && <p>{group.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutExerciseLibrary;
