import { useState, useEffect } from 'react';
import { favoriteService } from '../services/api.js';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await favoriteService.getFavorites();
        setFavorites(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load favorites', err);
        setError('Failed to load favorites');
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (exerciseId) => {
    try {
      await favoriteService.removeFavorite(exerciseId);
      setFavorites(favorites.filter(fav => fav.exercise_id !== exerciseId));
    } catch (err) {
      console.error('Error removing favorite', err);
    }
  };

  if (loading) {
    return <div className="favorites-page"><div className="loading">Loading favorites...</div></div>;
  }

  if (error) {
    return <div className="favorites-page"><div className="error">{error}</div></div>;
  }

  return (
    <div className="favorites-page">
      <h1>Your Favorite Workouts</h1>
      <div className="favorites-grid">
        {favorites.length > 0 ? (
          favorites.map((exercise) => (
            <div key={exercise.exercise_id} className="favorite-card">
              <h3>{exercise.name}</h3>
              <button onClick={() => removeFavorite(exercise.exercise_id)}>Remove</button>
              <p><strong>Equipment:</strong> {exercise.equipment}</p>
              <p><strong>Difficulty:</strong> {exercise.difficulty}</p>
              {exercise.description && <p>{exercise.description}</p>}
            </div>
          ))
        ) : (
          <div className="no-favorites">You have no favorite workouts yet.</div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
