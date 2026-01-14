import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Alert,
  ListItemIcon,
  ListItemText,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Class } from '@shared/types';
import { getClassByIdAPI } from '../services/classes.api';
import { ConfirmDialog } from '@shared/components';
import ClassDetailsModal from './ClassDetailsModal';
import ClassStudentsModal from './ClassStudentsModal';
import ClassScheduleModal from './ClassScheduleModal';
import { getClassStatusText, getClassStatusColor, getDaysOfWeekText } from '@features/classes';

interface ClassTableProps {
  classes: Class[];
  onEdit: (classItem: Class) => void;
  onDelete: (classId: string) => void;
  onViewDetails: (classItem: Class) => void;
  onViewStudents: (classItem: Class) => void;
  onViewSchedule: (classItem: Class) => void;
  loading?: boolean;
}

const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  onEdit,
  onDelete,
  onViewStudents,
  onViewSchedule,
  loading = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const openDetailsWithData = (data: any) => {
    // Normalize response structure: prefer data.data if exists
    const classData = data?.data?.data ?? data?.data ?? data;
    setSelectedClass(classData as Class);
    setDetailsModalOpen(true);
  };

  const fetchAndOpenDetails = async (classItem: Class) => {
    try {
      const res = await getClassByIdAPI(classItem.id);
      openDetailsWithData(res);
    } catch (e) {
      // Fallback: show existing item if fetch fails
      setSelectedClass(classItem);
      setDetailsModalOpen(true);
    }
  };

  const handleViewDetails = () => {
    if (selectedClass) {
      fetchAndOpenDetails(selectedClass);
    }
    handleMenuClose();
  };

  const handleViewStudents = () => {
    if (selectedClass) {
      onViewStudents(selectedClass);
      setStudentsModalOpen(true);
    }
    handleMenuClose();
  };

  const handleViewSchedule = () => {
    if (selectedClass) {
      onViewSchedule(selectedClass);
      setScheduleModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedClass) {
      onEdit(selectedClass);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedClass) {
      setClassToDelete(selectedClass);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (classToDelete) {
      try {
        await onDelete(classToDelete.id);
        setSnackbar({
          open: true,
          message: 'Xóa lớp học thành công',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra khi xóa lớp học',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Typography color="text.secondary" variant="h6">
          {loading ? 'Đang tải...' : 'Không có lớp học nào'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Tên lớp</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Giáo viên</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Năm học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Học phí mỗi buổi</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Lịch học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Phòng học</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id} hover>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {classItem.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {classItem.teacher?.email || classItem.teacher?.userId?.email || ''}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {classItem.year}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {classItem.feePerLesson?.toLocaleString('vi-VN')} VNĐ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {classItem.schedule?.days_of_week?.length > 0
                        ? getDaysOfWeekText(classItem.schedule.days_of_week)
                        : 'Chưa có lịch'
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {classItem.schedule?.time_slots
                        ? `${classItem.schedule.time_slots.start_time} - ${classItem.schedule.time_slots.end_time}`
                        : 'Chưa có thời gian'
                      }
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {classItem.room}
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
                      color: getClassStatusColor(classItem.status),
                      border: `1px solid ${getClassStatusColor(classItem.status)}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {getClassStatusText(classItem.status)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => fetchAndOpenDetails(classItem)}
                      sx={{ color: 'grey.600' }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(classItem)}
                      sx={{ color: 'grey.600' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewStudents}>
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem học sinh</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewSchedule}>
          <ListItemIcon>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem lịch học</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Class Details Modal */}
      <ClassDetailsModal
        classItem={selectedClass}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Class Students Modal */}
      <ClassStudentsModal
        classItem={selectedClass}
        open={studentsModalOpen}
        onClose={() => setStudentsModalOpen(false)}
      />

      {/* Class Schedule Modal */}
      <ClassScheduleModal
        classItem={selectedClass}
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa lớp học "${classToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmColor="error"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ClassTable;
