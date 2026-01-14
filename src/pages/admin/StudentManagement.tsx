import React, { useState } from 'react';
import { Box, Typography, Button, Pagination } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { ConfirmDialog, NotificationSnackbar } from '@shared/components';
import { useStudentManagement, useStudentForm } from '@features/students';
import { StudentForm, StudentTable, StudentFilters, StudentViewDialog } from '@features/students';
import { Student } from '@shared/types';
import { getStudentByIdAPI } from '@features/students';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const StudentManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Custom hooks
  const {
    students,
    loading,
    loadingTable,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    fetchStudents,
    deleteStudent,
    handlePageChange,
  } = useStudentManagement();

  const {
    setFormData,
    resetForm,
  } = useStudentForm();

  // Dialog handlers
  const handleOpenDialog = async (student: Student | null = null): Promise<void> => {
    if (student?.id) {
      setSelectedStudent(student);
      setFormData(student || undefined);
      setOpenDialog(true);
      // Sau đó fetch dữ liệu mới nhất từ API
      try {
        const res = await getStudentByIdAPI(student.id);
        const payload: any = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        setSelectedStudent(payload);
        setFormData(payload || undefined);
      } catch (e) {
        // Giữ nguyên dữ liệu fallback nếu API fail
      }
    } else {
      setSelectedStudent(null);
      setFormData(undefined);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedStudent(null);
      resetForm();
    }, 100);
  };

  const handleOpenDeleteDialog = (student: Student): void => {
    setStudentToDelete(student);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = (): void => {
    setStudentToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteStudent = async (): Promise<void> => {
    if (!studentToDelete) return;

    const result = await deleteStudent(studentToDelete.id);

    if (result.success) {
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      handleCloseDeleteDialog();
    } else {
      setSnackbar({ open: true, message: result.message, severity: 'error' });
    }
  };

  const handleOpenViewDialog = (studentData: Student): void => {
    // Chỉ cần truyền ID và thông tin cơ bản để hiển thị loading
    setSelectedStudentForView({
      id: studentData.id,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      gender: studentData.gender,
      dayOfBirth: studentData.dayOfBirth,
      address: studentData.address,
      userId: studentData.userId,
      parentId: studentData.parentId,
      classes: studentData.classes,
      role: studentData.role as any,
    } as unknown as Student);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setSelectedStudentForView(null);
    setOpenViewDialog(false);
  };

  const handleCloseNotification = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý học sinh
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm học sinh
            </Button>
          </Box>

          <StudentFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <StudentTable
            students={students}
            loading={loadingTable}
            onEdit={(student: Student) => handleOpenDialog(student)}
            onDelete={(studentId: string) => {
              const student = students.find(s => s.id === studentId);
              if (student) handleOpenDeleteDialog(student);
            }}
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
        </Box>
      </Box>

      <StudentForm
        open={openDialog}
        onClose={handleCloseDialog}
        student={selectedStudent}
        onSubmit={(result) => {
          // Refresh student list
          fetchStudents();

          // Show notification
          setSnackbar({
            open: true,
            message: result.message || (result.success ? 'Thành công!' : 'Có lỗi xảy ra'),
            severity: result.success ? 'success' : 'error'
          });
        }}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteStudent}
        title="Xác nhận xóa học sinh"
        message={studentToDelete ? `Bạn có chắc chắn muốn xóa học sinh "${studentToDelete.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />

      <StudentViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        selectedStudent={selectedStudentForView as any}
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

export default StudentManagement;
