import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (!response.data.token) {
        throw new Error('No authentication token received');
      }
      
      // Store authentication details
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isVerified', response.data.user.email_verified || false);
      localStorage.setItem('isAdmin', response.data.user.is_admin || false);
      
      return {
        token: response.data.token,
        user: {
          user_id: response.data.user.user_id,
          email: response.data.user.email,
          email_verified: response.data.user.email_verified,
          is_admin: response.data.user.is_admin
        }
      };
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (!response.data.token) {
        throw new Error('No authentication token received');
      }
      
      return {
        token: response.data.token,
        user: {
          user_id: response.data.user.user_id,
          email: response.data.email,
          email_verified: false
        }
      };
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  },

  verifyEmail: async (email, code) => {
    try {
      const response = await api.post('/auth/verify-code', { email, code });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isVerified', 'true');
      }
      
      return response.data;
    } catch (error) {
      console.error('Email Verification Error:', error);
      throw error;
    }
  },

  resendVerificationCode: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('Resend Verification Code Error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isVerified');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
  },

  resetPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Password Reset Error:', error);
      throw error;
    }
  },

  // Utility method to check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Utility method to check if user is an admin
  isAdmin: () => {
    return localStorage.getItem('isAdmin') === 'true';
  }
};

export default authService;
