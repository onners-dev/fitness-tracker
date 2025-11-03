import api from './api';

// --- Types (customize as needed) ---
export type AdminAction = 'approve' | 'reject' | 'pending' | 'approved' | 'rejected' | string;

export interface ExerciseData {
  name?: string;
  description?: string;
  instructions?: string;
  difficulty?: string;
  video_url?: string;
  equipment_options?: string[];
  muscle_groups?: string[];
  muscles?: string[];
  [key: string]: any;
}

// Service
export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/dashboard-stats');
      return response.data;
    } catch (error: any) {
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

  getAllUsers: async (): Promise<any[]> => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  banUser: async (userId: string): Promise<any> => {
    try {
      const response = await api.post(`/admin/users/${userId}/ban`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getFlaggedContent: async (): Promise<any[]> => {
    try {
      const response = await api.get('/report/flagged-content');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getWorkoutSubmissions: async (): Promise<any[]> => {
    try {
      const response = await api.get('/admin/workout-submissions');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  getSystemAnalytics: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/system-analytics');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  getNutritionSubmissions: async (): Promise<any[]> => {
    try {
      const response = await api.get('/admin/nutrition-submissions');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  reviewNutritionSubmission: async (foodId: string, action: AdminAction): Promise<any> => {
    try {
      const response = await api.post(`/admin/nutrition-submissions/${foodId}/review`, { 
        status: action 
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  reviewFlaggedContent: async (
    contentType: string, 
    flagId: string, 
    action: AdminAction
  ): Promise<any> => {
    try {
      const response = await api.post(`/report/flagged-content/${flagId}/review`, {
        contentType,
        action: action === 'approve' ? 'approved' : 'rejected'
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getExerciseDetails: async (exerciseId: string): Promise<any> => {
    try {
      const response = await api.get(`/admin/exercises/${exerciseId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getAvailableEquipment: async (): Promise<any[]> => {
    try {
      const response = await api.get('/admin/equipment');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getAvailableMuscleGroups: async (): Promise<any[]> => {
    try {
      const response = await api.get('/admin/muscle-groups');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  updateExercise: async (exerciseId: string, exerciseData: ExerciseData): Promise<any> => {
    try {
      const sanitizedData: ExerciseData = {
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
      const response = await api.put(`/admin/exercises/${exerciseId}`, sanitizedData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  getMusclesInMuscleGroup: async (muscleGroupName: string): Promise<any[]> => {
    try {
      const response = await api.get('/admin/muscles-in-group', {
        params: { muscleGroupName }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  createExercise: async (exerciseData: ExerciseData): Promise<any> => {
    try {
      const sanitizedData: ExerciseData = {
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
    } catch (error: any) {
      throw error;
    }
  },

  getAllExercises: async (): Promise<any[]> => {
    try {
      const response = await api.get('/admin/exercises');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error('Failed to fetch exercises');
    }
  },

  deleteExercise: async (exerciseId: string): Promise<any> => {
    try {
      const response = await api.delete(`/admin/exercises/${exerciseId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error('Failed to delete exercise');
    }
  },

  getMuscleGroups: async (): Promise<any[]> => {
    try {
      const response = await api.get('/admin/muscle-groups');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getMuscles: async (groupName: string): Promise<any[]> => {
    try {
      const response = await api.get('/admin/muscles', {
        params: { groupName }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getExercises: async (muscleName: string, filters: {difficulty?: string; equipment?: string} = {}): Promise<any[]> => {
    try {
      const response = await api.get('/admin/exercises', {
        params: {
          muscleName,
          difficulty: filters.difficulty,
          equipment: filters.equipment
        }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};

export default adminService;
