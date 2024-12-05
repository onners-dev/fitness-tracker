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

// New service to fetch exercises from your library
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
