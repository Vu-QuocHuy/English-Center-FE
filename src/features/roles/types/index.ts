// Roles and Permissions types
export interface CreateRoleRequest {
  name: string;
  isStaff: boolean;
  isActive: boolean;
  isSystem: boolean;
  description?: string;
  permissionIds?: number[];
}

export interface UpdateRoleRequest {
  name?: string;
  isActive?: boolean;
  isStaff?: boolean;
  isSystem?: boolean;
  description?: string;
  permissionIds?: number[];
}

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

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
