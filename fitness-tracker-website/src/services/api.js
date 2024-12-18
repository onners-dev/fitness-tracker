import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function handleApiError(error) {
  console.group('🚨 API Error Handler');
  console.error('Full Error:', error);
  console.error('Error Response:', error.response);
  console.groupEnd();

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw error.response.data || new Error('An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error('Error setting up the request');
  }
}

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
    
    console.group('🔑 Token Interceptor');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Is Verified:', isVerified);
    console.log('Request URL:', config.url);
    console.log('Current Headers:', config.headers);
    console.groupEnd();

    // Always add token if present, for any route
    if (token) {
        // Ensure 'Bearer ' prefix is added
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
        
        console.log('🛡️ Token Added to Headers:', config.headers.Authorization);
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
          console.group('🔐 Frontend Login Attempt');
          console.log('Email:', email);
          console.log('Password Length:', password.length);
          
          const response = await api.post('/auth/login', { email, password });
          
          console.log('Full Response:', response);
          console.log('Response Data:', response.data);
          console.groupEnd();
      
          // Very explicit token extraction
          const token = response.data.token;
          
          if (!token) {
            console.error('❌ No token in login response');
            throw new Error('No authentication token received');
          }
          
          return {
            token: token,
            user: {
              user_id: response.data.user.user_id,
              email: response.data.user.email,
              email_verified: response.data.user.email_verified === true || 
                              response.data.user.email_verified === 't',
              is_profile_complete: response.data.user.is_profile_complete
            }
          };
        } catch (error) {
          console.error('🚨 Login API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          throw error;
        }
    },
      

    register: async (userData) => {
        try {
            console.group('🚀 Frontend Registration Attempt');
            console.log('User Data:', userData);
            console.log('API Base URL:', API_URL);
            
            const response = await api.post('/register', userData);
            
            console.log('Registration Response:', response.data);
            console.groupEnd();
            
            // Validate response
            if (!response.data.token) {
                throw new Error('No authentication token received');
            }
            
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
        } catch (error) {
            console.error('🚨 Registration API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            
            // More detailed error throwing
            if (error.response) {
                throw {
                    message: error.response.data.message || 'Registration failed',
                    status: error.response.status,
                    data: error.response.data
                };
            } else if (error.request) {
                throw new Error('No response received from server');
            } else {
                throw new Error('Error setting up the registration request');
            }
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
            handleApiError(error);
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            handleApiError(error);
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
