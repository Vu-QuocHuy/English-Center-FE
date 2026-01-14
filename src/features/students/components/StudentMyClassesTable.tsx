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
  Chip,
  Typography
} from '@mui/material';
import {
  Visibility as ViewIcon
} from '@mui/icons-material';
import { COLORS } from '@shared/utils';

interface ClassItem {
  id: string;
  name: string;
  teacher: string;
  scheduleDays?: string;
  scheduleTime?: string;
  room: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface StudentMyClassesTableProps {
  classes: ClassItem[];
  getStatusColor: (status: string) => 'success' | 'error' | 'warning' | 'default';
  getStatusLabel: (status: string) => string;
  onViewDetails: (classItem: ClassItem) => void;
}

const StudentMyClassesTable: React.FC<StudentMyClassesTableProps> = ({
  classes,
  getStatusColor,
  getStatusLabel,
  onViewDetails
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: `${COLORS.primary}` }}>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Tên lớp</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Giáo viên</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Lịch học</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Phòng học</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Năm</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Ngày bắt đầu</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Ngày kết thúc</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Trạng thái</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 600 }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {classes.map((classItem) => (
            <TableRow key={classItem.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600, color: `${COLORS.primary}` }}>
                  {classItem.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                  {classItem.teacher}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600, color: `${COLORS.primary}` }}>
                  {classItem.scheduleDays || 'Chưa có lịch'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{classItem.room}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{classItem.year}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {classItem.startDate ? new Date(classItem.startDate).toLocaleDateString('vi-VN') : ''}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {classItem.endDate ? new Date(classItem.endDate).toLocaleDateString('vi-VN') : ''}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(classItem.status)}
                  color={getStatusColor(classItem.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={() => onViewDetails(classItem)}
                  color="primary"
                  title="Xem chi tiết"
                >
                  <ViewIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentMyClassesTable;

