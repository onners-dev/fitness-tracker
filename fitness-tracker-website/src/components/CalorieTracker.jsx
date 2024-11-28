import { useState } from 'react';

function CalorieTracker() {
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({ name: '', calories: '' });

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (newMeal.name && newMeal.calories) {
      setMeals([...meals, { ...newMeal, id: Date.now() }]);
      setNewMeal({ name: '', calories: '' });
    }
  };

  const handleDeleteMeal = (id) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.calories), 0);

  return (
    <div className="calorie-tracker">
      <h2>Calorie Tracker</h2>
      
      <form onSubmit={handleAddMeal} className="meal-form">
        <input
          type="text"
          placeholder="Meal name"
          value={newMeal.name}
          onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Calories"
          value={newMeal.calories}
          onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
        />
        <button type="submit">Add Meal</button>
      </form>

      <div className="meals-list">
        {meals.map(meal => (
          <div key={meal.id} className="meal-item">
            <span>{meal.name}</span>
            <span>{meal.calories} calories</span>
            <button onClick={() => handleDeleteMeal(meal.id)}>Delete</button>
          </div>
        ))}
      </div>

      <div className="total-calories">
        <h3>Total Calories: {totalCalories}</h3>
      </div>
    </div>
  );
}

export default CalorieTracker;
