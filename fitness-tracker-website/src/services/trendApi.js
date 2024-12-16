import axios from 'axios';

export const trendService = {
  getNutritionTrends: async (days = 7) => {
    try {
      const response = await axios.get(`${API_URL}/trends/nutrition`, {
        params: { days },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Nutrition Trends Response:', response.data); // Debug log
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching nutrition trends:', error);
      return [];
    }
  },

  // Get workout trends
  getWorkoutTrends: async (days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/trends/workouts`, {
        params: { days },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Workout Trends Response:', response.data); // Debug log
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching workout trends:', error);
      return [];
    }
  }
  
};
