import { useState, useEffect } from 'react';
import { searchFood } from '../services/foodApi';
import { mealService } from '../services/mealApi';
import { contributedFoodService } from '../services/contributedFoodApi';
import { nutritionService } from '../services/api';
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

  // New state for portion size tracking
  const [portionSizes, setPortionSizes] = useState({});

  // New states for custom food and contributions
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    serving: '100g',
    brand: ''
  });
  const [contributedFoods, setContributedFoods] = useState([]);
  const [showContributedFoods, setShowContributedFoods] = useState(false);

  useEffect(() => {
    // Add or remove no-scroll class based on modal state
    if (isCustomFoodModalOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  
    // Cleanup function
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isCustomFoodModalOpen]);

  // Load meals for selected date
  useEffect(() => {
    const loadMeals = async () => {
      try {
        console.log('Loading meals for date:', selectedDate);
        const data = await mealService.getMealsByDate(selectedDate);
        
        console.log('Loaded meals:', data);
        setMeals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Detailed error loading meals:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        setMeals([]);
        alert('Failed to load meals. Please try again or log in.');
      }
    };
  
    loadMeals();
  }, [selectedDate]);

  // Fetch user's contributed foods
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const contributions = await contributedFoodService.getMyContributions();
        setContributedFoods(contributions);
      } catch (error) {
        console.error('Failed to fetch contributions');
      }
    };

    fetchContributions();
  }, []);

  const [nutritionGoals, setNutritionGoals] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    const fetchNutritionGoals = async () => {
      try {
        const goals = await nutritionService.getNutritionGoals();
        setNutritionGoals(goals);
      } catch (error) {
        // Handle error (maybe recalculate goals)
        try {
          const newGoals = await nutritionService.calculateNutritionGoals();
          setNutritionGoals(newGoals);
        } catch (recalculateError) {
          console.error('Failed to fetch or calculate nutrition goals', recalculateError);
        }
      }
    };

    fetchNutritionGoals();
  }, []);

  
  const recalculateNutritionGoals = async () => {
    try {
      setIsRecalculating(true);
      const newGoals = await nutritionService.calculateNutritionGoals();
      setNutritionGoals(newGoals);
    } catch (error) {
      console.error('Failed to recalculate nutrition goals', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
  
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.details || 
        'Failed to recalculate goals.';
  
      // More informative error messages
      if (error.response?.data?.missingFields) {
        alert(`Please complete your profile. Missing fields: ${error.response.data.missingFields.join(', ')}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsRecalculating(false);
    }
  };
  

  
  // Progress Bar Component
  const NutrientProgressBar = ({ type, current, goal, color }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    
    return (
      <div className="nutrient-progress-container">
        <div className="nutrient-progress-header">
          <span>{type}</span>
          <span>{current.toFixed(1)} / {goal} {type === 'Calories' ? 'cal' : 'g'}</span>
        </div>
        <div className="nutrient-progress-bar">
          <div 
            style={{
              width: `${percentage}%`,
              height: '100%', 
              backgroundColor: color,
              borderRadius: '5px'
            }}
          />
        </div>
        <div className="nutrient-progress-percentage">
          {percentage.toFixed(0)}%
        </div>
      </div>
    );
  };

  // Calculate nutrition totals
  useEffect(() => {
    if (!Array.isArray(meals)) return;
  
    const totals = meals.reduce((sum, meal) => ({
      calories: sum.calories + (parseFloat(meal.calories) || 0),
      protein: sum.protein + (parseFloat(meal.protein) || 0),
      carbs: sum.carbs + (parseFloat(meal.carbs) || 0),
      fats: sum.fats + (parseFloat(meal.fats) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  
    setNutritionSummary(totals);
  }, [meals]);

  // Handle custom food input changes
  const handleCustomFoodChange = (e) => {
    const { name, value } = e.target;
    setCustomFood(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add custom food
  const addCustomFood = async (e) => {
    e.preventDefault();
    
    const { name, calories, protein, carbs, fats } = customFood;
    if (!name || !calories) {
      alert('Please enter at least a name and calories');
      return;
    }

    try {
      const foodData = {
        name,
        calories: parseFloat(calories),
        protein: parseFloat(protein) || null,
        carbs: parseFloat(carbs) || null,
        fats: parseFloat(fats) || null,
        serving_size: customFood.serving,
        brand: customFood.brand || null
      };

      const newContribution = await contributedFoodService.contributeFood(foodData);
      
      // Add to meals if approved
      if (newContribution.approval_status === 'approved') {
        const mealData = {
          ...foodData,
          date: selectedDate
        };
        const newMeal = await mealService.addMeal(mealData);
        setMeals(prevMeals => [...prevMeals, newMeal]);
      }

      // Update contributed foods list
      setContributedFoods(prev => [...prev, newContribution]);
      
      // Reset form
      setCustomFood({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        serving: '100g',
        brand: ''
      });
      setIsCustomFoodModalOpen(false);
    } catch (error) {
      console.error('Failed to contribute food:', error);
      alert('Failed to contribute food. Please try again.');
    }
  };

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

  // Updated addMeal to handle portion sizes
  const addMeal = async (food) => {
    // Get portion size for this specific food, default to 100g
    const portionSize = portionSizes[food._id] || 100;
    const portionMultiplier = portionSize / 100;
  
    const mealData = {
      name: food.product_name,
      calories: (parseFloat(food.nutriments?.energy_100g) * portionMultiplier) || 0,
      protein: (parseFloat(food.nutriments?.proteins_100g) * portionMultiplier) || 0,
      carbs: (parseFloat(food.nutriments?.carbohydrates_100g) * portionMultiplier) || 0,
      fats: (parseFloat(food.nutriments?.fat_100g) * portionMultiplier) || 0,
      date: selectedDate,
      serving: `${portionSize || 100}g`
    };
  
    try {
      const newMeal = await mealService.addMeal(mealData);
      setMeals(prevMeals => [...(Array.isArray(prevMeals) ? prevMeals : []), newMeal]);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add meal:', error);
      if (error.response?.status === 401) {
        alert('Please log in again to continue.');
      } else {
        alert('Failed to save meal. Please try again.');
      }
    }
  };

  // Handle portion size changes
  const handlePortionSizeChange = (foodId, value) => {
    // Allow empty string or valid number
    const parsedValue = value === '' ? '' : Number(value);
    
    setPortionSizes(prev => ({
      ...prev,
      [foodId]: parsedValue
    }));
  };

  const removeMeal = async (id) => {
    try {
      await mealService.removeMeal(id);
      setMeals(prevMeals => 
        Array.isArray(prevMeals) ? prevMeals.filter(meal => meal.meal_id !== id) : []
      );
    } catch (error) {
      console.error('Error removing meal:', error);
    }
  };

  return (
    <div className="calorie-tracker">
      <h2>Calorie Tracker</h2>

      {/* Date Selector */}
      <div className="date-selector">
        <div className="date-input-wrapper">
          <span className="date-day-display">
            {(() => {
              const date = new Date(selectedDate);
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return days[date.getDay()];
            })()}
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="date-input-with-text"
          />
        </div>
      </div>


      
      {/* Search and Custom Food Buttons */}
      <div className="food-actions">
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

        <div className="action-buttons">
          <button 
            className="custom-food-button" 
            onClick={() => setIsCustomFoodModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Custom Food
          </button>
          <button 
            className="contributed-foods-button"
            onClick={() => setShowContributedFoods(!showContributedFoods)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {showContributedFoods ? 'Hide' : 'Show'} My Contributions
          </button>
        </div>
      </div>


      {/* Contributed Foods Section */}
      {showContributedFoods && (
        <div className="contributed-foods-section">
          <h3>Your Contributed Foods</h3>
          {contributedFoods.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-md)', 
              color: 'var(--soft-text-medium)' 
            }}>
              No contributed foods yet
            </div>
          ) : (
            <div className="contributed-foods-list">
              {contributedFoods.map(food => (
                <div key={food.food_id} className="contributed-food-item">
                  <div className="contributed-food-header">
                    <h4>{food.name}</h4>
                    <span className="contribution-status">
                      {food.approval_status}
                    </span>
                  </div>
                  <div className="contributed-food-nutrition">
                    <div className="nutrition-badge">
                      <span>Calories</span>
                      <span>{food.calories} kcal</span>
                    </div>
                    <div className="nutrition-badge">
                      <span>Protein</span>
                      <span>{food.protein || 0}g</span>
                    </div>
                    <div className="nutrition-badge">
                      <span>Carbs</span>
                      <span>{food.carbs || 0}g</span>
                    </div>
                    <div className="nutrition-badge">
                      <span>Fats</span>
                      <span>{food.fats || 0}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      
      {/* Custom Food Modal */}
      {isCustomFoodModalOpen && (
        <div className="custom-food-modal">
          <div className="custom-food-content">
            <h3>Contribute a New Food</h3>
            <form onSubmit={addCustomFood}>
              <div className="form-group">
                <label>Food Name *</label>
                <input
                  type="text"
                  name="name"
                  value={customFood.name}
                  onChange={handleCustomFoodChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Calories *</label>
                <input
                  type="number"
                  name="calories"
                  value={customFood.calories}
                  onChange={handleCustomFoodChange}
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Protein (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={customFood.protein}
                  onChange={handleCustomFoodChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Carbs (g)</label>
                <input
                  type="number"
                  name="carbs"
                  value={customFood.carbs}
                  onChange={handleCustomFoodChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Fats (g)</label>
                <input
                  type="number"
                  name="fats"
                  value={customFood.fats}
                  onChange={handleCustomFoodChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={customFood.brand}
                  onChange={handleCustomFoodChange}
                />
              </div>
              <div className="form-group">
                <label>Serving Size</label>
                <input
                  type="text"
                  name="serving"
                  value={customFood.serving}
                  onChange={handleCustomFoodChange}
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Contribute Food</button>
                <button 
                  type="button" 
                  onClick={() => setIsCustomFoodModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Search Results with Portion Size */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((food) => (
            <div key={food._id || Date.now()} className="food-item">
              <div className="food-info">
                <h4>{food.product_name}</h4>
                <div className="nutrition-info">
                  <span>{food.nutriments?.energy_100g || 0} kcal (per 100g)</span>
                  <span>{food.nutriments?.proteins_100g || 0}g protein</span>
                  <span>{food.nutriments?.carbohydrates_100g || 0}g carbs</span>
                  <span>{food.nutriments?.fat_100g || 0}g fat</span>
                </div>
                <div className="portion-selector">
                  <label>Portion Size:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={portionSizes[food._id] === '' ? '' : (portionSizes[food._id] || 100)}
                    onChange={(e) => handlePortionSizeChange(food._id, e.target.value)}
                    placeholder="Portion size"
                  />
                  <span>g</span>
                </div>
              </div>
              <button onClick={() => addMeal(food)}>Add</button>
            </div>
          ))}
        </div>
      )}

      {/* Meals List */}
      <div className="meals-list">
        {Array.isArray(meals) && meals.map((meal) => (
          <div key={meal.meal_id} className="meal-item">
            <div className="meal-info">
              <h4>{meal.name}</h4>
              <div className="nutrition-info">
                <span>{meal.calories} kcal</span>
                <span>{meal.protein}g protein</span>
                <span>{meal.carbs}g carbs</span>
                <span>{meal.fats}g fat</span>
              </div>
            </div>
            <button onClick={() => removeMeal(meal.meal_id)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Nutrition Goals Progress */}
      {nutritionGoals && (
        <div className="nutrition-goals-progress">
          <div className="nutrition-goals-header">
            <h3>Daily Nutrition Goals</h3>
            <button 
              className="recalculate-goals-btn"
              onClick={recalculateNutritionGoals} 
              disabled={isRecalculating}
            >
              {isRecalculating ? 'Recalculating...' : 'Recalculate Goals'}
            </button>
          </div>
          <NutrientProgressBar 
            type="Calories"
            current={nutritionSummary.calories}
            goal={nutritionGoals.daily_calories_goal}
            color="rgb(255, 99, 132)"
          />
          <NutrientProgressBar 
            type="Protein"
            current={nutritionSummary.protein}
            goal={nutritionGoals.daily_protein_goal}
            color="rgb(54, 162, 235)"
          />
          <NutrientProgressBar 
            type="Carbs"
            current={nutritionSummary.carbs}
            goal={nutritionGoals.daily_carbs_goal}
            color="rgb(255, 206, 86)"
          />
          <NutrientProgressBar 
            type="Fats"
            current={nutritionSummary.fats}
            goal={nutritionGoals.daily_fats_goal}
            color="rgb(75, 192, 192)"
          />
        </div>
      )}


      {/* Nutrition Summary */}
      <div className="nutrition-summary">
        <h3>Daily Totals</h3>
        <div className="nutrition-totals">
          <div className="total-item">
            <span>Calories</span>
            <span>{(Number(nutritionSummary.calories) || 0).toFixed(0)} kcal</span>
          </div>
          <div className="total-item">
            <span>Protein</span>
            <span>{(Number(nutritionSummary.protein) || 0).toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span>Carbs</span>
            <span>{(Number(nutritionSummary.carbs) || 0).toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span>Fats</span>
            <span>{(Number(nutritionSummary.fats) || 0).toFixed(1)}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalorieTracker;
