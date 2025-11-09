import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL as string}/api/foods`;

export interface FoodContribution {
  name: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  [key: string]: any;
}

export interface MyContribution extends FoodContribution {
  food_id: string;
  user_id: string;
}

export interface ContributeResponse {
  success: boolean;
  food?: FoodContribution;
  [key: string]: any;
}

export interface MyContributionResponse {
  foods: MyContribution[];
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

export const contributedFoodService = {
  getMyContributions: async (): Promise<MyContributionResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/my-contributions`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  searchContributedFoods: async (query: string): Promise<FoodContribution[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: { query },
        headers: getAuthHeader()
      });
      return response.data.foods || [];
    } catch (error: any) {
      throw error;
    }
  },

  contributeFood: async (foodData: FoodContribution): Promise<ContributeResponse> => {
    try {
      const response = await axios.post(`${BASE_URL}/contribute`, foodData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};

export default contributedFoodService;
