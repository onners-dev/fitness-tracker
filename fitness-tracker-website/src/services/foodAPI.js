import axios from 'axios';

const OPEN_FOOD_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export const searchFood = async (query) => {
  try {
    const response = await axios.get(OPEN_FOOD_API_URL, {
      params: {
        search_terms: query,
        json: 1,
        page_size: 25,
        search_simple: 1,
        action: 'process',
        fields: 'product_name,nutriments,_id'
      }
    });

    if (response.data && response.data.products) {
      return response.data.products.filter(product => 
        product.product_name && 
        product.nutriments?.energy_100g
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error searching food:', error);
    throw error;
  }
};
