import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';
import type { MenuData, ApiParams } from '../types';

export const createMenuAPI = (data: MenuData) => axiosInstance.post(API_CONFIG.ENDPOINTS.MENUS.CREATE, data);

export const getAllMenusAPI = (params?: ApiParams) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.MENUS.GET_ALL, { params });

export const getMenuByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.MENUS.GET_BY_ID(id));

export const getMenuBySlugAPI = (slug: string) => axiosInstance.get(`/menus/slug/${slug}`);

export const updateMenuAPI = (id: string, data: Partial<MenuData>) => axiosInstance.patch(`/menus/${id}`, data);

export const deleteMenuAPI = (id: string) => axiosInstance.delete(`/menus/${id}`);

export const toggleMenuVisibilityAPI = (id: string, isActive: boolean) => axiosInstance.patch(`/menus/${id}`, { isActive });

// Export type for backward compatibility
export type { MenuData } from '../types';
