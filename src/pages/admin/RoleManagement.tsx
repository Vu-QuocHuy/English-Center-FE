import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Pagination,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Security as SecurityIcon,
    VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { BaseDialog } from '@shared/components';
import { commonStyles } from '@shared/utils';
import { useRoleManagement, usePermissionManagement } from '@features/roles';
import {
    RoleTable,
    RoleFilters,
    RoleFormDialog,
    RoleDetailDialog,
    PermissionTable,
    PermissionFilters,
    PermissionFormDialog,
} from '@features/roles';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
};

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

const RoleManagement: React.FC = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState(0);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Role management hook
    const roleManagement = useRoleManagement();

    // Permission management hook
    const permissionManagement = usePermissionManagement();

    // Handle tab change
    const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    }, []);

    // Show snackbar
    const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // Close snackbar
    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    // Role form submit handler
    const handleRoleFormSubmit = useCallback(async (data: any) => {
        const result = await roleManagement.handleSubmit(data);
        if (result.success) {
            showSnackbar(result.message, 'success');
            roleManagement.fetchRoles();
        } else {
            showSnackbar(result.message, 'error');
        }
        return result;
    }, [roleManagement, showSnackbar]);

    // Role delete handler
    const handleRoleDelete = useCallback(async () => {
        const result = await roleManagement.handleDelete();
        if (result.success) {
            showSnackbar(result.message, 'success');
            roleManagement.handleCloseDeleteDialog();
            roleManagement.fetchRoles();
        } else {
            showSnackbar(result.message, 'error');
        }
    }, [roleManagement, showSnackbar]);

    // Permission form submit handler
    const handlePermissionFormSubmit = useCallback(async (data: any) => {
        const result = await permissionManagement.handleSubmit(data);
        if (result.success) {
            showSnackbar(result.message, 'success');
            permissionManagement.fetchPermissions();
        } else {
            showSnackbar(result.message, 'error');
        }
        return result;
    }, [permissionManagement, showSnackbar]);

    // Permission delete handler
    const handlePermissionDelete = useCallback(async () => {
        const result = await permissionManagement.handleDelete();
        if (result.success) {
            showSnackbar(result.message, 'success');
            permissionManagement.handleCloseDeleteDialog();
            permissionManagement.fetchPermissions();
        } else {
            showSnackbar(result.message, 'error');
        }
    }, [permissionManagement, showSnackbar]);

    return (
        <DashboardLayout role="admin">
            <Box sx={commonStyles.pageContainer}>
                <Box sx={commonStyles.contentContainer}>
                    {/* Page Header */}
                    <Box sx={commonStyles.pageHeader}>
                        <Box>
                            <Typography sx={commonStyles.pageTitle}>
                                Quản lý vai trò và quyền hạn
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Quản lý phân quyền cho người dùng trong hệ thống
                            </Typography>
                        </Box>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    minHeight: 48,
                                },
                            }}
                        >
                            <Tab
                                icon={<SecurityIcon />}
                                iconPosition="start"
                                label="Vai trò"
                            />
                            <Tab
                                icon={<VpnKeyIcon />}
                                iconPosition="start"
                                label="Quyền hạn"
                            />
                        </Tabs>
                    </Box>

                    {/* Role Management Tab */}
                    <TabPanel value={activeTab} index={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <RoleFilters
                                filters={roleManagement.filters}
                                onFilterChange={roleManagement.setFilters}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => roleManagement.handleOpenDialog(null)}
                                sx={commonStyles.primaryButton}
                            >
                                Thêm vai trò
                            </Button>
                        </Box>

                        <RoleTable
                            roles={roleManagement.roles}
                            loading={roleManagement.loading}
                            onEdit={roleManagement.handleOpenDialog}
                            onDelete={roleManagement.handleOpenDeleteDialog}
                            onView={roleManagement.handleOpenViewDialog}
                        />

                        {roleManagement.totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={roleManagement.totalPages}
                                    page={roleManagement.page}
                                    onChange={roleManagement.handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </TabPanel>

                    {/* Permission Management Tab */}
                    <TabPanel value={activeTab} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <PermissionFilters
                                filters={permissionManagement.filters}
                                modules={permissionManagement.modules}
                                onFilterChange={permissionManagement.setFilters}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => permissionManagement.handleOpenDialog(null)}
                                sx={commonStyles.primaryButton}
                            >
                                Thêm quyền
                            </Button>
                        </Box>

                        <PermissionTable
                            permissions={permissionManagement.permissions}
                            loading={permissionManagement.loading}
                            onEdit={permissionManagement.handleOpenDialog}
                            onDelete={permissionManagement.handleOpenDeleteDialog}
                        />

                        {permissionManagement.totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={permissionManagement.totalPages}
                                    page={permissionManagement.page}
                                    onChange={permissionManagement.handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </TabPanel>

                    {/* Role Form Dialog */}
                    <RoleFormDialog
                        open={roleManagement.dialogOpen}
                        role={roleManagement.selectedRole}
                        permissions={roleManagement.permissions}
                        permissionsLoading={roleManagement.permissionsLoading}
                        loading={roleManagement.formLoading}
                        onClose={roleManagement.handleCloseDialog}
                        onSubmit={handleRoleFormSubmit}
                        onSuccess={() => { }}
                    />

                    {/* Role Detail Dialog */}
                    <RoleDetailDialog
                        open={roleManagement.viewDialogOpen}
                        role={roleManagement.selectedRole}
                        onClose={roleManagement.handleCloseViewDialog}
                        onEdit={(role) => {
                            roleManagement.handleCloseViewDialog();
                            roleManagement.handleOpenDialog(role);
                        }}
                    />

                    {/* Role Delete Confirmation Dialog */}
                    <BaseDialog
                        open={roleManagement.deleteDialogOpen}
                        onClose={roleManagement.handleCloseDeleteDialog}
                        title="Xác nhận xóa vai trò"
                        maxWidth="xs"
                        fullWidth
                        loading={roleManagement.formLoading}
                        actions={(
                            <>
                                <Button
                                    onClick={roleManagement.handleCloseDeleteDialog}
                                    disabled={roleManagement.formLoading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleRoleDelete}
                                    color="error"
                                    variant="contained"
                                    disabled={roleManagement.formLoading}
                                >
                                    Xóa
                                </Button>
                            </>
                        )}
                    >
                        <Typography>
                            Bạn có chắc chắn muốn xóa vai trò <strong>{roleManagement.selectedRole?.name}</strong>?
                        </Typography>
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            Hành động này không thể hoàn tác.
                        </Typography>
                    </BaseDialog>

                    {/* Permission Form Dialog */}
                    <PermissionFormDialog
                        open={permissionManagement.dialogOpen}
                        permission={permissionManagement.selectedPermission}
                        loading={permissionManagement.formLoading}
                        onClose={permissionManagement.handleCloseDialog}
                        onSubmit={handlePermissionFormSubmit}
                        onSuccess={() => { }}
                    />

                    {/* Permission Delete Confirmation Dialog */}
                    <BaseDialog
                        open={permissionManagement.deleteDialogOpen}
                        onClose={permissionManagement.handleCloseDeleteDialog}
                        title="Xác nhận xóa quyền"
                        maxWidth="xs"
                        fullWidth
                        loading={permissionManagement.formLoading}
                        actions={(
                            <>
                                <Button
                                    onClick={permissionManagement.handleCloseDeleteDialog}
                                    disabled={permissionManagement.formLoading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handlePermissionDelete}
                                    color="error"
                                    variant="contained"
                                    disabled={permissionManagement.formLoading}
                                >
                                    Xóa
                                </Button>
                            </>
                        )}
                    >
                        <Typography>
                            Bạn có chắc chắn muốn xóa quyền <strong>{permissionManagement.selectedPermission?.path}</strong>?
                        </Typography>
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            Hành động này không thể hoàn tác.
                        </Typography>
                    </BaseDialog>

                    {/* Snackbar */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={4000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleCloseSnackbar}
                            severity={snackbar.severity}
                            variant="filled"
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default RoleManagement;