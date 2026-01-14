import axiosInstance from '@shared/utils/axios.customize';
import type { AdvertisementData, ApiParams } from '../types';

export const createAdvertisementAPI = (data: AdvertisementData) => {
  const formData = new URLSearchParams();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('priority', data.priority.toString());
  formData.append('imageUrl', data.imageUrl);
  formData.append('publicId', data.publicId);
  if (data.classId) formData.append('classId', data.classId);
  formData.append('type', data.type);
  return axiosInstance.post('/advertisements', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
};

export const getAdvertisementsAPI = (params?: ApiParams) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  return axiosInstance.get('/advertisements', { params: queryParams });
};

export const getHomeBannersAPI = (limit: number = 3) => {
  const timestamp = Date.now();
  return axiosInstance.get(`/advertisements/banners/${limit}?_t=${timestamp}`, {
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  });
};

export const getHomePopupAPI = () => {
  const timestamp = Date.now();
  return axiosInstance.get(`/advertisements/popup?_t=${timestamp}`, {
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  });
};

export const getAdvertisementByIdAPI = (id: string) => axiosInstance.get(`/advertisements/${id}`);

export const updateAdvertisementAPI = (id: string, data: Partial<AdvertisementData>) => {
  const formData = new URLSearchParams();
  if (data.title !== undefined) formData.append('title', data.title);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.priority !== undefined) formData.append('priority', data.priority.toString());
  if (data.imageUrl !== undefined) formData.append('imageUrl', data.imageUrl);
  if (data.publicId !== undefined) formData.append('publicId', data.publicId);
  if (data.classId !== undefined) formData.append('classId', data.classId);
  if (data.type !== undefined) formData.append('type', data.type);
  return axiosInstance.patch(`/advertisements/${id}`, formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
};

export const deleteAdvertisementAPI = (id: string) => axiosInstance.delete(`/advertisements/${id}`);
