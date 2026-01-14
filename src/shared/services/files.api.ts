import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '@config/api';

export const uploadFileAPI = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.FILES.UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const deleteFileAPI = (publicId: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.FILES.DELETE, {
    params: { publicId },
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};
