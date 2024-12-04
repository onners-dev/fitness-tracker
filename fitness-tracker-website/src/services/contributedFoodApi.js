import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/foods';

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

export const contributedFoodService = {
    // Get user's contributed foods
    getMyContributions: async () => {
        try {
            console.log('Attempting to fetch contributions');
            console.log('Full URL:', `${BASE_URL}/my-contributions`);

            const response = await axios.get(`${BASE_URL}/my-contributions`, {
                headers: getAuthHeader()
            });

            console.log('Contributions fetch response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Detailed contributions fetch error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });

            throw error;
        }
    },

    // Contribute a new food
    contributeFood: async (foodData) => {
        try {
            console.log('Attempting to contribute food');
            console.log('Full URL:', `${BASE_URL}/contribute`);
            console.log('Food data:', foodData);

            const response = await axios.post(`${BASE_URL}/contribute`, foodData, {
                headers: getAuthHeader()
            });

            console.log('Food contribution response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Detailed food contribution error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });

            throw error;
        }
    }
};
