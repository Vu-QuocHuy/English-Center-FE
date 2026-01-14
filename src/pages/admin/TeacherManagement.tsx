import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { COLORS } from "@shared/utils";
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import { StatCard, ConfirmDialog, NotificationSnackbar } from '@shared/components';
import { Teacher } from '@shared/types';
import { useTeacherManagement, useTeacherForm } from '@features/teachers';
import { TeacherForm, TeacherTable, TeacherFilters, TeacherViewDialog } from '@features/teachers';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface Summary {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  totalSalary: number;
}

const TeacherManagement: React.FC = () => {
  // Teacher management hook
  const {
    teachers,
    selectedTeacher: teacherDetail,
    loading,
    loadingDetail,
    totalRecords,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    isActiveFilter,
    setIsActiveFilter,
    fetchTeachers,
    getTeacherById,
    deleteTeacher,
    handlePageChange
  } = useTeacherManagement();

  // Teacher form hook
  const {
    form,
    loading: formLoading,
    setFormData,
    resetForm,
    handleSubmit
  } = useTeacherForm();

  // Local state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Dialog handlers
  const handleOpenDialog = async (teacher: Teacher | null = null): Promise<void> => {
    if (teacher) {
      // Gọi API để lấy thông tin chi tiết khi chỉnh sửa
      const detailData = await getTeacherById(teacher.id);
      setSelectedTeacher(teacher);

      // Sử dụng dữ liệu từ API response để set form
      if (detailData) {
        // Map API response to form structure (sử dụng type assertion vì form cần structure cũ)
        const formData = {
          id: detailData.id,
          userId: {
            id: detailData.id,
            name: detailData.name,
            email: detailData.email,
            phone: detailData.phone,
            gender: detailData.gender,
            dayOfBirth: detailData.dayOfBirth,
            address: detailData.address,
            role: 'teacher' as const,
            avatar: detailData.avatar || undefined,
          },
          isActive: detailData.isActive,
          description: detailData.description,
          qualifications: detailData.qualifications,
          specializations: detailData.specializations,
          salary: detailData.salary,
          salaryPerLesson: (detailData as any).salaryPerLesson || detailData.salary,
          workExperience: detailData.workExperience,
          introduction: (detailData as any).introduction || '',
          typical: (detailData as any).typical || false,
        } as Teacher;
        setFormData(formData);
      } else {
        setFormData(teacher);
      }
    } else {
      // Tạo mới teacher
      setSelectedTeacher(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedTeacher(null);
      resetForm();
    }, 100);
  };

  const handleOpenViewDialog = async (teacherData: Teacher): Promise<void> => {
    await getTeacherById(teacherData.id);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setOpenViewDialog(false);
  };

  const handleCloseDeleteDialog = (): void => {
    setTeacherToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleOpenDeleteDialog = (teacher: Teacher): void => {
    setTeacherToDelete(teacher);
    setOpenDeleteDialog(true);
  };

  // Action handlers
  const handleFormSubmit = async (): Promise<void> => {
    const result = await handleSubmit(selectedTeacher || undefined, () => {
      handleCloseDialog();
      if (fetchTeachers) {
        fetchTeachers();
      }
    });

    if (result.success) {
      setSnackbar({ open: true, message: result.message || 'Thành công', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: result.message || 'Có lỗi xảy ra', severity: 'error' });
    }
  };

  const handleDeleteTeacher = async (): Promise<void> => {
    if (!teacherToDelete || !deleteTeacher) return;

    const result = await deleteTeacher(teacherToDelete.id);

    if (result.success) {
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      handleCloseDeleteDialog();
    } else {
      setSnackbar({ open: true, message: result.message, severity: 'error' });
    }
  };

  // Calculate summary
  const summary: Summary = {
    totalTeachers: totalRecords,
    activeTeachers: teachers?.filter((t: any) => t.isActive).length || 0,
    inactiveTeachers: teachers?.filter((t: any) => !t.isActive).length || 0,
    totalSalary: teachers?.reduce((sum: number, t: any) => sum + (t.salaryPerLesson || 0), 0) || 0
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box>
            <Box sx={commonStyles.pageHeader}>
              <Typography sx={commonStyles.pageTitle}>
                Quản lý giáo viên
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ bgcolor: COLORS.primary.main }}
              >
                Thêm giáo viên
              </Button>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Tổng giáo viên"
                  value={summary.totalTeachers}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Đang hoạt động"
                  value={summary.activeTeachers}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Ngừng hoạt động"
                  value={summary.inactiveTeachers}
                  color="error"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Tổng lương"
                  value={new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(summary.totalSalary)}
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* Filters */}
            <TeacherFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isActiveFilter={isActiveFilter || ''}
              setIsActiveFilter={setIsActiveFilter || (() => {})}
            />

            {/* Table */}
            <TeacherTable
              teachers={teachers}
              loading={loading}
              onEdit={handleOpenDialog}
              onDelete={handleOpenDeleteDialog}
              onViewDetails={handleOpenViewDialog}
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

            {/* Dialogs */}
            <TeacherForm
              open={openDialog}
              onClose={handleCloseDialog}
              teacher={form as any}
              onSubmit={handleFormSubmit}
              loading={formLoading || loadingDetail}
            />

            <TeacherViewDialog
              open={openViewDialog}
              onClose={handleCloseViewDialog}
              teacher={teacherDetail}
              loading={loadingDetail}
            />

            <ConfirmDialog
              open={openDeleteDialog}
              onClose={handleCloseDeleteDialog}
              onConfirm={handleDeleteTeacher}
              title="Xác nhận xóa giáo viên"
              message={teacherToDelete ? `Bạn có chắc chắn muốn xóa giáo viên "${teacherToDelete.name}"? Hành động này không thể hoàn tác.` : ''}
              loading={loading}
            />

            <NotificationSnackbar
              open={snackbar.open}
              message={snackbar.message}
              severity={snackbar.severity}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherManagement;
