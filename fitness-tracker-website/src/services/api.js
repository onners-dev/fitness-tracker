import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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
    console.log('Token being sent:', token); // Debug log
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle unauthorized requests
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the error is 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            const ignorePaths = ['/verify-email', '/signup', '/login'];
            
            // Clear token if unauthorized on protected routes
            if (!ignorePaths.some(path => currentPath.includes(path))) {
                localStorage.removeItem('token');
                localStorage.removeItem('isVerified');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('isVerified', response.data.user.email_verified.toString());
        }
        return {
            ...response.data,
            user: {
                ...response.data.user,
                email_verified: response.data.user.email_verified
            }
        };
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
        localStorage.removeItem('isVerified');
    },

    verifyEmail: async (token) => {
        try {
            const response = await api.get('/auth/verify-email', { 
                params: { token } 
            });
            return response.data;
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    },

    resendVerificationEmail: async (email) => {
        try {
            const response = await api.post('/auth/resend-verification', { email });
            return response.data;
        } catch (error) {
            console.error('Resend verification email error:', error);
            throw error;
        }
    }
};

// User services
export const userService = {
    getProfile: async () => {
        try {
            // Only attempt to get profile if a token exists
            const token = localStorage.getItem('token');
            if (!token) {
                return null;
            }
            
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            // Silently handle 401 errors
            if (error.response?.status === 401) {
                return null;
            }
            console.error('Profile fetch error:', error);
            return null;
        }
    },
  
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            console.error('Update profile error', error);
            throw error;
        }
    },

    updatePassword: async (passwordData) => {
        try {
            const response = await api.put('/users/password', passwordData);
            return response.data;
        } catch (error) {
            console.error('Update password error', error);
            throw error;
        }
    }
};

// Exercise services
export const exerciseService = {
    getMuscleGroups: async () => {
        try {
            const response = await api.get('/exercises/muscle-groups');
            return response.data;
        } catch (error) {
            console.error('Error fetching muscle groups', error);
            return [];
        }
    },

    getMuscles: async (groupId) => {
        try {
            const response = await api.get(`/exercises/muscles/${groupId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching muscles', error);
            return [];
        }
    },

    getExercises: async (muscleId) => {
        try {
            const response = await api.get(`/exercises/by-muscle/${muscleId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching exercises', error);
            return [];
        }
    }
};

// Favorite services
export const favoriteService = {
    addFavorite: async (exerciseId) => {
        try {
            const response = await api.post('/favorites/add', { exerciseId });
            return response.data;
        } catch (error) {
            console.error('Error adding favorite', error);
            throw error;
        }
    },

    removeFavorite: async (exerciseId) => {
        try {
            const response = await api.delete('/favorites/remove', { data: { exerciseId } });
            return response.data;
        } catch (error) {
            console.error('Error removing favorite', error);
            throw error;
        }
    },

    getFavorites: async () => {
        try {
            const response = await api.get('/favorites');
            return response.data;
        } catch (error) {
            console.error('Error fetching favorites', error);
            return [];
        }
    }
};

export default api;
