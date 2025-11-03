import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

// Typed error handler utility
function handleApiError(error: AxiosError): never {
  if (error.response) {
    throw error.response.data || new Error('An error occurred');
  } else if (error.request) {
    throw new Error('No response received from server');
  } else {
    throw new Error('Error setting up the request');
  }
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Correct header mutation for TypeScript + Axios 1.x+
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers && typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('Authorization', `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}`);
      } else if (config.headers) {
        // Plain object, fallback for legacy compat
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const ignorePaths = ['/verify-email', '/signup', '/login'];
      if (!ignorePaths.some(path => currentPath.includes(path))) {
        localStorage.removeItem('token');
        localStorage.removeItem('isVerified');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Types ---
export interface AuthUser {
  user_id: string;
  email: string;
  email_verified: boolean;
  is_admin?: boolean;
  is_profile_complete?: boolean;
  needs_profile_setup?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  email?: string;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  [key: string]: any;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  email_verified: boolean;
  is_admin: boolean;
  [key: string]: any;
}

// --- Auth service ---
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      if (!token) throw new Error('No authentication token received');
      localStorage.setItem('isAdmin', response.data.user.is_admin ? 'true' : 'false');
      localStorage.setItem('firstTimeSetup', (!response.data.user.is_profile_complete).toString());
      return {
        token,
        user: {
          user_id: response.data.user.user_id,
          email: response.data.user.email,
          email_verified: !!response.data.user.email_verified,
          is_admin: response.data.user.is_admin,
          is_profile_complete: response.data.user.is_profile_complete
        }
      };
    } catch (error: any) {
      handleApiError(error);
    }
  },

  register: async (userData: RegisterUserInput): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${API_URL}/auth/register`, userData);
      if (!response.data.token) throw new Error('No authentication token received');
      return {
        token: response.data.token,
        email: response.data.email,
        user: {
          user_id: response.data.user.user_id,
          email: response.data.email,
          email_verified: false,
          needs_profile_setup: true
        }
      };
    } catch (error: any) {
      handleApiError(error);
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('isVerified');
  },

  verifyCode: async (email: string, code: string): Promise<any> => {
    try {
      const response = await api.post('/auth/verify-code', { email, code });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isVerified', 'true');
      }
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  resendVerificationCode: async (email: string): Promise<any> => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  }
};

// --- User service ---
export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  },

  updatePassword: async (passwordData: UpdatePasswordInput): Promise<any> => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
    }
  }
};

// --- Exercise service ---
export const exerciseService = {
  getMuscleGroups: async (): Promise<{ name: string; description?: string | null; }[]> => {
    try {
      const response = await api.get('/workouts/muscle-groups');
      return response.data.map((group: any) => ({
        name: group.name,
        description: group.description || null
      }));
    } catch (error: any) {
      return [];
    }
  },

  getMuscles: async (groupName: string): Promise<any[]> => {
    try {
      const response = await api.get('/workouts/muscles', { params: { groupName } });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      return [];
    }
  },

  getExercises: async (muscleOrGroupName: string): Promise<any[]> => {
    try {
      const response = await api.get('/workouts/exercises', {
        params: { muscleGroup: muscleOrGroupName }
      });
      return response.data;
    } catch (error: any) {
      return [];
    }
  }
};

// --- Favorite service ---
export const favoriteService = {
  addFavorite: async (exerciseId: string): Promise<any> => {
    try {
      const response = await api.post('/favorites/add', { exerciseId });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  removeFavorite: async (exerciseId: string): Promise<any> => {
    try {
      const response = await api.delete('/favorites/remove', { data: { exerciseId } });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getFavorites: async (): Promise<any[]> => {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error: any) {
      return [];
    }
  }
};

// --- Nutrition service ---
export const nutritionService = {
  getNutritionGoals: async (): Promise<any> => {
    try {
      const response = await api.get('/nutrition/goals');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  calculateNutritionGoals: async (): Promise<any> => {
    try {
      const response = await api.post('/nutrition/calculate-goals');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};

export default api;
