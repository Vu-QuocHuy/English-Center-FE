import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import { createQueryParams } from '@shared/utils/apiHelpers';
import type { ApiParams, PaymentData } from '../types';

// Student Payments APIs
export const getAllPaymentsAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, {
    params: queryParams,
    headers: { 'x-lang': 'vi' }
  });
};

export const payStudentAPI = (paymentId: string, data: PaymentData) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(Number(data.amount)));
  if (data.method) formData.append('method', data.method);
  if (data.note) formData.append('note', data.note);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.PAYMENTS.PAY_STUDENT(paymentId), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const getPaymentsByStudentAPI = (studentId: string, params?: ApiParams) =>
  axiosInstance.get(`/payments/students/${studentId}`, { params });

export const getTotalPaymentsAPI = () => axiosInstance.get('/payments/total');

export const exportPaymentsReportAPI = (filters?: Record<string, any>) => {
  const params: Record<string, any> = {};
  if (filters && Object.keys(filters).length > 0) {
    params.filters = typeof filters === 'string' ? filters : JSON.stringify(filters);
  }
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.EXPORT_REPORT, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Accept': 'application/json'
    },
    params
  });
};

export const getQRCodeAPI = (amount: number, paymentId: string) => {
  const amountInt = Math.floor(Math.abs(Number(amount)));

  if (amountInt <= 0 || isNaN(amountInt)) {
    throw new Error('Số tiền phải là số nguyên lớn hơn 0');
  }

  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_QR_CODE, {
    params: {
      amount: amountInt,
      paymentId: paymentId,
      download: false
    },
    headers: {
      'x-lang': 'vi'
    },
    withCredentials: true
  });
};

export const payTuitionAPI = (data: any) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.PAY_TUITION_FEE, data);

// Teacher Payments APIs
export const getAllTeacherPaymentsAPI = (params?: ApiParams) => {
  const queryParams = createQueryParams(params || {});
  return axiosInstance.get('/teacher-payments', { params: queryParams });
};

export const updateTeacherPaymentAPI = (id: string, data: {
  method?: string;
  paidAmount?: number;
  note?: string;
}) => axiosInstance.patch(`/teacher-payments/${id}`, data);

export const payTeacherAPI = (id: string, data: PaymentData, params: ApiParams = {}) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(Number(data.amount)));
  if (data.method) formData.append('method', data.method);
  if (data.note) formData.append('note', data.note);
  return axiosInstance.post(`/teacher-payments/${id}/pay`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    params
  });
};

export const getTeacherPaymentByIdAPI = (id: string) => axiosInstance.get(`/teacher-payments/${id}`);

export const exportTeacherPaymentsReportAPI = (filters?: Record<string, any>) => {
  const params: Record<string, any> = {};
  if (filters && Object.keys(filters).length > 0) {
    params.filters = typeof filters === 'string' ? filters : JSON.stringify(filters);
  }
  return axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.TEACHER_EXPORT_REPORT, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Accept': 'application/json'
    },
    params
  });
};

// Legacy aliases for backward compatibility
export const getTeacherPaymentsAPI = getAllTeacherPaymentsAPI;
export const getPaymentsAPI = getAllPaymentsAPI;
