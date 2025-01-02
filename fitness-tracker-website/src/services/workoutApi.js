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
    getMuscles: async (groupName) => {
        try {
            console.log('Requesting muscles for group:', groupName);
            
            const response = await axios.get(`${BASE_URL}/workouts/muscles`, {
                params: { groupName }, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Muscles response:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('Detailed Error fetching muscles:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                groupName: groupName
            });
            
            // If error is due to no muscles found, return empty array
            if (error.response && error.response.status === 404) {
                console.warn(`No muscles found for group: ${groupName}`);
                return [];
            }
            
            throw error;
        }
    },
    
    getExercises: async (muscleId = null, filters = {}) => {
        try {
            console.log('getExercises called with:', { muscleId, filters });
            
            const queryParams = {};
            
            // If muscleId is provided, add it to filters
            if (muscleId) {
                // If it's a number, use as muscle ID
                // If it's a string, use as muscle group name
                if (!isNaN(muscleId)) {
                    queryParams.muscleGroup = muscleId;
                } else {
                    // Use the muscle name/group name in the workouts/exercises endpoint
                    queryParams.muscleGroup = muscleId;
                }
                
                console.log('Added muscleGroup filter:', muscleId);
            }
        
            // Add other filters
            if (filters.difficulty && filters.difficulty !== 'all') {
                queryParams.difficulty = filters.difficulty;
                console.log('Added difficulty filter:', filters.difficulty);
            }
        
            if (filters.equipment && filters.equipment !== 'all') {
                queryParams.equipment = filters.equipment;
                console.log('Added equipment filter:', filters.equipment);
            }
        
            console.log('Full query params:', queryParams);
        
            const response = await axios.get(`${BASE_URL}/workouts/exercises`, { 
                params: queryParams,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Raw response data:', response.data);
            
            // Ensure each exercise has equipment_options
            const processedExercises = response.data.map(exercise => {
                console.log(`Processing Exercise: ${exercise.name}`);
                console.log('Raw Exercise Data:', exercise);
                
                // Prioritize different potential sources of equipment options
                const equipmentOptions = 
                    exercise.equipment_options || 
                    exercise.equipment || 
                    ['N/A'];
                
                return {
                    ...exercise,
                    equipment_options: Array.isArray(equipmentOptions) 
                        ? equipmentOptions 
                        : [equipmentOptions]
                };
            });
    
            return processedExercises;
        } catch (error) {
            console.error('Detailed Error in getExercises:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                responseDetails: error.response
            });
            throw error;
        }
    },
    
    
    // Add a method to get exercise details
    getExerciseDetails: async (exerciseIds) => {
        try {
            const response = await axios.get(`${BASE_URL}/workouts/exercises/details`, {
                params: { exerciseIds: exerciseIds.join(',') },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Exercise Details:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            throw error;
        }
    }


};

export default {
    workoutService,
    exerciseLibraryService
};
