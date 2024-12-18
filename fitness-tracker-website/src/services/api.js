import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const isVerified = localStorage.getItem('isVerified') === 'true';
    
    console.log('🔑 Token Interceptor:', {
        token: token ? 'Present' : 'Missing',
        isVerified: isVerified,
        url: config.url
    });

    // Always add token if present
    if (token) {
        // Remove any existing 'Bearer ' prefix and add it back
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
        
        console.log('🛡️ Token Added to Headers', {
            headerToken: config.headers.Authorization
        });
    }
    
    return config;
}, (error) => {
    console.error('🚨 Token Interceptor Error:', error);
    return Promise.reject(error);
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
          
          console.log('🔐 Detailed Login Response:', {
            user: response.data.user,
            token: response.data.token
          });
          
          // Ensure token is returned
          if (!response.data.token) {
            throw new Error('No token received from server');
          }
          
          // Explicitly set verification status
          localStorage.setItem('isVerified', 
            (response.data.user.email_verified === true || 
             response.data.user.email_verified === 't').toString()
          );
          
          return {
            token: response.data.token,
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
          console.log('🔍 Verification Attempt:', { email, code });
          
          const response = await api.post('/auth/verify-code', { email, code });
          
          console.log('✅ Verification Response:', {
            data: response.data,
            token: response.data.token
          });
          
          // Always set token if present
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('isVerified', 'true');
          }
          
          return response.data;
        } catch (error) {
          console.error('❌ Verification Error:', {
            message: error.response?.data?.message,
            status: error.response?.status,
            data: error.response?.data
          });
          
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
          const response = await api.get('/users/profile');
          return response.data;
        } catch (error) {
          console.error('Profile fetch error:', error);
          
          // If 401 (unauthorized), clear token and redirect
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('isVerified');
            window.location.href = '/login';
            return null;
          }
          
          // For other errors, throw
          throw error;
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
