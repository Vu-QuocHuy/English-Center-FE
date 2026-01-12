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
} from '@mui/icons-material';
import type { Permission } from '../../../types';
import { COLORS } from '../../../utils/colors';

interface PermissionTableProps {
    permissions: Permission[];
    loading: boolean;
    onEdit: (permission: Permission) => void;
    onDelete: (permission: Permission) => void;
}

const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
        case 'GET': return 'info';
        case 'POST': return 'success';
        case 'PUT':
        case 'PATCH': return 'warning';
        case 'DELETE': return 'error';
        default: return 'default';
    }
};

const PermissionTable: React.FC<PermissionTableProps> = memo(({
    permissions,
    loading,
    onEdit,
    onDelete,
}) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (permissions.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">
                    Không có quyền nào
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
                        <TableCell sx={{ fontWeight: 600 }}>Đường dẫn</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 100 }}>Phương thức</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 150 }}>Module</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120, textAlign: 'center' }}>Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {permissions.map((permission, index) => (
                        <TableRow key={permission.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                <Chip label={permission.module} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={permission.method}
                                    size="small"
                                    color={getMethodColor(permission.method) as any}
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {permission.path}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary" sx={{
                                    maxWidth: 300,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {permission.description || '-'}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton
                                            size="small"
                                            onClick={() => onEdit(permission)}
                                            sx={{ color: COLORS.primary.main }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton
                                            size="small"
                                            onClick={() => onDelete(permission)}
                                            sx={{ color: COLORS.error.main }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
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

PermissionTable.displayName = 'PermissionTable';

export default PermissionTable;
