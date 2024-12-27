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
            const queryParams = Object.keys(filters)
                .filter(key => filters[key])
                .map(key => `${key}=${encodeURIComponent(filters[key])}`)
                .join('&');

            const url = queryParams 
                ? `${BASE_URL}/workouts/exercises?${queryParams}` 
                : `${BASE_URL}/workouts/exercises`;

            const response = await axios.get(url, { 
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
    exerciseLibraryService
};
