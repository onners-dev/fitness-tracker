import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL as string}/api`;

export interface WorkoutData {
  workout_type: string;
  workout_name: string;
  date: string;
  total_duration: string | null;
  total_calories_burned: string | null;
  notes?: string | null;
  exercises: Array<any>;
  [key: string]: any;
}

export interface Muscle {
  muscle_id?: number | string;
  name: string;
}

export interface Exercise {
  exercise_id: string;
  name: string;
  difficulty?: string;
  equipment?: string;
  equipment_options?: string[];
  [key: string]: any;
}

export interface ExerciseDetailsResponse {
  [key: string]: any;
}

export const workoutService = {
  logWorkout: async (workoutData: WorkoutData): Promise<any> => {
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

  getWorkouts: async (startDate: string, endDate: string): Promise<any> => {
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

export const exerciseLibraryService = {
  getMuscles: async (groupName?: string): Promise<Muscle[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/workouts/muscles`, {
        params: { groupName },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      throw error;
    }
  },

  getExercises: async (muscleId: string | number | null = null, filters: Record<string, string> = {}): Promise<Exercise[]> => {
    try {
      const queryParams: Record<string, any> = {};
      if (muscleId) {
        queryParams.muscleGroup = muscleId;
      }
      if (filters.difficulty && filters.difficulty !== 'all') {
        queryParams.difficulty = filters.difficulty;
      }
      if (filters.equipment && filters.equipment !== 'all') {
        queryParams.equipment = filters.equipment;
      }

      const response = await axios.get(`${BASE_URL}/workouts/exercises`, {
        params: queryParams,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const processedExercises: Exercise[] = response.data.map((exercise: any) => {
        const equipmentOptions = exercise.equipment_options ?? exercise.equipment ?? ['N/A'];
        return {
          ...exercise,
          equipment_options: Array.isArray(equipmentOptions)
            ? equipmentOptions
            : [equipmentOptions]
        };
      });

      return processedExercises;
    } catch (error) {
      throw error;
    }
  },

  getExerciseDetails: async (exerciseIds: string[]): Promise<ExerciseDetailsResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/workouts/exercises/details`, {
        params: { exerciseIds: exerciseIds.join(',') },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default {
  workoutService,
  exerciseLibraryService
};
