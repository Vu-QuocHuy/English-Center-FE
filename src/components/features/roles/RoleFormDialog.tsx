import React, { useState, useEffect, memo, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Checkbox,
    FormGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Chip,
    IconButton,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import type { Role, Permission, CreateRoleRequest } from '../../../types';

interface RoleFormDialogProps {
    open: boolean;
    role: Role | null;
    permissions: Permission[];
    permissionsLoading: boolean;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: CreateRoleRequest) => Promise<{ success: boolean; message: string }>;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    description: string;
    isActive: boolean;
    isStaff: boolean;
    isSystem: boolean;
    permissions: number[];
}

const RoleFormDialog: React.FC<RoleFormDialogProps> = memo(({
    open,
    role,
    permissions,
    permissionsLoading,
    loading,
    onClose,
    onSubmit,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        isActive: true,
        isStaff: false,
        isSystem: false,
        permissions: [],
    });
    const [errors, setErrors] = useState<{ name?: string }>({});

    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        permissions.forEach((permission) => {
            if (!groups[permission.module]) {
                groups[permission.module] = [];
            }
            groups[permission.module].push(permission);
        });
        return groups;
    }, [permissions]);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            if (role) {
                setFormData({
                    name: role.name,
                    description: role.description || '',
                    isActive: role.isActive,
                    isStaff: role.isStaff,
                    isSystem: role.isSystem,
                    permissions: role.permissions?.map((p) => p.id) || [],
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    isActive: true,
                    isStaff: false,
                    isSystem: false,
                    permissions: [],
                });
            }
            setErrors({});
        }
    }, [open, role]);

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === 'name' && errors.name) {
            setErrors({});
        }
    };

    const handlePermissionToggle = (permissionId: number) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter((id) => id !== permissionId)
                : [...prev.permissions, permissionId],
        }));
    };

    const handleModuleToggle = (modulePermissions: Permission[]) => {
        const modulePermissionIds = modulePermissions.map((p) => p.id);
        const allSelected = modulePermissionIds.every((id) => formData.permissions.includes(id));

        setFormData((prev) => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter((id) => !modulePermissionIds.includes(id))
                : [...new Set([...prev.permissions, ...modulePermissionIds])],
        }));
    };

    const validate = (): boolean => {
        const newErrors: { name?: string } = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Tên vai trò không được để trống';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const result = await onSubmit({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            isActive: formData.isActive,
            isStaff: formData.isStaff,
            isSystem: formData.isSystem,
            permissions: formData.permissions,
        });

        if (result.success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Typography variant="h6" fontWeight={600}>
                    {role ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
                    <TextField
                        label="Tên vai trò"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        required
                        size="small"
                    />

                    <TextField
                        label="Mô tả"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                    />

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    color="success"
                                />
                            }
                            label="Hoạt động"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isStaff}
                                    onChange={(e) => handleChange('isStaff', e.target.checked)}
                                    color="secondary"
                                />
                            }
                            label="Nhân viên"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isSystem}
                                    onChange={(e) => handleChange('isSystem', e.target.checked)}
                                    color="info"
                                />
                            }
                            label="Hệ thống"
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                            Phân quyền
                            {formData.permissions.length > 0 && (
                                <Chip
                                    label={`${formData.permissions.length} quyền được chọn`}
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </Typography>

                        {permissionsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                                    const modulePermissionIds = modulePermissions.map((p) => p.id);
                                    const selectedCount = modulePermissionIds.filter((id) => formData.permissions.includes(id)).length;
                                    const allSelected = selectedCount === modulePermissions.length;
                                    const someSelected = selectedCount > 0 && !allSelected;

                                    return (
                                        <Accordion key={module} disableGutters elevation={0}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Checkbox
                                                        checked={allSelected}
                                                        indeterminate={someSelected}
                                                        onChange={() => handleModuleToggle(modulePermissions)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        size="small"
                                                    />
                                                    <Typography fontWeight={500}>{module}</Typography>
                                                    <Chip label={`${selectedCount}/${modulePermissions.length}`} size="small" variant="outlined" />
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pl: 5 }}>
                                                <FormGroup>
                                                    {modulePermissions.map((permission) => (
                                                        <FormControlLabel
                                                            key={permission.id}
                                                            control={
                                                                <Checkbox
                                                                    checked={formData.permissions.includes(permission.id)}
                                                                    onChange={() => handlePermissionToggle(permission.id)}
                                                                    size="small"
                                                                />
                                                            }
                                                            label={
                                                                <Box>
                                                                    <Typography variant="body2">
                                                                        <Chip
                                                                            label={permission.method}
                                                                            size="small"
                                                                            sx={{
                                                                                mr: 1,
                                                                                minWidth: 60,
                                                                                bgcolor: permission.method === 'GET' ? 'info.light' :
                                                                                    permission.method === 'POST' ? 'success.light' :
                                                                                        permission.method === 'PATCH' ? 'warning.light' : 'error.light',
                                                                                color: 'white',
                                                                            }}
                                                                        />
                                                                        {permission.path}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {permission.description}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            sx={{ alignItems: 'flex-start', mb: 1 }}
                                                        />
                                                    ))}
                                                </FormGroup>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} variant="outlined" disabled={loading}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {role ? 'Cập nhật' : 'Tạo mới'}
                </Button>
            </DialogActions>
        </Dialog>
    );
});

RoleFormDialog.displayName = 'RoleFormDialog';

export default RoleFormDialog;
