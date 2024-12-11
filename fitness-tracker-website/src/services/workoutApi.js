import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/workouts';

export const workoutService = {
    // Log a new workout
    logWorkout: async (workoutData) => {
        try {
            const response = await axios.post(`${BASE_URL}`, workoutData, {
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
            const response = await axios.get(`${BASE_URL}`, {
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
    generateWorkoutPlan: async (userProfile) => {
        try {
            console.log('Generating Workout Plan with Profile:', {
                fitnessGoal: userProfile.fitness_goal,
                activityLevel: userProfile.activity_level,
                primaryFocus: userProfile.primary_focus || ''
            });
            
            const response = await axios.get(`${BASE_URL}/plans/generate`, {
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

    getWorkoutPlanExerciseDetails: async (exerciseIds) => {
        try {
            const response = await axios.get(`${BASE_URL}/exercises/details`, {
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

    // New method to fetch user's workout plans
    getUserWorkoutPlans: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/plans`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching workout plans:', error);
            throw error;
        }
    }
};

// Exercise Library Service
export const exerciseLibraryService = {
    // Fetch exercises by muscle group or other filters
    getExercises: async (filters = {}) => {
        try {
            const response = await axios.get('http://localhost:5000/api/exercises', { 
                params: filters,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
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
