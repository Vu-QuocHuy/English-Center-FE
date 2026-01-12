import React, { useState } from 'react';
import { Box, Typography, Button, Pagination } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { useStaffManagement } from '../../hooks/features/useStaffManagement';
import { StaffTable, StaffForm, StaffFilters, StaffViewDialog } from '../../components/features/staff';
import { Staff } from '../../types';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const StaffManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [selectedStaffForView, setSelectedStaffForView] = useState<Staff | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Custom hooks
  const {
    staffs,
    loading,
    loadingTable,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    fetchStaffs,
    getStaffById,
    deleteStaff,
    handlePageChange,
  } = useStaffManagement();

  // Dialog handlers
  const handleOpenDialog = async (staff: Staff | null = null): Promise<void> => {
    if (staff?.id) {
      setSelectedStaff(staff);
      // Fetch latest data
      try {
        const latestStaff = await getStaffById(staff.id);
        if (latestStaff) {
          setSelectedStaff(latestStaff);
        }
      } catch (e) {
        // Keep original data if fetch fails
      }
    } else {
      setSelectedStaff(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedStaff(null);
    fetchStaffs(); // Refresh list
  };

  const handleOpenViewDialog = async (staff: Staff): Promise<void> => {
    setSelectedStaffForView(staff);
    // Fetch latest data
    try {
      const latestStaff = await getStaffById(staff.id);
      if (latestStaff) {
        setSelectedStaffForView(latestStaff);
      }
    } catch (e) {
      // Keep original data if fetch fails
    }
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = (): void => {
    setOpenViewDialog(false);
    setSelectedStaffForView(null);
  };

  const handleOpenDeleteDialog = (staff: Staff): void => {
    setStaffToDelete(staff);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = (): void => {
    setOpenDeleteDialog(false);
    setStaffToDelete(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (!staffToDelete) return;

    const result = await deleteStaff(staffToDelete.id);
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.success ? 'success' : 'error',
    });
    handleCloseDeleteDialog();
  };

  const handleFormSuccess = (): void => {
    setSnackbar({
      open: true,
      message: selectedStaff ? 'Cập nhật nhân viên thành công!' : 'Tạo nhân viên thành công!',
      severity: 'success',
    });
    // Reload staff list to show updated data
    fetchStaffs(page);
    handleCloseDialog();
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý nhân viên
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm nhân viên
            </Button>
          </Box>

          <StaffFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <StaffTable
            staffs={staffs}
            loading={loadingTable}
            onEdit={(staff: Staff) => handleOpenDialog(staff)}
            onDelete={(staff: Staff) => handleOpenDeleteDialog(staff)}
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

      <StaffForm
        open={openDialog}
        onClose={handleCloseDialog}
        staff={selectedStaff}
        onSuccess={handleFormSuccess}
      />

      <StaffViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        staff={selectedStaffForView}
        loading={loading}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${staffToDelete?.name}"? Hành động này không thể hoàn tác.`}
      />

      <NotificationSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </DashboardLayout>
  );
};

export default StaffManagement;
