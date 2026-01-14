import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, Pagination } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { ConfirmDialog, NotificationSnackbar } from '@shared/components';
import { useParentManagement } from '@features/parents';
import { ParentTable, ParentFilters, ParentViewDialog, ParentForm } from '@features/parents';
import { Parent } from '@shared/types';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ParentManagement: React.FC = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [selectedParentForView, setSelectedParentForView] = useState<Parent | null>(null);
  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [selectedParentForEdit, setSelectedParentForEdit] = useState<Parent | null>(null);

  // Custom hooks
  const {
    parents,
    loading,
    loadingTable,
    page,
    totalPages,
    searchQuery,
    setSearchQuery,
    deleteParent,
    getParentById,
    fetchParents,
    handlePageChange
  } = useParentManagement();
  // const { handleSubmit } = useParentForm();

  // Dialog handlers with useCallback
  const handleOpenDialog = useCallback(async (p: Parent | null = null): Promise<void> => {
    if (p?.id) {
      const fresh = await getParentById(p.id);
      setSelectedParentForEdit((fresh as any) || p);
    } else {
      setSelectedParentForEdit(null);
    }
    setOpenFormDialog(true);
  }, [getParentById]);

  const handleCloseFormDialog = useCallback((): void => {
    setOpenFormDialog(false);
    setTimeout(() => {
      setSelectedParentForEdit(null);
    }, 100);
  }, []);

  const handleOpenDeleteDialog = useCallback((parent: Parent): void => {
    setParentToDelete(parent);
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback((): void => {
    setParentToDelete(null);
    setOpenDeleteDialog(false);
  }, []);

  const handleDeleteParent = useCallback(async (): Promise<void> => {
    if (!parentToDelete) return;

    const result = await deleteParent(parentToDelete.id);

    if (result.success) {
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      handleCloseDeleteDialog();
    } else {
      setSnackbar({ open: true, message: result.message, severity: 'error' });
    }
  }, [parentToDelete, deleteParent, handleCloseDeleteDialog]);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý phụ huynh
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
            >
              Thêm phụ huynh
            </Button>
          </Box>

          <ParentFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <ParentTable
            parents={parents}
            loading={loadingTable}
            onEdit={handleOpenDialog}
            onDelete={(parentId: string) => {
              const parent = parents.find(p => p.id === parentId);
              if (parent) handleOpenDeleteDialog(parent);
            }}
            onViewDetails={(parent: Parent) => {
              setSelectedParentForView({ id: parent.id, name: parent.name, email: parent.email, phone: parent.phone } as Parent);
              setOpenViewDialog(true);
            }}
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
        onConfirm={handleDeleteParent}
        title="Xác nhận xóa phụ huynh"
        message={parentToDelete ? `Bạn có chắc chắn muốn xóa phụ huynh "${parentToDelete.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />

      <NotificationSnackbar
         open={snackbar.open}
         onClose={() => setSnackbar({ ...snackbar, open: false })}
         message={snackbar.message}
         severity={snackbar.severity}
       />

      <ParentViewDialog
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedParentForView(null);
        }}
        selectedParent={selectedParentForView}
      />

      <ParentForm
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        parent={selectedParentForEdit}
        loading={false}
        onMessage={(message: string, type: 'success' | 'error') => {
          setSnackbar({ open: true, message, severity: type });
          // Refresh danh sách phụ huynh sau khi có thay đổi
          if (type === 'success' && fetchParents) {
            fetchParents();
          }
        }}
        onSubmit={(result) => {
          fetchParents();

          // Show notification
          setSnackbar({
            open: true,
            message: result.message || (result.success ? 'Thành công!' : 'Có lỗi xảy ra'),
            severity: result.success ? 'success' : 'error'
          });
        }}
      />
    </DashboardLayout>
  );
};

export default ParentManagement;