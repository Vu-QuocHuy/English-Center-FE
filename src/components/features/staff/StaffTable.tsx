import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Staff } from '../../../types';

interface StaffTableProps {
  staffs: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  onViewDetails: (staff: Staff) => void;
  loading?: boolean;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staffs,
  onEdit,
  onDelete,
  onViewDetails,
  loading = false
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (staffs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có nhân viên nào</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2} sx={{ backgroundColor: 'white' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Họ và tên</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Số điện thoại</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giới tính</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Vai trò</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staffs && Array.isArray(staffs) && staffs.map((staff) => (
            <TableRow key={staff.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {staff.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {staff.email}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {staff.phone}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {staff.gender === 'male' ? 'Nam' : 'Nữ'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {staff.role?.name || staff.role?.description || 'Chưa có vai trò'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => onViewDetails(staff)}
                    sx={{ color: 'grey.600' }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(staff)}
                    sx={{ color: 'grey.600' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(staff)}
                    sx={{ color: '#f44336' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {(!staffs || !Array.isArray(staffs) || staffs.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.primary' }}>
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu nhân viên
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StaffTable;
