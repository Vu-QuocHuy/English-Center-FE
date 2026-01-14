import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '../../../config/api';

export const createArticleAPI = (data: any) =>
  axiosInstance.post(API_CONFIG.ENDPOINTS.ARTICLES.CREATE, data, {
    headers: { 'Content-Type': 'application/json' }
  });

export const getAllArticlesAPI = (params?: { limit?: number; page?: number; filters?: { menuId?: string } }) => {
  const queryParams: any = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.filters) queryParams.filters = JSON.stringify(params.filters);
  return axiosInstance.get(API_CONFIG.ENDPOINTS.ARTICLES.GET_ALL, { params: queryParams });
};

export const getArticleByIdAPI = (id: string) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_ID(id));

export const updateArticleAPI = (id: string, data: any) =>
  axiosInstance.patch(API_CONFIG.ENDPOINTS.ARTICLES.UPDATE(id), data, {
    headers: { 'Content-Type': 'application/json' }
  });

export const deleteArticleAPI = (id: string) =>
  axiosInstance.delete(API_CONFIG.ENDPOINTS.ARTICLES.DELETE(id));

export const getArticlesByMenuIdAPI = (menuId: string) => {
  const filters = JSON.stringify({ menuId });
  return axiosInstance.get(`/articles?filters=${encodeURIComponent(filters)}`);
};

export const getArticlesByMenuSlugAPI = (slug: string) =>
  axiosInstance.get(`/public/${slug}/articles`);

// Export type for backward compatibility
export type { ArticleData } from '../types';
