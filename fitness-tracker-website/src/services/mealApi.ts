import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL as string}/api/meals`;

export interface Meal {
  meal_id: string;
  user_id: string;
  date: string;
  name: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  [key: string]: any;
}

export interface AddMealResponse {
  success: boolean;
  meal: Meal;
  [key: string]: any;
}

export interface GetMealsResponse {
  success: boolean;
  meals: Meal[];
  [key: string]: any;
}

export interface RemoveMealResponse {
  success: boolean;
  removedMealId: string;
  [key: string]: any;
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const mealService = {
  getMealsByDate: async (date: string): Promise<GetMealsResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/date/${date}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  addMeal: async (mealData: Omit<Meal, 'meal_id' | 'user_id'>): Promise<AddMealResponse> => {
    try {
      const response = await axios.post(BASE_URL, mealData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  removeMeal: async (mealId: string): Promise<RemoveMealResponse> => {
    try {
      const response = await axios.delete(`${BASE_URL}/${mealId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};

export default mealService;
