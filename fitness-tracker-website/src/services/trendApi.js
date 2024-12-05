import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/trends';

export const trendService = {
  // Get nutritional trends
  getNutritionTrends: async (days = 30) => {
    try {
      const response = await axios.get(`${BASE_URL}/nutrition`, {
        params: { days },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching nutrition trends:', error);
      return [];
    }
  },

  // Get workout trends
  getWorkoutTrends: async (days = 30) => {
    try {
      const response = await axios.get(`${BASE_URL}/workouts`, {
        params: { days },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching workout trends:', error);
      return [];
    }
  }
};
