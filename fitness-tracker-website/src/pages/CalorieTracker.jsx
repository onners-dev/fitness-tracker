import { useState, useEffect } from 'react';
import { searchFood } from '../services/foodAPI';
import './CalorieTracker.css';

function CalorieTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [meals, setMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newTotal = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    setTotalCalories(newTotal);
  }, [meals]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const products = await searchFood(searchQuery);
      if (products && Array.isArray(products)) {
        setSearchResults(products.filter(product => 
          product.product_name && product.nutriments?.energy_100g
        ));
      } else {
        setSearchResults([]);
        console.error('Invalid response format:', products);
      }
    } catch (error) {
      console.error('Error searching for food:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addMeal = (food) => {
    const calories = food.nutriments?.energy_100g || 0;
    const newMeal = {
      id: Date.now(),
      name: food.product_name,
      calories: calories,
      serving: '100g'
    };
    setMeals([...meals, newMeal]);
    setSearchResults([]); // Clear search results after adding
    setSearchQuery(''); // Clear search input
  };

  const removeMeal = (id) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  return (
    <div className="calorie-tracker">
      <h2>Calorie Tracker</h2>
      
      <form className="meal-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a food..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((food) => (
            <div key={food._id || Date.now()} className="food-item">
              <span>{food.product_name}</span>
              <span>{food.nutriments?.energy_100g || 0} kcal/100g</span>
              <button onClick={() => addMeal(food)}>Add</button>
            </div>
          ))}
        </div>
      )}

      {/* Meals List */}
      <div className="meals-list">
        {meals.map((meal) => (
          <div key={meal.id} className="meal-item">
            <span>{meal.name}</span>
            <span>{meal.calories} kcal</span>
            <button onClick={() => removeMeal(meal.id)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Total Calories */}
      <div className="total-calories">
        <h3>Total Calories: {totalCalories.toFixed(0)} kcal</h3>
      </div>
    </div>
  );
}

export default CalorieTracker;
