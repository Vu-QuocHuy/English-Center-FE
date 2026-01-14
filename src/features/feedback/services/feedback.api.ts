import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import type { CreateFeedbackRequest, UpdateFeedbackRequest, ApiParams } from '../types';

export const createFeedbackAPI = (data: CreateFeedbackRequest) => {
  const formData = new URLSearchParams();
  formData.append('name', data.name);
  formData.append('description', data.description);
  if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
  if (data.publicId) formData.append('publicId', data.publicId);
  if (data.socialUrl) formData.append('socialUrl', data.socialUrl);

  return axiosInstance.post(API_CONFIG.ENDPOINTS.FEEDBACK!.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getFeedbacksAPI = (params?: ApiParams) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  return axiosInstance.get(API_CONFIG.ENDPOINTS.FEEDBACK!.GET_ALL, {
    params: queryParams
  });
};

export const getFeedbackByIdAPI = (id: string) => {
  return axiosInstance.get(API_CONFIG.ENDPOINTS.FEEDBACK!.GET_BY_ID(id));
};

export const updateFeedbackAPI = (id: string, data: UpdateFeedbackRequest) => {
  const formData = new URLSearchParams();
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.imageUrl !== undefined) formData.append('imageUrl', data.imageUrl);
  if (data.publicId !== undefined) formData.append('publicId', data.publicId);
  if (data.socialUrl !== undefined) formData.append('socialUrl', data.socialUrl);

  return axiosInstance.patch(API_CONFIG.ENDPOINTS.FEEDBACK!.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteFeedbackAPI = (id: string) => {
  return axiosInstance.delete(API_CONFIG.ENDPOINTS.FEEDBACK!.DELETE(id));
};
