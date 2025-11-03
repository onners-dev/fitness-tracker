import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL as string;

export type ContentType = 'workout' | 'exercise' | 'plan' | string; // replace or extend as needed

export interface ReportResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

export const reportService = {
  reportContent: async (
    contentType: ContentType,
    contentId: string | number,
    reason: string
  ): Promise<ReportResponse> => {
    try {
      const response = await axios.post(
        `${BASE_URL}/report/content`,
        { contentType, contentId, reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      // Narrow error type for IntelliSense
      throw error;
    }
  }
};

export default reportService;
