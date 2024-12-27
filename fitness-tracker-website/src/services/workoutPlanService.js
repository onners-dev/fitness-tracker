import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

class WorkoutPlanService {
  constructor() {
    this.api = axios.create({
      baseURL: `${BASE_URL}/workouts/plans`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.pendingRequests = new Map();
    this.lastRequestTimestamp = null;
    this.minimumRequestInterval = 2000; // 2 seconds

    // Add auth token to all requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get or create initial plan for user
  async getOrCreateInitialPlan(userProfile) {
    try {
      console.log('Getting/Creating Initial Plan:', userProfile);
      
      // First check for existing plan
      const response = await this.api.get('/initial', { 
        params: {
          fitness_goal: userProfile.fitness_goal,
          activity_level: userProfile.activity_level
        }
      });

      if (response.data) {
        console.log('Found existing plan:', response.data);
        return response.data;
      }

      // If no plan exists, generate new one
      console.log('No existing plan found, generating new plan');
      return await this.generateWorkoutPlan(userProfile);
    } catch (error) {
      console.error('Error with initial plan:', error);
      throw {
        message: error.response?.data?.message || 'Failed to get/create initial plan',
        originalError: error
      };
    }
  }

  // Generate a new workout plan
  async generateWorkoutPlan(userProfile) {
    try {
      const currentTime = Date.now();
            
      // Check if enough time has passed since last request
      if (this.lastRequestTimestamp && 
          (currentTime - this.lastRequestTimestamp) < this.minimumRequestInterval) {
          console.log('Request throttled - too soon after last request');
          throw new Error('Please wait a moment before generating another plan');
      }

      // Create a unique request key
      const requestKey = JSON.stringify({
          fitness_goal: userProfile.fitness_goal,
          activity_level: userProfile.activity_level,
          timestamp: currentTime
      });

      // Check for pending request
      if (this.pendingRequests.has(requestKey)) {
          console.log('Using pending request');
          return this.pendingRequests.get(requestKey);
      }

      console.log('Starting new plan generation:', requestKey);
      
      // Create new request promise
      const requestPromise = (async () => {
          const response = await this.api.post('/generate', {
              ...userProfile,
              ...(userProfile.plan_id && { plan_id: userProfile.plan_id })
          });
          return response.data;
      })();

      // Store the promise
      this.pendingRequests.set(requestKey, requestPromise);
      this.lastRequestTimestamp = currentTime;

      // Wait for response
      const result = await requestPromise;

      // Clear request after completion
      setTimeout(() => {
          this.pendingRequests.delete(requestKey);
      }, 2000);

      console.log('Plan generation complete:', result);
      return result;
    } catch (error) {
      console.error('Error with workout plan:', error);
      throw {
          message: error.message || 'Failed to process workout plan',
          originalError: error
      };
    }
  }

  // Get plan details
  async getWorkoutPlanDetails(planId) {
    try {
      if (!planId) {
        throw new Error('Plan ID is required');
      }

      console.log('Fetching Plan Details for ID:', planId);
      const response = await this.api.get(`/${planId}`);
      console.log('Plan Details Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching workout plan details:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch workout plan details',
        originalError: error
      };
    }
  }

  // Update existing plan
  async updateWorkoutPlan(planDetails) {
    try {
        if (!planDetails.plan_id) {
            throw new Error('Plan ID is required for update');
        }

        // Ensure data matches backend expectations
        const updateData = {
            plan_name: planDetails.plan_name,
            fitness_goal: planDetails.fitness_goal,
            activity_level: planDetails.activity_level,
            workouts: planDetails.workouts
        };

        console.log('Updating Plan:', updateData);
        const response = await this.api.put(`/${planDetails.plan_id}`, updateData);
        console.log('Update Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating workout plan:', error);
        throw {
            message: error.response?.data?.message || 'Failed to update workout plan',
            originalError: error
        };
    }
  }


  // Get user's workout plans
  async getUserWorkoutPlans() {
    try {
      console.log('Fetching User Workout Plans');
      const response = await this.api.get('/');
      console.log('User Plans Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user workout plans:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch workout plans',
        originalError: error
      };
    }
  }

  // Create custom workout plan
  async createCustomWorkoutPlan(planDetails) {
    try {
      if (!planDetails.name || !planDetails.workoutDays) {
        throw new Error('Plan name and workout days are required');
      }

      console.log('Creating Custom Plan:', planDetails);
      const response = await this.api.post('/create-custom', planDetails);
      console.log('Custom Plan Creation Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating custom workout plan:', error);
      throw {
        message: error.response?.data?.message || 'Failed to create custom workout plan',
        originalError: error
      };
    }
  }

  // Delete workout plan
  async deletePlan(planId) {
    try {
      if (!planId) {
        throw new Error('Plan ID is required for deletion');
      }

      const response = await this.api.delete(`/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Save workout plan changes
  async saveWorkoutPlanChanges(planId, updates) {
    try {
      if (!planId) {
        throw new Error('Plan ID is required');
      }

      console.log('Saving Plan Changes:', { planId, updates });
      const response = await this.api.put(`/${planId}`, updates);
      console.log('Save Changes Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving workout plan changes:', error);
      throw {
        message: error.response?.data?.message || 'Failed to save workout plan changes',
        originalError: error
      };
    }
  }
}

export const workoutPlanService = new WorkoutPlanService();
