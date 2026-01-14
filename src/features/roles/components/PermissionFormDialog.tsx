import React, { useState, useEffect, memo } from 'react';
import {
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    CircularProgress
} from '@mui/material';
import type { Permission } from '@shared/types';
import type { CreatePermissionRequest } from '@features/roles';
import { BaseDialog } from '@shared/components';

interface PermissionFormDialogProps {
    open: boolean;
    permission: Permission | null;
    loading: boolean;
    onClose: () => void;
    onSubmit: (data: CreatePermissionRequest) => Promise<{ success: boolean; message: string }>;
    onSuccess: () => void;
}

interface FormData {
    path: string;
    method: string;
    description: string;
    module: string;
}

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];

const PermissionFormDialog: React.FC<PermissionFormDialogProps> = memo(({
    open,
    permission,
    loading,
    onClose,
    onSubmit,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<FormData>({
        path: '',
        method: 'GET',
        description: '',
        module: '',
    });
    const [errors, setErrors] = useState<{ path?: string; module?: string }>({});

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            if (permission) {
                setFormData({
                    path: permission.path,
                    method: permission.method,
                    description: permission.description || '',
                    module: permission.module,
                });
            } else {
                setFormData({
                    path: '',
                    method: 'GET',
                    description: '',
                    module: '',
                });
            }
            setErrors({});
        }
    }, [open, permission]);

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: { path?: string; module?: string } = {};
        if (!formData.path.trim()) {
            newErrors.path = 'Path không được để trống';
        }
        if (!formData.module.trim()) {
            newErrors.module = 'Module không được để trống';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const result = await onSubmit({
            path: formData.path.trim(),
            method: formData.method,
            description: formData.description.trim(),
            module: formData.module.trim().toUpperCase(),
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
            title={permission ? 'Chỉnh sửa quyền' : 'Thêm quyền mới'}
            maxWidth="sm"
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
                        {permission ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </>
            )}
        >
            <Box sx={{ p: 4, pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Module"
                        value={formData.module}
                        onChange={(e) => handleChange('module', e.target.value)}
                        error={!!errors.module}
                        helperText={errors.module || 'VD: USERS, CLASSES, PAYMENTS'}
                        fullWidth
                        required
                        size="small"
                    />

                    <FormControl fullWidth size="small" required>
                        <InputLabel>Method</InputLabel>
                        <Select
                            value={formData.method}
                            label="Method"
                            onChange={(e) => handleChange('method', e.target.value)}
                        >
                            {HTTP_METHODS.map((method) => (
                                <MenuItem key={method} value={method}>
                                    {method}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Path"
                        value={formData.path}
                        onChange={(e) => handleChange('path', e.target.value)}
                        error={!!errors.path}
                        helperText={errors.path || 'VD: /users, /classes/:id'}
                        fullWidth
                        required
                        size="small"
                        placeholder="/api/endpoint"
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
                </Box>
            </Box>
        </BaseDialog>
    );
});

PermissionFormDialog.displayName = 'PermissionFormDialog';

export default PermissionFormDialog;
