import axios from 'axios';

const OPEN_FOOD_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

// Types for returned food data
export interface Nutriments {
  energy_100g?: number;
  proteins_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  [key: string]: any;
}

export interface Product {
  product_name: string;
  nutriments: Nutriments;
  _id?: string;
  image_url?: string;
  [key: string]: any;
}

export interface SearchFoodResponse {
  products: Product[];
  [key: string]: any;
}

export const searchFood = async (query: string): Promise<Product[]> => {
  try {
    const response = await axios.get<SearchFoodResponse>(OPEN_FOOD_API_URL, {
      params: {
        search_terms: query,
        json: 1,
        page_size: 25,
        search_simple: 1,
        action: 'process',
        fields: 'product_name,nutriments,_id,image_url'
      }
    });

    if (response.data && response.data.products) {
      return response.data.products.filter(product =>
        product.product_name &&
        product.nutriments?.energy_100g !== undefined
      );
    }

    return [];
  } catch (error: any) {
    throw error;
  }
};
