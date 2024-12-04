// In src/services/mealApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/meals'; // Update this to match your backend port

export const mealService = {
  getMealsByDate: async (date) => {
    const response = await axios.get(`${BASE_URL}/date/${date}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add this for authentication
      }
    });
    return response.data;
  },

  addMeal: async (mealData) => {
    const response = await axios.post(BASE_URL, mealData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add this for authentication
      }
    });
    return response.data;
  },

  removeMeal: async (mealId) => {
    const response = await axios.delete(`${BASE_URL}/${mealId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add this for authentication
      }
    });
    return response.data;
  },

  getMealsSummary: async (startDate, endDate) => {
    const response = await axios.get(`${BASE_URL}/summary`, {
      params: { startDate, endDate },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add this for authentication
      }
    });
    return response.data;
  }
};
