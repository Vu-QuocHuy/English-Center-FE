import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '@/config/api';

export const manualUpdateClassStatusAPI = () => {
  return axiosInstance.post(API_CONFIG.ENDPOINTS.CRON.UPDATE_CLASS_STATUS);
};
