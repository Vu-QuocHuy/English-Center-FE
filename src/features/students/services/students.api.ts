import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import { createQueryParams } from '@shared/utils/apiHelpers';
import type { ApiParams, StudentData } from '../types';

export const createStudentAPI = (data: StudentData) => axiosInstance.post(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, data);

export const getAllStudentsAPI = (params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_ALL, { params: createQueryParams(params || {}) });

export const getStudentByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_BY_ID(id));

export const updateStudentAPI = (id: string, data: Partial<StudentData>) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE(id), data);

export const deleteStudentAPI = (id: string) =>
  axiosInstance.delete(API_CONFIG.ENDPOINTS.STUDENTS.DELETE(id));

export const getStudentScheduleAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.SCHEDULE(id));

export const getStudentAttendanceAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.ATTENDANCE(id));

export const getMonthlyStudentChangeAPI = (params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.MONTHLY_CHANGES, { params });

export const getStudentDashboardAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.STUDENT(id));

// API mới: Lấy thống kê học sinh (cần auth admin)
export const getStudentStatisticsAPI = (year?: number) => {
  const params = year ? { year } : {};
  return axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.STATISTICS, {
    params,
    headers: {
      'x-lang': 'vi'
    }
  });
};

// Export type for backward compatibility
export type { StudentScheduleClass } from '../types';
