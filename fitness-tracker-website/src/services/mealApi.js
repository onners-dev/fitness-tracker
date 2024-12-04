import axios from 'axios';

const BASE_URL = '/api/meals'; // Your backend endpoint

export const mealService = {
  // Get meals for a specific date
  getMealsByDate: async (date) => {
    const response = await axios.get(`${BASE_URL}/date/${date}`);
    return response.data;
  },

  // Add a new meal
  addMeal: async (mealData) => {
    const response = await axios.post(BASE_URL, mealData);
    return response.data;
  },

  // Remove a meal
  removeMeal: async (mealId) => {
    const response = await axios.delete(`${BASE_URL}/${mealId}`);
    return response.data;
  },

  // Get meals summary for a date range
  getMealsSummary: async (startDate, endDate) => {
    const response = await axios.get(`${BASE_URL}/summary`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};
