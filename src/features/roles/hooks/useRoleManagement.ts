import { useState, useEffect, useCallback } from 'react';
import { getAllRolesAPI, createRoleAPI, updateRoleAPI, deleteRoleAPI, getAllPermissionsAPI, getRoleByIdAPI } from '@features/roles';
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '@shared/types';

export interface RoleFilters {
    search: string;
    isActive: string;
    isStaff: string;
    isSystem: string;
}

export interface UseRoleManagementReturn {
    // Data
    roles: Role[];
    permissions: Permission[];

    // Loading states
    loading: boolean;
    permissionsLoading: boolean;
    formLoading: boolean;

    // Pagination
    page: number;
    totalPages: number;

    // Filters
    filters: RoleFilters;
    setFilters: React.Dispatch<React.SetStateAction<RoleFilters>>;

    // Dialog states
    dialogOpen: boolean;
    deleteDialogOpen: boolean;
    selectedRole: Role | null;

    // Actions
    fetchRoles: (pageNum?: number) => Promise<void>;
    fetchPermissions: () => Promise<void>;
    handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    handleOpenDialog: (role?: Role | null) => void;
    handleCloseDialog: () => void;
    handleOpenViewDialog: (role: Role) => void;
    handleCloseViewDialog: () => void;
    viewDialogOpen: boolean;
    handleOpenDeleteDialog: (role: Role) => void;
    handleCloseDeleteDialog: () => void;
    handleSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<{ success: boolean; message: string }>;
    handleDelete: () => Promise<{ success: boolean; message: string }>;
}

export const useRoleManagement = (): UseRoleManagementReturn => {
    // Data states
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Filters
    const [filters, setFilters] = useState<RoleFilters>({
        search: '',
        isActive: '',
        isStaff: '',
        isSystem: '',
    });

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Fetch role details
    const fetchRoleDetails = useCallback(async (id: number) => {
        setFormLoading(true);
        try {
            const response = await getRoleByIdAPI(id.toString());
            const data = response.data?.data;
            if (data) {
                setSelectedRole(data);
            }
        } catch (error) {
            console.error('Error fetching role details:', error);
        } finally {
            setFormLoading(false);
        }
    }, []);

    // Fetch roles
    const fetchRoles = useCallback(async (pageNum = page) => {
        setLoading(true);
        try {
            const params: any = {
                page: pageNum,
                limit,
            };

            if (filters.search) params.name = filters.search;
            if (filters.isActive !== '') params.isActive = filters.isActive === 'true';
            if (filters.isStaff !== '') params.isStaff = filters.isStaff === 'true';
            if (filters.isSystem !== '') params.isSystem = filters.isSystem === 'true';

            const response = await getAllRolesAPI({ ...params, filters: JSON.stringify(filters) });
            const data = response.data?.data;
            setRoles(data?.result || []);
            setTotalPages(data?.meta?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, [page, filters, limit]);

    // Fetch permissions for role form
    const fetchPermissions = useCallback(async () => {
        setPermissionsLoading(true);
        try {
            const response = await getAllPermissionsAPI();
            const data = response.data?.data;

            // Handle grouped permissions similar to usePermissionManagement
            let flatPermissions: Permission[] = [];
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                flatPermissions = Object.keys(data).flatMap(module => data[module] || []);
            } else if (Array.isArray(data)) {
                flatPermissions = data;
            } else if (data?.result) {
                flatPermissions = data.result;
            }

            setPermissions(flatPermissions);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setPermissions([]);
        } finally {
            setPermissionsLoading(false);
        }
    }, []);

    // Pagination handler
    const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    }, []);

    // Dialog handlers
    const handleOpenDialog = useCallback((role: Role | null = null) => {
        setSelectedRole(role);
        setDialogOpen(true);
        // If editing, fetch details to get full permissions
        if (role) {
            fetchRoleDetails(role.id);
        }
    }, [fetchRoleDetails]);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setSelectedRole(null);
    }, []);

    const handleOpenViewDialog = useCallback((role: Role) => {
        setSelectedRole(role);
        setViewDialogOpen(true);
        // Fetch details to get full permissions for view
        fetchRoleDetails(role.id);
    }, [fetchRoleDetails]);

    const handleCloseViewDialog = useCallback(() => {
        setViewDialogOpen(false);
        setSelectedRole(null);
    }, []);

    const handleOpenDeleteDialog = useCallback((role: Role) => {
        setSelectedRole(role);
        setDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setSelectedRole(null);
    }, []);

    // Submit handler (create/update)
    const handleSubmit = useCallback(async (data: CreateRoleRequest | UpdateRoleRequest): Promise<{ success: boolean; message: string }> => {
        setFormLoading(true);
        try {
            if (selectedRole) {
                await updateRoleAPI(selectedRole.id, data as UpdateRoleRequest);
                return { success: true, message: 'Cập nhật vai trò thành công' };
            } else {
                await createRoleAPI(data as CreateRoleRequest);
                return { success: true, message: 'Tạo vai trò thành công' };
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Có lỗi xảy ra';
            return { success: false, message };
        } finally {
            setFormLoading(false);
        }
    }, [selectedRole]);

    // Delete handler
    const handleDelete = useCallback(async (): Promise<{ success: boolean; message: string }> => {
        if (!selectedRole) return { success: false, message: 'Không tìm thấy vai trò' };

        setFormLoading(true);
        try {
            await deleteRoleAPI(selectedRole.id);
            return { success: true, message: 'Xóa vai trò thành công' };
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa';
            return { success: false, message };
        } finally {
            setFormLoading(false);
        }
    }, [selectedRole]);

    // Initial fetch
    useEffect(() => {
        fetchRoles(1);
    }, [filters]); // Re-fetch when filters change

    // Fetch permissions when dialog opens
    useEffect(() => {
        if (dialogOpen && permissions.length === 0) {
            fetchPermissions();
        }
    }, [dialogOpen, permissions.length, fetchPermissions]);

    // Fetch when page changes
    useEffect(() => {
        fetchRoles(page);
    }, [page]);

    return {
        roles,
        permissions,
        loading,
        permissionsLoading,
        formLoading,
        page,
        totalPages,
        filters,
        setFilters,
        dialogOpen,
        deleteDialogOpen,
        selectedRole,
        fetchRoles,
        fetchPermissions,
        handlePageChange,
        handleOpenDialog,
        handleCloseDialog,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        handleSubmit,
        handleDelete,
        handleOpenViewDialog,
        handleCloseViewDialog,
        viewDialogOpen,
    };
};
