import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth services
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};

// User services
export const userService = {
    getProfile: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
  
    updateProfile: async (profileData) => {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    }
  };


  // Muscle services
  export const exerciseService = {
    getMuscleGroups: async () => {
        const response = await api.get('/exercises/muscle-groups');
        return response.data;
    },

    getMuscles: async (groupId) => {
        const response = await api.get(`/exercises/muscles/${groupId}`);
        return response.data;
    },

    getExercises: async (muscleId) => {
        const response = await api.get(`/exercises/by-muscle/${muscleId}`);
        return response.data;
    }
};
  
  
// In services/api.js
export const favoriteService = {
    addFavorite: async (exerciseId) => {
        const response = await api.post('/favorites/add', { exerciseId });
        return response.data;
    },

    removeFavorite: async (exerciseId) => {
        const response = await api.delete('/favorites/remove', { data: { exerciseId } });
        return response.data;
    },

    getFavorites: async () => {
        const response = await api.get('/favorites');
        return response.data;
    }
};

