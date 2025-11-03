// src/services/mealApi.js
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/meals`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const mealService = {
  getMealsByDate: async (date) => {
    try {
      console.log('Fetching meals for date:', date);
      console.log('Token:', localStorage.getItem('token'));

      const response = await axios.get(`${BASE_URL}/date/${date}`, {
        headers: getAuthHeader()
      });

      console.log('Meals fetch response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Detailed meal fetch error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });

      throw error;
    }
  },

  addMeal: async (mealData) => {
    try {
      const headers = getAuthHeader();
      console.log('Sending request with headers:', headers);
      console.log('Sending meal data:', mealData);
      
      const response = await axios.post(BASE_URL, mealData, {
        headers: headers
      });
      return response.data;
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  },

  removeMeal: async (mealId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${mealId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};
