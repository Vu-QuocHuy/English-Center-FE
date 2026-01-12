import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';
import type { CreateRoleRequest, UpdateRoleRequest } from '../types';

export interface CreatePermissionRequest {
  path: string;
  method: string;
  description: string;
  module: string;
}

export interface UpdatePermissionRequest {
  path?: string;
  method?: string;
  description?: string;
  module?: string;
}

export const getAllRolesAPI = (params?: any) =>
  axiosInstance.get(API_CONFIG.ENDPOINTS.ROLES.GET_ALL, { params });
export const getRoleByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.ROLES.GET_BY_ID(id));
export const createRoleAPI = (data: CreateRoleRequest) => axiosInstance.post(API_CONFIG.ENDPOINTS.ROLES.CREATE, data);
export const updateRoleAPI = (id: number, data: UpdateRoleRequest) => axiosInstance.patch(API_CONFIG.ENDPOINTS.ROLES.UPDATE(id.toString()), data);
export const deleteRoleAPI = (id: number) => axiosInstance.delete(API_CONFIG.ENDPOINTS.ROLES.DELETE(id.toString()));
export const getAllPermissionsAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_ALL);
export const getPermissionByIdAPI = (id: string) => axiosInstance.get(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_BY_ID(id));
export const createPermissionAPI = (data: CreatePermissionRequest) => axiosInstance.post(API_CONFIG.ENDPOINTS.PERMISSIONS.CREATE, data);
export const updatePermissionAPI = (id: number, data: UpdatePermissionRequest) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PERMISSIONS.UPDATE(id.toString()), data);
export const deletePermissionAPI = (id: number) => axiosInstance.delete(API_CONFIG.ENDPOINTS.PERMISSIONS.DELETE(id.toString()));
