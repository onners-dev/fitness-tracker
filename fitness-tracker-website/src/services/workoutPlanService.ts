import axios from 'axios';
import type { AxiosInstance } from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL as string}/api`;

export interface UserProfile {
  fitness_goal: string;
  activity_level: string;
  plan_id?: string | number;
  [key: string]: any;
}

export interface PlanDetails {
  plan_id?: string | number;
  name?: string;
  plan_name?: string;
  fitnessGoal?: string;
  fitness_goal?: string;
  activityLevel?: string;
  activity_level?: string;
  workouts?: Record<string, any>;
  workoutDays?: string[];
  selectedExercises?: Record<string, any>;
  [key: string]: any;
}

class WorkoutPlanService {
  api: AxiosInstance;
  pendingRequests: Map<string, Promise<any>>;
  lastRequestTimestamp: number | null;
  minimumRequestInterval: number;

  constructor() {
    this.api = axios.create({
      baseURL: `${BASE_URL}/workouts/plans`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.pendingRequests = new Map();
    this.lastRequestTimestamp = null;
    this.minimumRequestInterval = 2000;

    this.api.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getOrCreateInitialPlan(userProfile: UserProfile): Promise<any> {
    try {
      const response = await this.api.get('/initial', {
        params: {
          fitness_goal: userProfile.fitness_goal,
          activity_level: userProfile.activity_level
        }
      });
      if (response.data) {
        return response.data;
      }
      return await this.generateWorkoutPlan(userProfile);
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to get/create initial plan',
        originalError: error
      };
    }
  }

  async generateWorkoutPlan(userProfile: UserProfile): Promise<any> {
    try {
      const currentTime = Date.now();
      if (this.lastRequestTimestamp &&
        (currentTime - this.lastRequestTimestamp) < this.minimumRequestInterval) {
        throw new Error('Please wait a moment before generating another plan');
      }
      const requestKey = JSON.stringify({
        fitness_goal: userProfile.fitness_goal,
        activity_level: userProfile.activity_level,
        timestamp: currentTime
      });
      if (this.pendingRequests.has(requestKey)) {
        return await this.pendingRequests.get(requestKey);
      }
      const requestPromise = (async () => {
        const response = await this.api.post('/generate', {
          ...userProfile,
          ...(userProfile.plan_id && { plan_id: userProfile.plan_id })
        });
        return response.data;
      })();
      this.pendingRequests.set(requestKey, requestPromise);
      this.lastRequestTimestamp = currentTime;
      const result = await requestPromise;
      setTimeout(() => {
        this.pendingRequests.delete(requestKey);
      }, 2000);
      return result;
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to process workout plan',
        originalError: error
      };
    }
  }

  async getWorkoutPlanDetails(planId: string | number): Promise<any> {
    if (!planId) throw new Error('Plan ID is required');
    try {
      const response = await this.api.get(`/${planId}`);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch workout plan details',
        originalError: error
      };
    }
  }

  async updateWorkoutPlan(planDetails: PlanDetails): Promise<any> {
    if (!planDetails.plan_id) throw new Error('Plan ID is required for update');
    const updateData = {
      plan_name: planDetails.plan_name,
      fitness_goal: planDetails.fitness_goal,
      activity_level: planDetails.activity_level,
      workouts: planDetails.workouts
    };
    try {
      const response = await this.api.put(`/${planDetails.plan_id}`, updateData);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to update workout plan',
        originalError: error
      };
    }
  }

  async getUserWorkoutPlans(): Promise<any[]> {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to fetch workout plans',
        originalError: error
      };
    }
  }

  async createCustomWorkoutPlan(planDetails: PlanDetails): Promise<any> {
    if (!planDetails.name || !planDetails.workoutDays) {
      throw new Error('Plan name and workout days are required');
    }
    try {
      const response = await this.api.post('/create-custom', planDetails);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to create custom workout plan',
        originalError: error
      };
    }
  }

  async deletePlan(planId: string | number): Promise<any> {
    if (!planId) throw new Error('Plan ID is required for deletion');
    try {
      const response = await this.api.delete(`/${planId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async saveWorkoutPlanChanges(planId: string | number, updates: any): Promise<any> {
    if (!planId) throw new Error('Plan ID is required');
    try {
      const response = await this.api.put(`/${planId}`, updates);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to save workout plan changes',
        originalError: error
      };
    }
  }
}

export const workoutPlanService = new WorkoutPlanService();
