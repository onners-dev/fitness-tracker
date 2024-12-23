import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Handle forbidden access specifically
        console.error('Access Denied: Admin privileges required', error.response.data);
        throw new Error('Admin access required. Please log in with an admin account.');
      }
      
      console.error('Full Axios Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      throw error;
    }
  },

  // User Management
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  banUser: async (userId) => {
    try {
      const response = await axios.post(`${BASE_URL}/admin/users/${userId}/ban`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  },

  // Content Moderation
  getFlaggedContent: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/flagged-content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      throw error;
    }
  },

  // Workout and Nutrition Moderation
  getWorkoutSubmissions: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/workout-submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching workout submissions:', error);
      throw error;
    }
  },
  
  getSystemAnalytics: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/system-analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  },
  
  getNutritionSubmissions: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/nutrition-submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition submissions:', error);
      throw error;
    }
  },
  
  reviewNutritionSubmission: async (foodId, action) => {
    try {
      const response = await axios.post(`${BASE_URL}/admin/nutrition-submissions/${foodId}/review`, 
        { status: action }, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error reviewing nutrition submission:', error);
      throw error;
    }
  },

  getFlaggedContent: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/report/flagged-content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      throw error;
    }
  },
  
  reviewFlaggedContent: async (contentType, flagId, action) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/report/flagged-content/${flagId}/review`, 
        { 
          contentType, 
          action 
        }, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error reviewing flagged content:', error);
      throw error;
    }
  }

  
};
