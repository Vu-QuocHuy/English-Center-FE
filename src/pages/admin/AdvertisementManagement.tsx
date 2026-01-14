import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import {
  getAdvertisementsAPI,
  createAdvertisementAPI,
  updateAdvertisementAPI,
  deleteAdvertisementAPI,
  getAdvertisementByIdAPI,
} from '@features/advertisements';
import { deleteFileAPI } from '@shared/services';
import { NotificationSnackbar, ConfirmDialog } from '@shared/components';
import { AdvertisementManagementForm, AdvertisementManagementTable } from '@features/advertisements';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'banner' | 'popup' | 'notification';
  priority: number;
  publicId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  class?: {
    id: string;
    name: string;
    grade: number;
    section: number;
    year: number;
    status: string;
  } | null;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const AdvertisementManagement: React.FC = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [originalPublicId, setOriginalPublicId] = useState<string | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Lấy danh sách quảng cáo từ API
  useEffect(() => {
    fetchAdvertisements();
  }, [page]);

  const fetchAdvertisements = async (): Promise<void> => {
    try {
      const res = await getAdvertisementsAPI({ page, limit });
      const list = res.data?.data?.result || [];
      setAdvertisements(
        list.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          type: (item.type as 'banner' | 'popup' | 'notification') || 'banner',
          priority: Number(item.priority) ?? 0,
          publicId: item.publicId || (item as any).public_id || (item as any).imagePublicId || (item as any).image_public_id,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          class: item.class ? {
            id: item.class.id,
            name: item.class.name,
            grade: item.class.grade,
            section: item.class.section,
            year: item.class.year,
            status: item.class.status,
          } : null,
        }))
      );
      setTotalPages(res.data?.data?.meta?.totalPages || 1);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách quảng cáo',
        severity: 'error'
      });
      setAdvertisements([]);
    }
  };

  const handleOpenDialog = (ad: Advertisement | null = null): void => {
    setEditingAd(ad);
    if (ad) {
      (async () => {
        try {
          const detail = await getAdvertisementByIdAPI(ad.id);
          const data = (detail as any)?.data?.data;
          if (data) {
            setOriginalPublicId(
              data.publicId || (data as any).public_id || (data as any).imagePublicId || (data as any).image_public_id
            );
          }
        } catch (_e) {}
      })();
    } else {
      setOriginalPublicId(undefined);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setTimeout(() => {
      setEditingAd(null);
      setOriginalPublicId(undefined);
    }, 100);
  };

  const handleCloseNotification = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSaveAd = async (data: {
    title: string;
    description: string;
    type: 'banner' | 'popup' | 'notification';
    priority: number;
    imageUrl?: string;
    publicId?: string;
    classId?: string;
  }): Promise<void> => {
    try {
      if (editingAd) {
        const previousPublicId = originalPublicId;
        await updateAdvertisementAPI(editingAd.id, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          imageUrl: data.imageUrl,
          publicId: data.publicId,
          type: data.type,
          classId: data.classId,
        });
        // If a new image was uploaded in this session, delete old file when it changes
        if (previousPublicId && data.publicId && data.publicId !== previousPublicId) {
          try {
            await deleteFileAPI(previousPublicId);
            console.log('Old file deleted successfully:', previousPublicId);
          } catch (fileError) {
            console.error('Error deleting old file:', fileError);
            // Don't show error to user if file deletion fails
          }
        }
        setSnackbar({ open: true, message: 'Cập nhật quảng cáo thành công!', severity: 'success' });
      } else {
        await createAdvertisementAPI({
          title: data.title,
          description: data.description,
          priority: data.priority,
          imageUrl: data.imageUrl || '',
          publicId: data.publicId || '',
          classId: data.classId || '',
          type: data.type,
        });
        setSnackbar({ open: true, message: 'Tạo quảng cáo thành công!', severity: 'success' });
      }
      fetchAdvertisements();
      handleCloseDialog();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi khi lưu quảng cáo!',
        severity: 'error'
      });
      throw err; // Re-throw to let form handle error
    }
  };

  const handleDeleteAd = (id: string): void => {
    setAdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!adToDelete) return;
    
    setDeleteLoading(true);
    try {
      // Find the advertisement to get its publicId
      const advertisement = advertisements.find(ad => ad.id === adToDelete);

      // Delete the advertisement first
      await deleteAdvertisementAPI(adToDelete);

      // If advertisement has publicId, delete the file
      if (advertisement?.publicId) {
        try {
          await deleteFileAPI(advertisement.publicId);
          console.log('File deleted successfully:', advertisement.publicId);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Don't show error to user if file deletion fails, as advertisement is already deleted
        }
      }

      setSnackbar({ open: true, message: 'Xóa quảng cáo thành công!', severity: 'success' });
      fetchAdvertisements();
      setDeleteDialogOpen(false);
      setAdToDelete(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi khi xóa quảng cáo!',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false);
    setAdToDelete(null);
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Quản lý Quảng cáo
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Tạo quảng cáo mới
            </Button>
          </Box>

          {/* Advertisements Table */}
          <Card>
            <CardContent>
              <AdvertisementManagementTable
                advertisements={advertisements}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteAd}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </CardContent>
          </Card>

          {/* Create/Edit Dialog */}
          <AdvertisementManagementForm
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSaveAd}
            advertisement={editingAd}
          />

          <NotificationSnackbar
            open={snackbar.open}
            onClose={handleCloseNotification}
            message={snackbar.message}
            severity={snackbar.severity}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title="Xác nhận xóa"
            message={`Bạn có chắc chắn muốn xóa quảng cáo này? Hành động này không thể hoàn tác.`}
            confirmText="Xóa"
            confirmColor="error"
            loading={deleteLoading}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AdvertisementManagement;