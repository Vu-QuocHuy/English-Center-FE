import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import { createQueryParams } from '@shared/utils/apiHelpers';
import type { ApiParams, TeacherData } from '../types';

export const createTeacherAPI = (data: TeacherData) =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, data, {
    headers: { 'Content-Type': 'application/json', 'x-lang': 'vi' }
  });

export const getAllTeachersAPI = (params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_ALL, { params: createQueryParams(params || {}) });

export const getTypicalTeachersAPI = () => {
  const timestamp = Date.now();
  return axiosInstance.get(`/teachers/typical?_t=${timestamp}`, {
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  });
};

// Public API to get all teachers without authentication
export const getPublicTeachersAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(`/teachers/public`, { 
    params: queryParams,
    headers: { 'x-lang': 'vi' }
  });
};

// Public API to get teacher by id without authentication
export const getPublicTeacherByIdAPI = (id: string) =>
  axiosInstance.get(`/teachers/public/${id}`, {
    headers: { 'x-lang': 'vi' }
  });

export const getTeacherByIdAPI = (id: string) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_BY_ID(id));

export const getTeacherBySlugAPI = (slug: string) =>
  axiosInstance.get(`/teachers/slug/${slug}`);

export const updateTeacherAPI = (id: string, data: Partial<TeacherData>) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE(id), data, {
    headers: { 'Content-Type': 'application/json' }
  });

export const deleteTeacherAPI = (id: string) =>
  axiosInstance.delete(API_CONFIG.ENDPOINTS.TEACHERS.DELETE(id));

export const getTeacherScheduleAPI = (id: string) => axiosInstance.get(`/teachers/schedule/${id}`);

export const getMyClassesAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_MY_CLASSES);

export const getTypicalTeacherDetailAPI = (id: string) => axiosInstance.get(`/teachers/typical/${id}`);
