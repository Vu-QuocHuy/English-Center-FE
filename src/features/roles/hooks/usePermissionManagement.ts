import { useState, useEffect, useCallback } from 'react';
import { getAllPermissionsAPI, createPermissionAPI, updatePermissionAPI, deletePermissionAPI, type CreatePermissionRequest, type UpdatePermissionRequest } from '@features/roles';
import type { Permission } from '@shared/types';

export interface PermissionFilters {
    search: string;
    module: string;
}

export interface UsePermissionManagementReturn {
    // Data
    permissions: Permission[];
    modules: string[];

    // Loading states
    loading: boolean;
    formLoading: boolean;

    // Pagination
    page: number;
    totalPages: number;

    // Filters
    filters: PermissionFilters;
    setFilters: React.Dispatch<React.SetStateAction<PermissionFilters>>;

    // Dialog states
    dialogOpen: boolean;
    deleteDialogOpen: boolean;
    selectedPermission: Permission | null;

    // Actions
    fetchPermissions: () => Promise<void>;
    handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    handleOpenDialog: (permission?: Permission | null) => void;
    handleCloseDialog: () => void;
    handleOpenDeleteDialog: (permission: Permission) => void;
    handleCloseDeleteDialog: () => void;
    handleSubmit: (data: CreatePermissionRequest | UpdatePermissionRequest) => Promise<{ success: boolean; message: string }>;
    handleDelete: () => Promise<{ success: boolean; message: string }>;
}

export const usePermissionManagement = (): UsePermissionManagementReturn => {
    // Data states
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [modules, setModules] = useState<string[]>([]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Filters
    const [filters, setFilters] = useState<PermissionFilters>({
        search: '',
        module: '',
    });

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

    // Fetch permissions (without filters/pagination)
    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllPermissionsAPI();
            const data = response.data?.data;

            // API returns permissions grouped by module: { "Module1": [...], "Module2": [...] }
            // We need to flatten this into a single array
            let flatPermissions: Permission[] = [];
            let uniqueModules: string[] = [];

            if (data && typeof data === 'object' && !Array.isArray(data)) {
                // Data is an object with module names as keys
                uniqueModules = Object.keys(data);
                flatPermissions = uniqueModules.flatMap(module => data[module] || []);
            } else if (Array.isArray(data)) {
                // Fallback: data is already an array
                flatPermissions = data;
                uniqueModules = [...new Set(flatPermissions.map((p: Permission) => p.module).filter(Boolean))] as string[];
            }

            setModules(uniqueModules);
            setAllPermissions(flatPermissions);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setAllPermissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle Local Filtering and Pagination
    useEffect(() => {
        let result = [...allPermissions];

        // 1. Filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter((p: Permission) =>
                p.path.toLowerCase().includes(searchLower) ||
                (p.description && p.description.toLowerCase().includes(searchLower))
            );
        }
        if (filters.module) {
            result = result.filter((p: Permission) => p.module === filters.module);
        }

        // 2. Pagination
        setTotalPages(Math.ceil(result.length / limit) || 1);

        // Adjust page if out of bounds after filtering
        const maxPage = Math.ceil(result.length / limit) || 1;
        const currentPage = page > maxPage ? 1 : page;
        if (page > maxPage) setPage(1);

        const startIndex = (currentPage - 1) * limit;
        const paginatedPermissions = result.slice(startIndex, startIndex + limit);

        setPermissions(paginatedPermissions);
    }, [allPermissions, filters, page, limit]);

    // Initial fetch
    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // Pagination handler
    const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    }, []);

    // Dialog handlers
    const handleOpenDialog = useCallback((permission: Permission | null = null) => {
        setSelectedPermission(permission);
        setDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setSelectedPermission(null);
    }, []);

    const handleOpenDeleteDialog = useCallback((permission: Permission) => {
        setSelectedPermission(permission);
        setDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setSelectedPermission(null);
    }, []);

    // Submit handler (create/update)
    const handleSubmit = useCallback(async (data: CreatePermissionRequest | UpdatePermissionRequest): Promise<{ success: boolean; message: string }> => {
        setFormLoading(true);
        try {
            if (selectedPermission) {
                await updatePermissionAPI(selectedPermission.id, data as UpdatePermissionRequest);
                return { success: true, message: 'Cập nhật quyền thành công' };
            } else {
                await createPermissionAPI(data as CreatePermissionRequest);
                return { success: true, message: 'Tạo quyền thành công' };
            }
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Có lỗi xảy ra';
            return { success: false, message };
        } finally {
            setFormLoading(false);
        }
    }, [selectedPermission]);

    // Delete handler
    const handleDelete = useCallback(async (): Promise<{ success: boolean; message: string }> => {
        if (!selectedPermission) return { success: false, message: 'Không tìm thấy quyền' };

        setFormLoading(true);
        try {
            await deletePermissionAPI(selectedPermission.id);
            return { success: true, message: 'Xóa quyền thành công' };
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa';
            return { success: false, message };
        } finally {
            setFormLoading(false);
        }
    }, [selectedPermission]);

    return {
        permissions,
        modules,
        loading,
        formLoading,
        page,
        totalPages,
        filters,
        setFilters,
        dialogOpen,
        deleteDialogOpen,
        selectedPermission,
        fetchPermissions,
        handlePageChange,
        handleOpenDialog,
        handleCloseDialog,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        handleSubmit,
        handleDelete,
    };
};
