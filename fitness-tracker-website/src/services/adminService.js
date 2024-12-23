// adminService.js
import api from './api';

export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Admin Dashboard Stats Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
  
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Unauthorized. Please log in again.');
          case 403:
            throw new Error('Access denied. Admin privileges required.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error('Failed to fetch dashboard stats');
        }
      }
      throw error;
    }
  },

  // User Management
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  banUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/ban`);
      return response.data;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  },

  // Content Moderation
  getFlaggedContent: async () => {
    try {
      const response = await api.get('/report/flagged-content');
      return response.data;
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      throw error;
    }
  },

  // Workout and Nutrition Moderation
  getWorkoutSubmissions: async () => {
    try {
      const response = await api.get('/admin/workout-submissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching workout submissions:', error);
      throw error;
    }
  },
  
  getSystemAnalytics: async () => {
    try {
      const response = await api.get('/admin/system-analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      throw error;
    }
  },
  
  getNutritionSubmissions: async () => {
    try {
      const response = await api.get('/admin/nutrition-submissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching nutrition submissions:', error);
      throw error;
    }
  },
  
  reviewNutritionSubmission: async (foodId, action) => {
    try {
      const response = await api.post(`/admin/nutrition-submissions/${foodId}/review`, { 
        status: action 
      });
      return response.data;
    } catch (error) {
      console.error('Error reviewing nutrition submission:', error);
      throw error;
    }
  },
  
  reviewFlaggedContent: async (contentType, flagId, action) => {
    try {
      const response = await api.post(`/report/flagged-content/${flagId}/review`, {
        contentType,
        action: action === 'approve' ? 'approved' : 'rejected'
      });
      return response.data;
    } catch (error) {
      console.error('Error reviewing flagged content:', error.response?.data || error);
      throw error.response?.data || error;
    }
  }
};
