import React, { memo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Tooltip,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import type { Role } from '../../../types';
import { COLORS } from '../../../utils/colors';

interface RoleTableProps {
    roles: Role[];
    loading: boolean;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
    onView?: (role: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = memo(({
    roles,
    loading,
    onEdit,
    onDelete,
    onView,
}) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (roles.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">
                    Không có vai trò nào
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, width: 60 }}>STT</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tên vai trò</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120, textAlign: 'center' }}>Trạng thái</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 150, textAlign: 'center' }}>Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {roles.map((role, index) => (
                        <TableRow key={role.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontWeight={500}>{role.name}</Typography>
                                    {role.isSystem && (
                                        <Chip label="Hệ thống" size="small" color="info" variant="outlined" />
                                    )}
                                    {role.isStaff && (
                                        <Chip label="Nhân viên" size="small" color="secondary" variant="outlined" />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary" sx={{
                                    maxWidth: 300,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {role.description || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={role.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    color={role.isActive ? 'success' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                    {onView && (
                                        <Tooltip title="Xem chi tiết">
                                            <IconButton size="small" onClick={() => onView(role)}>
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton
                                            size="small"
                                            onClick={() => onEdit(role)}
                                            sx={{ color: COLORS.primary.main }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={role.isSystem ? 'Không thể xóa vai trò hệ thống' : 'Xóa'}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => onDelete(role)}
                                                disabled={role.isSystem}
                                                sx={{ color: role.isSystem ? 'action.disabled' : COLORS.error.main }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

RoleTable.displayName = 'RoleTable';

export default RoleTable;
