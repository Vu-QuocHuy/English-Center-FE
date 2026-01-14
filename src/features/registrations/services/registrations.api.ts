import axiosInstance from '@shared/utils/axios.customize';
import type { RegistrationData, RegistrationParams } from '../types';

export const createRegistrationAPI = (data: RegistrationData) => axiosInstance.post(`/registrations`, data);

// Helper function to format filters as JSON string
const formatFiltersString = (filters: Record<string, any>): string => {
  return JSON.stringify(filters);
};

export const getAllRegistrationsAPI = (params?: RegistrationParams) => {
  // Build query params
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.sort) queryParams.sort = params.sort;

  // Format filters with quotes for strings, without for boolean: {"name":"Nguyễn"}, {processed:false}
  if (params?.filters && Object.keys(params.filters).length > 0) {
    queryParams.filters = formatFiltersString(params.filters);
  }

  return axiosInstance.get(`/registrations`, { params: queryParams });
};

export const getRegistrationByIdAPI = (id: string) => {
  return axiosInstance.get(`/registrations/${id}`);
};

export const updateRegistrationAPI = (id: string, data: Partial<RegistrationData>) => {
  return axiosInstance.patch(`/registrations/${id}`, data);
};

export const deleteRegistrationAPI = (id: string) => {
  return axiosInstance.delete(`/registrations/${id}`);
};
