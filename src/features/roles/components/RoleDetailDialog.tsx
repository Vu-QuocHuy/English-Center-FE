import React, { memo, useMemo } from 'react';
import {
    Button,
    Box,
    Typography,
    Chip,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import type { Role, Permission } from '@shared/types';
import { BaseDialog } from '@shared/components';

interface RoleDetailDialogProps {
    open: boolean;
    role: Role | null;
    onClose: () => void;
    onEdit: (role: Role) => void;
}

const RoleDetailDialog: React.FC<RoleDetailDialogProps> = memo(({
    open,
    role,
    onClose,
    onEdit,
}) => {
    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        if (!role?.permissions) return {};
        const groups: Record<string, Permission[]> = {};
        role.permissions.forEach((permission: Permission) => {
            if (!groups[permission.module]) {
                groups[permission.module] = [];
            }
            groups[permission.module].push(permission);
        });
        return groups;
    }, [role]);

    if (!role) return null;

    return (
        <BaseDialog
            open={open}
            onClose={onClose}
            title="Chi tiết vai trò"
            maxWidth="md"
            fullWidth
            contentPadding={0}
            actions={(
                <>
                    <Button onClick={onClose} variant="outlined">
                        Đóng
                    </Button>
                    <Button
                        onClick={() => {
                            onClose();
                            onEdit(role);
                        }}
                        variant="contained"
                        startIcon={<AdminIcon />}
                    >
                        Chỉnh sửa
                    </Button>
                </>
            )}
        >
            <Box sx={{ p: 4, pt: 3 }}>
                <Grid container spacing={3}>
                    {/* Basic Info */}
                    <Grid item xs={12}>
                        <Box sx={{ mb: 2, mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Thông tin chung
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Tên vai trò</Typography>
                                        <Typography variant="body1" fontWeight={500}>{role.name}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                icon={role.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                                                label={role.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                color={role.isActive ? 'success' : 'default'}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mr: 1 }}
                                            />
                                            {role.isSystem && (
                                                <Chip label="Hệ thống" size="small" color="info" variant="outlined" sx={{ mr: 1 }} />
                                            )}
                                            {role.isStaff && (
                                                <Chip label="Nhân viên" size="small" color="secondary" variant="outlined" />
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Mô tả</Typography>
                                        <Typography variant="body2">{role.description || 'Không có mô tả'}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Permissions */}
                    <Grid item xs={12}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Danh sách quyền hạn
                                </Typography>
                                <Chip
                                    label={`${role.permissions?.length || 0} quyền`}
                                    size="small"
                                    color="primary"
                                />
                            </Box>

                            <Box sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                {Object.keys(groupedPermissions).length > 0 ? (
                                    Object.entries(groupedPermissions).map(([module, permissions]) => (
                                        <Accordion key={module} disableGutters elevation={0}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography fontWeight={500} sx={{ flex: 1 }}>{module}</Typography>
                                                <Chip label={permissions.length} size="small" variant="outlined" sx={{ mr: 2 }} />
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pt: 0, bgcolor: '#fafafa' }}>
                                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                    {permissions.map((p) => (
                                                        <Box component="li" key={p.id} sx={{ py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip
                                                                label={p.method}
                                                                size="small"
                                                                sx={{
                                                                    minWidth: 60,
                                                                    height: 20,
                                                                    fontSize: '0.7rem',
                                                                    bgcolor: p.method === 'GET' ? 'info.light' :
                                                                        p.method === 'POST' ? 'success.light' :
                                                                            p.method === 'PATCH' ? 'warning.light' : 'error.light',
                                                                    color: 'white',
                                                                }}
                                                            />
                                                            <Typography variant="body2">
                                                                {p.description}
                                                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                                    ({p.path})
                                                                </Typography>
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Vai trò này chưa được gán quyền nào
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </BaseDialog>
    );
});

RoleDetailDialog.displayName = 'RoleDetailDialog';

export default RoleDetailDialog;
