import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import { createQueryParams } from '@shared/utils/apiHelpers';
import type { ApiParams, ParentData } from '../types';

export const createParentAPI = (data: ParentData) => {
  return axiosInstance.post(API_CONFIG.ENDPOINTS.PARENTS.CREATE, data, {
    headers: { 'x-lang': 'vi' }
  });
};

export const getAllParentsAPI = (params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_ALL, { params: createQueryParams(params || {}) });

export const getParentByIdAPI = (id: string) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id), { headers: { 'x-lang': 'vi' } });

export const updateParentAPI = (id: string, data: Partial<ParentData>) => {
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.UPDATE(id), data);
};

export const deleteParentAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.DELETE(id));

export const addChildToParentAPI = (studentId: string, parentId: string) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.ADD_CHILD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const removeChildFromParentAPI = (studentId: string, parentId: string) => {
  const formData = new URLSearchParams();
  formData.append('studentId', studentId);
  formData.append('parentId', parentId);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.REMOVE_CHILD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getParentChildrenAPI = (id: string) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id));

// Legacy aliases
export const addChildAPI = (studentId: string, parentId: string) => addChildToParentAPI(studentId, parentId);
export const removeChildAPI = (studentId: string, parentId: string) => removeChildFromParentAPI(studentId, parentId);
