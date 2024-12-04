import { useState, useEffect } from 'react';
import { searchFood } from '../services/foodApi';
import { mealService } from '../services/mealApi';
import './CalorieTracker.css';

function CalorieTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [nutritionSummary, setNutritionSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  // Load meals for selected date
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const data = await mealService.getMealsByDate(selectedDate);
        setMeals(data);
      } catch (error) {
        console.error('Error loading meals:', error);
      }
    };

    loadMeals();
  }, [selectedDate]);

  // Calculate nutrition totals
  useEffect(() => {
    const totals = meals.reduce((sum, meal) => ({
      calories: sum.calories + (meal.calories || 0),
      protein: sum.protein + (meal.protein || 0),
      carbs: sum.carbs + (meal.carbs || 0),
      fats: sum.fats + (meal.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    setNutritionSummary(totals);
  }, [meals]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const products = await searchFood(searchQuery);
      if (products && Array.isArray(products)) {
        setSearchResults(products.filter(product => 
          product.product_name && 
          product.nutriments?.energy_100g
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

  const addMeal = async (food) => {
    const mealData = {
      name: food.product_name,
      calories: food.nutriments?.energy_100g || 0,
      protein: food.nutriments?.proteins_100g || 0,
      carbs: food.nutriments?.carbohydrates_100g || 0,
      fats: food.nutriments?.fat_100g || 0,
      date: selectedDate,
      serving: '100g'
    };

    try {
      const newMeal = await mealService.addMeal(mealData);
      setMeals([...meals, newMeal]);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const removeMeal = async (id) => {
    try {
      await mealService.removeMeal(id);
      setMeals(meals.filter(meal => meal.id !== id));
    } catch (error) {
      console.error('Error removing meal:', error);
    }
  };

  return (
    <div className="calorie-tracker">
      <h2>Calorie Tracker</h2>

      {/* Date Selector */}
      <div className="date-selector">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      {/* Search Form */}
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
              <div className="food-info">
                <h4>{food.product_name}</h4>
                <div className="nutrition-info">
                  <span>{food.nutriments?.energy_100g || 0} kcal</span>
                  <span>{food.nutriments?.proteins_100g || 0}g protein</span>
                  <span>{food.nutriments?.carbohydrates_100g || 0}g carbs</span>
                  <span>{food.nutriments?.fat_100g || 0}g fat</span>
                </div>
              </div>
              <button onClick={() => addMeal(food)}>Add</button>
            </div>
          ))}
        </div>
      )}

      {/* Meals List */}
      <div className="meals-list">
        {meals.map((meal) => (
          <div key={meal.id} className="meal-item">
            <div className="meal-info">
              <h4>{meal.name}</h4>
              <div className="nutrition-info">
                <span>{meal.calories} kcal</span>
                <span>{meal.protein}g protein</span>
                <span>{meal.carbs}g carbs</span>
                <span>{meal.fats}g fat</span>
              </div>
            </div>
            <button onClick={() => removeMeal(meal.id)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Nutrition Summary */}
      <div className="nutrition-summary">
        <h3>Daily Totals</h3>
        <div className="nutrition-totals">
          <div className="total-item">
            <span>Calories</span>
            <span>{nutritionSummary.calories.toFixed(0)} kcal</span>
          </div>
          <div className="total-item">
            <span>Protein</span>
            <span>{nutritionSummary.protein.toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span>Carbs</span>
            <span>{nutritionSummary.carbs.toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span>Fats</span>
            <span>{nutritionSummary.fats.toFixed(1)}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalorieTracker;
