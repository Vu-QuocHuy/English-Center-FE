import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Pagination } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { ConfirmDialog, NotificationSnackbar } from '@shared/components';
import { ClassTable, ClassForm } from '@features/classes';
import { useClassManagement } from '@features/classes';
import { Class } from '@shared/types';
import { createClassAPI, updateClassAPI, deleteClassAPI } from '@features/classes';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ClassManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Custom hooks
  const {
    classes,
    loading,
    loadingTable,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    yearFilter,
    setYearFilter,
    gradeFilter,
    setGradeFilter,
    statusFilter,
    setStatusFilter,
    fetchClasses,
    handlePageChange,
  } = useClassManagement();

  // Dialog handlers
  const handleOpenDialog = useCallback((classItem: Class | null = null): void => {
    setSelectedClass(classItem);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback((): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedClass(null);
    }, 100);
  }, []);

  const handleOpenDeleteDialog = useCallback((classItem: Class): void => {
    setClassToDelete(classItem);
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback((): void => {
    setClassToDelete(null);
    setOpenDeleteDialog(false);
  }, []);

  const handleDeleteClass = useCallback(async (): Promise<void> => {
    if (!classToDelete) return;

    try {
      await deleteClassAPI(classToDelete.id);
      setSnackbar({ open: true, message: 'Xóa lớp học thành công!', severity: 'success' });
      handleCloseDeleteDialog();
      fetchClasses();
    } catch (error) {
      setSnackbar({ open: true, message: 'Có lỗi xảy ra khi xóa lớp học!', severity: 'error' });
    }
  }, [classToDelete, handleCloseDeleteDialog, fetchClasses]);

  const handleSubmitClass = useCallback(async (classData: any): Promise<void> => {
    try {
      if (selectedClass) {
        await updateClassAPI(selectedClass.id, classData);
        setSnackbar({ open: true, message: 'Cập nhật lớp học thành công!', severity: 'success' });
      } else {
        // Format data for API Create a class
        const apiData = {
          name: classData.name,
          grade: classData.grade,
          section: classData.section,
          year: classData.year,
          description: classData.description,
          feePerLesson: classData.feePerLesson,
          status: classData.status,
          max_student: classData.max_student,
          room: classData.room,
          schedule: {
            start_date: classData.schedule.start_date,
            end_date: classData.schedule.end_date,
            days_of_week: classData.schedule.days_of_week,
            time_slots: {
              start_time: classData.schedule.time_slots.start_time,
              end_time: classData.schedule.time_slots.end_time
            }
          }
        };

        await createClassAPI(apiData);
        setSnackbar({ open: true, message: 'Tạo lớp học thành công!', severity: 'success' });
      }
      handleCloseDialog();
      fetchClasses();
    } catch (error) {
      setSnackbar({
        open: true,
        message: selectedClass ? 'Có lỗi xảy ra khi cập nhật lớp học!' : 'Có lỗi xảy ra khi tạo lớp học!',
        severity: 'error'
      });
    }
  }, [selectedClass, handleCloseDialog, fetchClasses]);

  const handleCloseNotification = useCallback((): void => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý lớp học
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm lớp học
            </Button>
          </Box>

          {/* Search and Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo tên lớp học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Năm học"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Khối"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  select
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Tất cả</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Trạng thái"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  select
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="upcoming">Sắp mở</option>
                  <option value="closed">Đã kết thúc</option>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Class Table */}
          <ClassTable
            classes={classes}
            loading={loadingTable}
            onEdit={handleOpenDialog}
            onDelete={(classId: string) => {
              const classItem = classes.find(c => c.id === classId);
              if (classItem) handleOpenDeleteDialog(classItem);
            }}
            onViewDetails={(_classItem) => {}}
            onViewStudents={(_classItem) => {}}
            onViewSchedule={(_classItem) => {}}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_event, value) => handlePageChange(_event as React.SyntheticEvent, value)}
                size="large"
              />
            </Box>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteClass}
        title="Xác nhận xóa lớp học"
        message={classToDelete ? `Bạn có chắc chắn muốn xóa lớp học "${classToDelete.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />

      <ClassForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitClass}
        classItem={selectedClass}
        loading={loading}
      />

      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </DashboardLayout>
  );
};

export default ClassManagement;