import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const workoutService = {
    // Log a new workout
    logWorkout: async (workoutData) => {
        try {
            const response = await axios.post(`${BASE_URL}/workouts`, workoutData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error logging workout:', error);
            throw error;
        }
    },

    // Get workouts
    getWorkouts: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${BASE_URL}/workouts/`, {
                params: { startDate, endDate },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching workouts:', error);
            throw error;
        }
    }
};

// Workout Plan Service
export const workoutPlanService = {
    
    createCustomWorkoutPlan: async (planDetails) => {
        try {
          const response = await axios.post(`${BASE_URL}/workouts/plans/create-custom`, planDetails, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return response.data;
        } catch (error) {
          console.error('Error creating custom workout plan', error);
          throw error;
        }
      },


    generateWorkoutPlan: async (userProfile) => {
        try {
            console.log('Generating Workout Plan with Profile:', {
                fitnessGoal: userProfile.fitness_goal,
                activityLevel: userProfile.activity_level,
                primaryFocus: userProfile.primary_focus || ''
            });
            
            const response = await axios.get(`${BASE_URL}/workouts/plans/generate`, {
                params: {
                    fitnessGoal: userProfile.fitness_goal,
                    activityLevel: userProfile.activity_level,
                    primaryFocus: userProfile.primary_focus || ''
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Workout Plan Generation Error:', {
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
                details: error.response?.data
            });
    
            throw error;
        }
    
    },


    createGeneratedWorkoutPlan: async (planData) => {
      try {
          const response = await axios.post(`${BASE_URL}/workouts/plans/generate-save`, planData, {
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
          });
          return response.data;
      } catch (error) {
          console.error('Error creating generated workout plan:', error);
          throw error;
      }
    },


    getWorkoutPlanExerciseDetails: async (exerciseIds) => {
        try {
            const response = await axios.get(`${BASE_URL}/workouts/exercises/details`, {
                params: { exerciseIds: exerciseIds.join(',') },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            throw error;
        }
    },

    getUserWorkoutPlans: async () => {
        try {
          const response = await axios.get(`${BASE_URL}/workouts/plans`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching workout plans:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          throw error;
        }
    },
    
      // Method to delete a custom workout plan
      deleteCustomWorkoutPlan: async (planId) => {
        try {
          const response = await axios.delete(`${BASE_URL}/workouts/plans/${planId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return response.data;
        } catch (error) {
          console.error('Error deleting workout plan:', error);
          throw error;
        }
    }
    
};

// Exercise Library Service
export const exerciseLibraryService = {
    getMuscles: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/workouts/muscles`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching muscles:', error);
        throw error;
      }
    },
  
    getExercises: async (filters = {}) => {
      try {
        console.log('Filters being sent:', filters);
  
        const queryParams = Object.keys(filters)
          .filter(key => filters[key])
          .map(key => `${key}=${encodeURIComponent(filters[key])}`)
          .join('&');
  
        const url = queryParams 
          ? `${BASE_URL}/workouts/exercises?${queryParams}` 
          : `${BASE_URL}/workouts/exercises`;
  
        console.log('Fetch URL:', url);
  
        const response = await axios.get(url, { 
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Response data:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }
    }
};
  

export default {
    workoutService,
    workoutPlanService,
    exerciseLibraryService
};
