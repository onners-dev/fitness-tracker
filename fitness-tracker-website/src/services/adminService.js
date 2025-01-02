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
  },

  getExerciseDetails: async (exerciseId) => {
    try {
      const response = await api.get(`/admin/exercises/${exerciseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise details', error);
      throw error;
    }
  },

  getAvailableEquipment: async () => {
    try {
      const response = await api.get('/admin/equipment');
      return response.data;
    } catch (error) {
      console.error('Error fetching available equipment', error);
      throw error;
    }
  },

  getAvailableMuscleGroups: async () => {
    try {
      const response = await api.get('/admin/muscle-groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching available muscle groups', error);
      throw error;
    }
  },

  updateExercise: async (exerciseId, exerciseData) => {
    try {
      // Sanitize data before sending
      const sanitizedData = {
        ...exerciseData,
        name: exerciseData.name || '',
        description: exerciseData.description || '',
        instructions: exerciseData.instructions || '',
        difficulty: exerciseData.difficulty || '',
        video_url: exerciseData.video_url || '',
        equipment_options: exerciseData.equipment_options || [],
        muscle_groups: exerciseData.muscle_groups || [],
        muscles: exerciseData.muscles || []
      };
  
      console.log('Updating Exercise:', {
        exerciseId,
        exerciseData: sanitizedData
      });
  
      const response = await api.put(`/admin/exercises/${exerciseId}`, sanitizedData);
      return response.data;
    } catch (error) {
      console.error('Error updating exercise', {
        error: error,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  getMusclesInMuscleGroup: async (muscleGroupName) => {
    try {
      const response = await api.get('/admin/muscles-in-group', {
        params: { muscleGroupName }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching muscles in muscle group:', error);
      throw error;
    }
  },

  createExercise: async (exerciseData) => {
    try {
      // Sanitize data before sending
      const sanitizedData = {
        ...exerciseData,
        name: exerciseData.name || '',
        description: exerciseData.description || '',
        instructions: exerciseData.instructions || '',
        difficulty: exerciseData.difficulty || '',
        video_url: exerciseData.video_url || '',
        equipment_options: exerciseData.equipment_options || [],
        muscle_groups: exerciseData.muscle_groups || [],
        muscles: exerciseData.muscles || []
      };
  
      const response = await api.post('/admin/exercises', sanitizedData);
      return response.data;
    } catch (error) {
      console.error('Error creating exercise', error);
      throw error;
    }
  },

    // Get all exercises
  getAllExercises: async () => {
    try {
      const response = await api.get('/admin/exercises');
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error.response?.data || new Error('Failed to fetch exercises');
    }
  },

  // Delete an exercise
  deleteExercise: async (exerciseId) => {
    try {
      const response = await api.delete(`/admin/exercises/${exerciseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error.response?.data || new Error('Failed to delete exercise');
    }
  },

  // Get Muscle Groups
  getMuscleGroups: async () => {
    try {
      const response = await api.get('/admin/muscle-groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching muscle groups:', error);
      throw error;
    }
  },

  // Get Muscles for a Group
  getMuscles: async (groupName) => {
    try {
      const response = await api.get('/admin/muscles', {
        params: { groupName }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching muscles:', error);
      throw error;
    }
  },

  // Get Exercises (with optional filters)
  getExercises: async (muscleName, filters = {}) => {
    try {
      const response = await api.get('/admin/exercises', {
        params: {
          muscleName,  // Send the muscle name specifically
          difficulty: filters.difficulty,
          equipment: filters.equipment
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

};
