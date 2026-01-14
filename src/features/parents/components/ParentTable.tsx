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
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { Parent } from '@shared/types';

interface ParentTableProps {
  parents: Parent[];
  onEdit: (parent: Parent) => void;
  onDelete: (parentId: string) => void;
  onViewDetails: (parent: Parent) => void;
  loading?: boolean;
}

const ParentTable: React.FC<ParentTableProps> = ({
  parents,
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

  if (parents.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có phụ huynh nào</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          backgroundColor: 'white',
          '& .MuiTableBody-root .MuiTableCell-root': {
            color: 'black !important'
          },
          '& .MuiTableBody-root .MuiTypography-root': {
            color: 'inherit !important'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Họ và tên</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Số điện thoại</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Con</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giới tính</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Ngày sinh</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parents && Array.isArray(parents) && parents.map((parent) => (
              <TableRow key={parent.id} hover sx={{
                '& .MuiTableCell-root': { color: '#000000 !important' },
                '& .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root > *:not(.MuiSvgIcon-root):not(.MuiIconButton-root):not(.MuiChip-root)': {
                  color: '#000000 !important'
                }
              }}>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {parent.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {parent.students && parent.students.length > 0 ? (
                      parent.students.map((student: any, index: number) => (
                        <Typography key={student.id || index} variant="body2" sx={{ mb: index < parent.students.length - 1 ? 0.5 : 0 }}>
                          {student.name}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có con
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.gender === 'male' ? 'Nam' : parent.gender === 'female' ? 'Nữ' : 'Không xác định'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.dayOfBirth 
                      ? new Date(parent.dayOfBirth).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(parent)}
                      sx={{ color: 'grey.600' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(parent)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(parent.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!parents || !Array.isArray(parents) || parents.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu phụ huynh
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ParentTable;