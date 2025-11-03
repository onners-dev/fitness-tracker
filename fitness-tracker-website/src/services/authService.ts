import axios from 'axios';
import type { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL as string;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const authHeader = `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}`;
      if (config.headers && typeof (config.headers as any).set === 'function') {
        (config.headers as any).set('Authorization', authHeader);
      } else if (config.headers) {
        (config.headers as Record<string, string>)['Authorization'] = authHeader;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);




api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const ignorePaths = ['/verify-email', '/signup', '/login'];
      if (!ignorePaths.some(path => currentPath.includes(path))) {
        localStorage.removeItem('token');
        localStorage.removeItem('isVerified');
        localStorage.removeItem('isAdmin');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface AuthUser {
  user_id: string;
  email: string;
  email_verified: boolean;
  is_admin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  [key: string]: any;
}

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (!response.data.token) {
        throw new Error('No authentication token received');
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isVerified', response.data.user.email_verified ? 'true' : 'false');
      localStorage.setItem('isAdmin', response.data.user.is_admin ? 'true' : 'false');

      return {
        token: response.data.token,
        user: {
          user_id: response.data.user.user_id,
          email: response.data.user.email,
          email_verified: response.data.user.email_verified,
          is_admin: response.data.user.is_admin
        }
      };
    } catch (error: any) {
      throw error;
    }
  },

  register: async (
    userData: RegisterUserInput
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', userData);
      if (!response.data.token) {
        throw new Error('No authentication token received');
      }
      return {
        token: response.data.token,
        user: {
          user_id: response.data.user.user_id,
          email: response.data.user.email,
          email_verified: false
        }
      };
    } catch (error: any) {
      throw error;
    }
  },

  verifyEmail: async (
    email: string,
    code: string
  ): Promise<any> => {
    try {
      const response = await api.post('/auth/verify-code', { email, code });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isVerified', 'true');
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  resendVerificationCode: async (email: string): Promise<any> => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('isVerified');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
  },

  resetPassword: async (email: string): Promise<any> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Utility method to check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Utility method to check if user is an admin
  isAdmin: (): boolean => {
    return localStorage.getItem('isAdmin') === 'true';
  }
};

export default authService;
