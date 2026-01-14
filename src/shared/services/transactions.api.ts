import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '@/config/api';
import { createQueryParams } from '@shared/utils/apiHelpers';
import type { ApiParams } from '@shared/types';

export const createTransactionAPI = (data: { amount: number; category_id?: string; description: string; }) => {
  const formData = new URLSearchParams();
  formData.append('amount', String(data.amount));
  if (data.category_id) formData.append('categoryId', data.category_id);
  if (data.description) formData.append('description', data.description);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.TRANSACTIONS.CREATE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-lang': 'vi' }
  });
};

export const getAllTransactionsAPI = (params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_ALL, { params: createQueryParams(params || {}), headers: { 'x-lang': 'vi' } });

export const getTransactionByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.GET_BY_ID(id), { headers: { 'x-lang': 'vi' } });

export const updateTransactionAPI = (id: string, data: Partial<{ amount: number; category_id?: string; description: string; }>) => {
  const formData = new URLSearchParams();
  if (data.amount) formData.append('amount', String(data.amount));
  if (data.category_id) formData.append('categoryId', data.category_id);
  if (data.description) formData.append('description', data.description);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.TRANSACTIONS.UPDATE(id), formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-lang': 'vi' }
  });
};

export const deleteTransactionAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.TRANSACTIONS.DELETE(id), { headers: { 'x-lang': 'vi' } });

export const createTransactionCategoryAPI = (data: { type: 'revenue' | 'expense'; name: string; }) => {
  const formData = new URLSearchParams();
  formData.append('type', data.type);
  formData.append('name', data.name);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.CREATE, formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
};

export const getAllTransactionCategoriesAPI = (params?: ApiParams) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.GET_ALL, { params: queryParams, headers: { 'x-lang': 'vi' } });
};

export const getTransactionCategoryByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.GET_BY_ID(id), { headers: { 'x-lang': 'vi' } });

export const updateTransactionCategoryAPI = (id: string, data: Partial<{ type: 'revenue' | 'expense'; name: string }>) => {
  const formData = new URLSearchParams();
  if (data.type) formData.append('type', data.type);
  if (data.name) formData.append('name', data.name);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.UPDATE(id), formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
};

export const deleteTransactionCategoryAPI = (id: string) => axiosInstance.delete(API_CONFIG.ENDPOINTS.TRANSACTION_CATEGORIES.DELETE(id), { headers: { 'x-lang': 'vi' } });

export const exportTransactionsReportAPI = (params?: ApiParams & { startDate?: string; endDate?: string; type?: 'revenue' | 'expense' }) => {
  const queryParams = createQueryParams(params || {});
  if (!params?.page) delete (queryParams as any).page;
  if (!params?.limit) delete (queryParams as any).limit;
  return axiosInstance.get(API_CONFIG.ENDPOINTS.TRANSACTIONS.REPORT, { headers: { 'x-lang': 'vi', 'Accept': 'application/json' }, params: queryParams });
};
