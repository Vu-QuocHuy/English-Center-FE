import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import { createQueryParams } from '@shared/utils/apiHelpers';
import type { ApiParams, CreateStaffData, UpdateStaffData } from '../types';

// Staff Management APIs
export const getAllStaffAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_ALL, { params: queryParams });
};

export const getStaffById = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id));

export const createStaffAPI = (data: CreateStaffData) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return axiosInstance.post(API_CONFIG.ENDPOINTS.USERS.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const updateStaffAPI = (id: string, data: UpdateStaffData) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteStaff = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(id));

// Legacy aliases
export const getStaffByIdAPI = getStaffById;
