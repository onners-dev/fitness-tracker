// src/services/contributedFoodApi.js
import axios from 'axios';

const BASE_URL = '/api/foods';

export const contributedFoodService = {
    // Contribute a new food
    contributeFood: async (foodData) => {
        try {
            const response = await axios.post(`${BASE_URL}/contribute`, foodData);
            return response.data;
        } catch (error) {
            console.error('Error contributing food:', error);
            throw error;
        }
    },

    // Get user's contributed foods
    getMyContributions: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/my-contributions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching contributions:', error);
            throw error;
        }
    },

    // Search contributed foods
    searchContributedFoods: async (query) => {
        try {
            const response = await axios.get(`${BASE_URL}/search`, { 
                params: { query } 
            });
            return response.data;
        } catch (error) {
            console.error('Error searching contributed foods:', error);
            throw error;
        }
    }
};
