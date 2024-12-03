import { useState, useEffect } from 'react';
import { exerciseService } from '../services/api';
import './Workouts.css';

const Workouts = () => {
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

  // Fetch muscle groups on component mount
  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const data = await exerciseService.getMuscleGroups();
        setMuscleGroups(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load muscle groups');
        setLoading(false);
      }
    };

    fetchMuscleGroups();
  }, []);

  // Fetch muscles when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      const fetchMuscles = async () => {
        try {
          const data = await exerciseService.getMuscles(selectedGroup.group_id);
          setSelectedGroup(prev => ({ ...prev, muscles: data }));
        } catch (err) {
          console.error('Error:', err);
          setError('Failed to load muscles');
        }
      };

      fetchMuscles();
    }
  }, [selectedGroup?.group_id]);

  // Fetch exercises when a muscle is selected
  useEffect(() => {
    if (selectedMuscle) {
      const fetchExercises = async () => {
        try {
          const data = await exerciseService.getExercises(selectedMuscle.muscle_id);
          setExercises(data);
        } catch (err) {
          console.error('Error:', err);
          setError('Failed to load exercises');
        }
      };

      fetchExercises();
    }
  }, [selectedMuscle?.muscle_id]);

  const uniqueEquipment = [...new Set(exercises.map(ex => ex.equipment))].filter(Boolean);

  const filteredAndSortedExercises = exercises
    .filter(exercise => {
      const difficultyMatch = filters.difficulty === 'all' || exercise.difficulty === filters.difficulty;
      const equipmentMatch = filters.equipment === 'all' || exercise.equipment === filters.equipment;
      return difficultyMatch && equipmentMatch;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

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
            {uniqueEquipment.map(equip => (
              <option key={equip} value={equip}>{equip}</option>
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

  if (loading) {
    return (
      <div className="workouts-page">
        <div className="loading">Loading workout library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workouts-page">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workouts-page">
      <h1>Workout Library</h1>
      
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
                <div key={exercise.exercise_id} className="exercise-card">
                  <h3>{exercise.name}</h3>
                  <p><strong>Equipment:</strong> {exercise.equipment}</p>
                  <p><strong>Difficulty:</strong> {exercise.difficulty}</p>
                  {exercise.description && (
                    <p className="exercise-description">{exercise.description}</p>
                  )}
                  {exercise.instructions && (
                    <div className="exercise-instructions">
                      <strong>Instructions:</strong>
                      <p>{exercise.instructions}</p>
                    </div>
                  )}
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

export default Workouts;
