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
import { Teacher } from '@shared/types';

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onViewDetails: (teacher: Teacher) => void;
  loading?: boolean;
}



const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
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

  if (teachers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="text.secondary">Không có giáo viên nào</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={2} sx={{ backgroundColor: 'white' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Họ và tên</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Số điện thoại</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Lương/buổi</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giới tính</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers && Array.isArray(teachers) && teachers.map((teacher) => (
              <TableRow key={teacher.id || teacher.teacher_id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.name || teacher.userId?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.email || teacher.userId?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.phone || teacher.userId?.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {teacher.salaryPerLesson ? `${teacher.salaryPerLesson.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                  </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                    {teacher.gender === 'male' ? 'Nam' : teacher.gender === 'female' ? 'Nữ' : 'Không xác định'}
                    </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: teacher.isActive ? '#2e7d32' : '#c62828',
                      border: `1px solid ${teacher.isActive ? '#2e7d32' : '#c62828'}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {teacher.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(teacher)}
                      sx={{ color: 'grey.600' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(teacher)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(teacher)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!teachers || !Array.isArray(teachers) || teachers.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.primary' }}>
                  <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu giáo viên
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

export default TeacherTable;
