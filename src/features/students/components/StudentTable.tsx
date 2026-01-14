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
import { Student } from '@shared/types';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onViewDetails: (student: Student) => void;
  loading?: boolean;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
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

  if (students.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có học sinh nào</Typography>
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
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Phụ huynh</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Năm sinh</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giới tính</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students && Array.isArray(students) && students.map((student) => (
                            <TableRow key={student.id} hover sx={{
                '& .MuiTableCell-root': { color: '#000000 !important' },
                '& .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiTableCell-root > *:not(.MuiSvgIcon-root):not(.MuiIconButton-root):not(.MuiChip-root)': {
                  color: '#000000 !important'
                }
              }}>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {student.name || student.userId?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.email || student.userId?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.phone || student.userId?.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {(((student as any)?.parent && (student as any)?.parent?.id) || student.parentId)
                      ? (((student as any)?.parent?.name) || 'Có phụ huynh')
                      : 'Không có phụ huynh'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.dayOfBirth
                      ? new Date(student.dayOfBirth).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Không xác định'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(student)}
                      sx={{ color: 'grey.600' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(student)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(student.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!students || !Array.isArray(students) || students.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu học sinh
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

export default StudentTable;
