import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const reportService = {
    reportContent: async (contentType, contentId, reason) => {
      try {
        console.log('Reporting content:', { 
          contentType, 
          contentId, 
          reason 
        });
  
        const response = await axios.post(`${BASE_URL}/report/content`, 
          { 
            contentType, 
            contentId, 
            reason 
          }, 
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
  
        console.log('Report submission response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error reporting content:', {
          error: error.message,
          response: error.response?.data
        });
        throw error;
      }
    }
  };
  
