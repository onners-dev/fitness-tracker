import { useState, useEffect } from 'react';
import { exerciseService, favoriteService } from '../services/api';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Workouts.css';

const ExerciseDetailModal = ({ exercise, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Diagnostic logging
    console.log('Exercise Detail Modal - Exercise:', exercise);

    // Add class to body to prevent scrolling
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to remove class when modal is closed
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [exercise]);

  const handleLogExercise = () => {
    navigate('/workout-logging', { 
      state: { 
        source: 'workouts',
        exercises: [{
          exercise_id: exercise?.exercise_id,
          exercise_name: exercise?.name,
          sets: '', // No sets or reps pre-filled
          reps: '',
          muscle_groups: exercise?.muscle_groups || []
        }]
      } 
    });
  };

  // Add more defensive checks
  if (!exercise) {
    console.warn('No exercise data provided to modal');
    return null;
  }

  return (
    <div 
      className="exercise-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="exercise-modal-content" 
        onClick={(e) => e.stopPropagation()}
        aria-label={`Details for ${exercise?.name || 'Exercise'}`}
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2>{exercise.name || 'Exercise Details'}</h2>
        
        <div className="exercise-modal-details">
          <div className="detail-section">
            <h3>Exercise Information</h3>
            <p>
              <strong>Equipment:</strong> {exercise.equipment_options?.length 
                ? exercise.equipment_options.join(', ') 
                : 'N/A'}
            </p>
            <p><strong>Difficulty:</strong> {exercise.difficulty || 'N/A'}</p>
            <p>
              <strong>Muscle Groups:</strong> {exercise.muscle_groups?.length 
                ? exercise.muscle_groups.join(', ') 
                : 'N/A'}
            </p>
          </div>

          {exercise.description && (
            <div className="detail-section">
              <h3>Description</h3>
              <p>{exercise.description}</p>
            </div>
          )}

          {exercise.instructions && (
            <div className="detail-section">
              <h3>Instructions</h3>
              <p>{exercise.instructions}</p>
            </div>
          )}

          <button 
            className="log-exercise-btn"
            onClick={handleLogExercise}
          >
            Log This Exercise
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [favorites, setFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const navigate = useNavigate();

  // Diagnostic useEffect for warnings
  useEffect(() => {
    const logWarning = (warning) => {
      console.log('React Warning:', warning);
    };

    const originalWarn = console.warn;
    console.warn = (...args) => {
      logWarning(args);
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // Diagnostic logging for modal
  useEffect(() => {
    console.log('Selected Exercise for Modal:', selectedExerciseForModal);
  }, [selectedExerciseForModal]);

  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const data = await exerciseService.getMuscleGroups();
        console.log('Fetched Muscle Groups:', data);
        
        // Transform array of objects to include description
        const processedData = data.map((group, index) => ({
          group_id: `group-${index}`,  // Generate a unique ID
          name: group.name,
          description: group.description || null  // Use description if available
        }));
    
        console.log('Processed Muscle Groups:', processedData);
        
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
  

  useEffect(() => {
    if (selectedGroup) {
      const fetchMuscles = async () => {
        try {
          console.log('Attempting to fetch muscles for group:', selectedGroup.name);
          
          // Trim and normalize the group name
          const normalizedGroupName = selectedGroup.name.trim();
          
          const data = await exerciseService.getMuscles(normalizedGroupName);
          
          console.log('Fetched Muscles:', data);
          
          if (!data || data.length === 0) {
            console.warn(`No muscles found for group: ${normalizedGroupName}`);
            console.log('Available muscle groups:', 
              (await exerciseService.getMuscleGroups()).join(', ')
            );
            // Optionally show a user-friendly message
            setError(`No muscles found for ${normalizedGroupName}`);
            return;
          }
          
          setSelectedGroup(prev => ({ 
            ...prev, 
            muscles: data.map(muscle => ({
              ...muscle,
              name: muscle.name || 'Unknown Muscle'
            }))
          }));
        } catch (err) {
          console.error('Detailed Error fetching muscles:', {
            message: err.message,
            group: selectedGroup,
            error: err
          });
          
          setError(`Failed to load muscles for ${selectedGroup.name}. ${err.message}`);
        }
      };
  
      fetchMuscles();
    }
  }, [selectedGroup?.name]);


  useEffect(() => {
    if (selectedMuscle) {
      const fetchExercises = async () => {
        try {
          console.log('Fetching exercises for muscle:', selectedMuscle);
          
          const data = await exerciseService.getExercises(selectedMuscle.name);
          
          console.log('Fetched Exercises:', data);

          setExercises(data);
        } catch (err) {
          console.error('Detailed Error:', err);
          setError('Failed to load exercises');
        }
      };

      fetchExercises();
    }
  }, [selectedMuscle?.name]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await favoriteService.getFavorites();
        setFavorites(data.map(fav => fav.exercise_id));
      } catch (err) {
        console.error('Failed to load favorites', err);
      }
    };

    fetchFavorites();
  }, []);

  const uniqueEquipment = [...new Set(
      exercises.flatMap(ex => ex.equipment_options || [])
  )].filter(Boolean);

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

  const toggleFavorite = async (exerciseId) => {
    try {
      if (favorites.includes(exerciseId)) {
        await favoriteService.removeFavorite(exerciseId);
        setFavorites(favorites.filter(id => id !== exerciseId));
      } else {
        await favoriteService.addFavorite(exerciseId);
        setFavorites([...favorites, exerciseId]);
      }
    } catch (err) {
      console.error('Error updating favorite status', err);
    }
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

      <div className="favorites-link">
        <button onClick={() => navigate('/favorites')} className="favorites-button">
          View Favorites
        </button>
      </div>
      
      {selectedMuscle && (
        <div className="exercises-section">
          <button onClick={handleBack} className="back-button">
            ← Back to {selectedGroup.name}
          </button>
          <h2>{selectedMuscle.name} Exercises</h2>
          
          {exercises.length > 0 && renderFiltersAndSort()}

          <div className="exercises-grid">
            {filteredAndSortedExercises.length > 0 ? (
              filteredAndSortedExercises.map((exercise, index) => {
                // Ensure a truly unique key
                const uniqueKey = exercise.exercise_id 
                  ? `exercise-${exercise.exercise_id}` 
                  : `exercise-${exercise.name}-${index}`;
                
                return (
                  <div
                    key={uniqueKey}
                    className="exercise-card"
                    onClick={() => {
                      console.log('Selected Exercise:', exercise);
                      setSelectedExerciseForModal(exercise);
                    }}
                  >
                    <div className="exercise-header">
                      <h3>{exercise.name}</h3>
                      <FaStar
                        className={`favorite-icon ${favorites.includes(exercise.exercise_id) ? 'favorited' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(exercise.exercise_id);
                        }}
                      />
                    </div>
                    <p><strong>Equipment:</strong> {exercise.equipment_options?.join(', ') || 'N/A'}</p>
                    <p><strong>Difficulty:</strong> {exercise.difficulty}</p>
                  </div>
                );
              })
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
            {selectedGroup.muscles?.map((muscle, index) => (
              <div
                key={muscle.muscle_id || `muscle-${index}`}
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
            {muscleGroups.map((group, index) => (
              <div
                key={group.group_id || `group-${index}`}
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

      {selectedExerciseForModal && (
        <ExerciseDetailModal 
          exercise={selectedExerciseForModal} 
          onClose={() => {
            console.log('Closing modal');
            setSelectedExerciseForModal(null);
          }}
        />
      )}
    </div>
  );
};

export default Workouts;

