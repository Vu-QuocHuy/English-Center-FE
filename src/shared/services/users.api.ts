import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '@/config/api';
import { createQueryParams } from '@shared/utils/apiHelpers';
import type { UserUpdateData, ApiParams } from '@shared/types';

export const uploadAvatarAPI = (data: { imageUrl: string; publicId: string }) => {
  const formData = new URLSearchParams();
  formData.append('imageUrl', data.imageUrl);
  formData.append('publicId', data.publicId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
};

export const getUserByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id));

export const updateUserAPI = (userId: string, data: UserUpdateData) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

// Staff Management APIs
export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
  dayOfBirth: string; // Format: MM/DD/YYYY
  address: string;
  phone: string;
  roleId?: string;
}

export interface UpdateStaffData extends Partial<CreateStaffData> {
  password?: string;
}

export interface StaffFilters {
  name?: string;
  email?: string;
}

export const getAllStaffAPI = (params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_ALL, { params: createQueryParams(params || {}) });

export const getStaffByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id));

export const createStaffAPI = (data: CreateStaffData) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return axiosInstance.post(API_CONFIG.ENDPOINTS.USERS.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const updateStaffAPI = (id: string, data: UpdateStaffData) => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const deleteStaffAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(id));

export const assignRoleAPI = (data: { userId: string; roleId: string }) => {
  const formData = new URLSearchParams();
  formData.append('userId', data.userId);
  formData.append('roleId', data.roleId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.ASSIGN_ROLE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
