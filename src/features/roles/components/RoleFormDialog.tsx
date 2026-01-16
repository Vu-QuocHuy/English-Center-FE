import React, { useState, useEffect, memo, useMemo } from 'react';
import {
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
    Paper,
    Divider,
    Grid,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { Role, Permission } from '@shared/types';
import type { CreateRoleRequest } from '../types';
import { BaseDialog } from '@shared/components';

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
                    permissions: role.permissions?.map((p: Permission) => p.id) || [],
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
            permissionIds: formData.permissions.length > 0 ? formData.permissions : undefined,
        });

        if (result.success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <BaseDialog
            open={open}
            onClose={onClose}
            title={role ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
            maxWidth="md"
            fullWidth
            loading={loading}
            contentPadding={0}
            actions={(
                <>
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
                </>
            )}
        >
            <Box sx={{ p: 4, pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Basic Information Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{
                            color: '#2c3e50',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2.5
                        }}>
                            <Box sx={{
                                width: 4,
                                height: 20,
                                bgcolor: '#667eea',
                                borderRadius: 2
                            }} />
                            Thông tin cơ bản
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {/* Row 1: Tên vai trò + Switch Hoạt động */}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Tên vai trò"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        fullWidth
                                        required
                                        size="small"
                                        sx={{
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            '& .MuiOutlinedInput-root': {
                                                height: '56px',
                                                '& fieldset': {
                                                    borderColor: 'rgba(0, 0, 0, 0.12)',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'white',
                                            border: formData.isActive ? '2px solid' : '1px solid',
                                            borderColor: formData.isActive ? 'success.main' : 'divider',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '56px',
                                            '&:hover': {
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.isActive}
                                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                                    color="success"
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    Hoạt động
                                                </Typography>
                                            }
                                            sx={{ m: 0 }}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Row 2: Switch Nhân viên + Switch Hệ thống */}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'white',
                                            border: formData.isStaff ? '2px solid' : '1px solid',
                                            borderColor: formData.isStaff ? 'secondary.main' : 'divider',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '56px',
                                            '&:hover': {
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.isStaff}
                                                    onChange={(e) => handleChange('isStaff', e.target.checked)}
                                                    color="secondary"
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    Nhân viên
                                                </Typography>
                                            }
                                            sx={{ m: 0 }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'white',
                                            border: formData.isSystem ? '2px solid' : '1px solid',
                                            borderColor: formData.isSystem ? 'info.main' : 'divider',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            height: '56px',
                                            '&:hover': {
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={formData.isSystem}
                                                    onChange={(e) => handleChange('isSystem', e.target.checked)}
                                                    color="info"
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    Hệ thống
                                                </Typography>
                                            }
                                            sx={{ m: 0 }}
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Row 3: Mô tả */}
                            <TextField
                                label="Mô tả"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.12)',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Paper>

                    {/* Permissions Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                            <Typography variant="h6" sx={{
                                color: '#2c3e50',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box sx={{
                                    width: 4,
                                    height: 20,
                                    bgcolor: '#667eea',
                                    borderRadius: 2
                                }} />
                                Phân quyền
                            </Typography>
                            {formData.permissions.length > 0 && (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`${formData.permissions.length} quyền được chọn`}
                                    size="medium"
                                    color="primary"
                                    sx={{ fontWeight: 600 }}
                                />
                            )}
                        </Box>

                        {permissionsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={32} />
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    maxHeight: 350,
                                    overflow: 'auto',
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1',
                                        borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#888',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            background: '#555',
                                        },
                                    },
                                }}
                            >
                                {Object.entries(groupedPermissions).map(([module, modulePermissions], index) => {
                                    const modulePermissionIds = modulePermissions.map((p) => p.id);
                                    const selectedCount = modulePermissionIds.filter((id) => formData.permissions.includes(id)).length;
                                    const allSelected = selectedCount === modulePermissions.length;
                                    const someSelected = selectedCount > 0 && !allSelected;

                                    return (
                                        <Box key={module}>
                                            <Accordion
                                                disableGutters
                                                elevation={0}
                                                sx={{
                                                    '&:before': {
                                                        display: 'none',
                                                    },
                                                    '&.Mui-expanded': {
                                                        margin: 0,
                                                    },
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        bgcolor: 'grey.50',
                                                        px: 2,
                                                        py: 1,
                                                        '&:hover': {
                                                            bgcolor: 'grey.100',
                                                        },
                                                        transition: 'background-color 0.2s',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                                        <Checkbox
                                                            checked={allSelected}
                                                            indeterminate={someSelected}
                                                            onChange={() => handleModuleToggle(modulePermissions)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            size="small"
                                                            sx={{ color: 'primary.main' }}
                                                        />
                                                        <Typography fontWeight={600} sx={{ flex: 1 }}>
                                                            {module}
                                                        </Typography>
                                                        <Chip
                                                            label={`${selectedCount}/${modulePermissions.length}`}
                                                            size="small"
                                                            color={allSelected ? 'primary' : someSelected ? 'warning' : 'default'}
                                                            variant={allSelected ? 'filled' : 'outlined'}
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ px: 2, py: 2, bgcolor: 'white' }}>
                                                    <FormGroup>
                                                        {modulePermissions.map((permission) => (
                                                            <FormControlLabel
                                                                key={permission.id}
                                                                control={
                                                                    <Checkbox
                                                                        checked={formData.permissions.includes(permission.id)}
                                                                        onChange={() => handlePermissionToggle(permission.id)}
                                                                        size="small"
                                                                        sx={{ color: 'primary.main' }}
                                                                    />
                                                                }
                                                                label={
                                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                        {permission.description || 'Không có mô tả'}
                                                                    </Typography>
                                                                }
                                                                sx={{
                                                                    alignItems: 'center',
                                                                    mb: 1.5,
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    '&:hover': {
                                                                        bgcolor: 'action.hover',
                                                                    },
                                                                    transition: 'background-color 0.2s',
                                                                }}
                                                            />
                                                        ))}
                                                    </FormGroup>
                                                </AccordionDetails>
                                            </Accordion>
                                            {index < Object.keys(groupedPermissions).length - 1 && <Divider />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </BaseDialog>
    );
});

RoleFormDialog.displayName = 'RoleFormDialog';

export default RoleFormDialog;
