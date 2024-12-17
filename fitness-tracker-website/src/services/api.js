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
    console.log('Token type:', typeof token); // Check token type
    console.log('Current path:', window.location.pathname); // Check current route
    
    if (token && token !== 'null' && token !== 'undefined') {
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
        try {
            const response = await api.post('/auth/login', { email, password });
            
            console.log('Login Response:', response.data);
            
            if (response.data.token) {
                // Explicitly set token
                localStorage.setItem('token', response.data.token);
                
                // Explicitly set verification status
                localStorage.setItem('isVerified', 
                    (response.data.user.email_verified === true || 
                     response.data.user.email_verified === 't').toString()
                );
            } else {
                console.error('No token received in login response');
                localStorage.removeItem('token');
            }
            
            return {
                ...response.data,
                user: {
                    ...response.data.user,
                    email_verified: response.data.user.email_verified === true || 
                                    response.data.user.email_verified === 't'
                }
            };
        } catch (error) {
            console.error('Login API Error:', {
                message: error.response?.data?.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // Clear token on login failure
            localStorage.removeItem('token');
            
            throw error;
        }
    },
    

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isVerified');
    },

    verifyCode: async (email, code) => {
        try {
            const response = await api.post('/auth/verify-code', { email, code });
            return response.data;
        } catch (error) {
            console.error('Code verification error:', error);
            throw error;
        }
    },

    resendVerificationCode: async (email) => {
        try {
            const response = await api.post('/auth/resend-verification', { email });
            return response.data;
        } catch (error) {
            console.error('Resend verification code error:', error);
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
