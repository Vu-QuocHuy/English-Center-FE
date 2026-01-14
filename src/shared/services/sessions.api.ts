import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '@/config/api';
import type { ApiParams, AttendanceData } from '@shared/types';

export const getTodaySessionAPI = (classId: string) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_TODAY(classId));

export const updateSessionAttendanceAPI = (sessionId: string, data: AttendanceData[]) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.SESSIONS.UPDATE_ATTENDANCE(sessionId), data);

export const getSessionsByClassAPI = (classId: string, params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_ALL_BY_CLASS(classId), { params });

export const getSessionsByStudentAPI = (studentId: string) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_BY_STUDENT(studentId));

export const getAttendanceListAPI = (params: { classId: string; limit?: number; page?: number }) => {
  const { classId, ...queryParams } = params;
  return axiosInstance.get(`/sessions/all/${classId}`, { params: queryParams });
};

export const getAttendanceByIdAPI = (id: string) => axiosInstance.get(`/attendances/${id}`);
