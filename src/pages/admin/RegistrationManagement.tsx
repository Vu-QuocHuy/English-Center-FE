import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import {
} from '@mui/icons-material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import {
  getAllRegistrationsAPI,
  getRegistrationByIdAPI,
  updateRegistrationAPI,
  deleteRegistrationAPI
} from '@features/registrations';
import { NotificationSnackbar, ConfirmDialog } from '@shared/components';
import { RegistrationFilters, RegistrationTable, RegistrationViewDialog } from '@features/registrations';

interface RegistrationItem {
  id: string;
  name: string;
  email?: string;
  phone: string;
  gender?: 'male' | 'female';
  address?: string;
  note?: string;
  processed?: boolean;
  createdAt?: string;
  classId?: string;
  class?: {
    id: string;
    name: string;
  };
}

const RegistrationManagement: React.FC = () => {
  const [rows, setRows] = useState<RegistrationItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Filter states
  const [nameFilter, setNameFilter] = useState<string>('');
  const [processedFilter, setProcessedFilter] = useState<string>('');

  // Debounced filter states
  const [debouncedName, setDebouncedName] = useState<string>('');

  const [viewDialog, setViewDialog] = useState<{ open: boolean; data: RegistrationItem | null }>({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Debounce name filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(nameFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [nameFilter]);

  const fetchData = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      // Build filters object - only add fields that have values
      const filterOptions: Record<string, any> = {};

      if (debouncedName && debouncedName.trim() !== '') {
        filterOptions.name = debouncedName.trim();
      }

      if (processedFilter && processedFilter !== '') {
        if (processedFilter === 'processed') {
          filterOptions.processed = true;
        } else if (processedFilter === 'pending') {
          filterOptions.processed = false;
        }
      }

      const params: any = {
        page: pageNum,
        limit: 10
      };

      // Only add filters if at least one filter is set
      if (Object.keys(filterOptions).length > 0) {
        params.filters = filterOptions;
        console.log('🔍 Applying filters:', filterOptions);
      } else {
        console.log('🔍 No filters applied - fetching all registrations');
      }

      console.log('🔍 Final API params:', params);
      const res = await getAllRegistrationsAPI(params);

      const responseData = res.data?.data || res.data;
      const list = responseData?.result || responseData || [];
      const meta = responseData?.meta;

      setRows(list);
      setPage(meta?.page || pageNum);
      setTotalPages(meta?.totalPages || 1);

      console.log('📊 Fetched registrations:', list.length, 'Total pages:', meta?.totalPages);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setNotification({ open: true, message: 'Lỗi khi tải dữ liệu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [debouncedName, processedFilter]);

  // Fetch data when filters or page change
  useEffect(() => {
    fetchData(page);
  }, [page, debouncedName, processedFilter, fetchData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedName, processedFilter]);

  const handleMarkAsProcessed = async (id: string) => {
    try {
      await updateRegistrationAPI(id, { processed: true });
      setNotification({ open: true, message: 'Đã đánh dấu hoàn thành xử lý', severity: 'success' });
      fetchData(page); // Reload current page
    } catch (error) {
      console.error('Error updating registration:', error);
      setNotification({ open: true, message: 'Cập nhật thất bại', severity: 'error' });
    }
  };

  const handleView = async (id: string) => {
    try {
      const res = await getRegistrationByIdAPI(id);
      const data = res.data?.data || res.data;
      setViewDialog({ open: true, data });
    } catch (error) {
      console.error('Error fetching registration details:', error);
      setNotification({ open: true, message: 'Không thể tải thông tin', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteRegistrationAPI(deleteDialog.id);
      setNotification({ open: true, message: 'Xóa thành công', severity: 'success' });
      setDeleteDialog({ open: false, id: null });
      fetchData(page); // Reload current page
    } catch (error) {
      console.error('Error deleting registration:', error);
      setNotification({ open: true, message: 'Xóa thất bại', severity: 'error' });
    }
  };

  const handlePageChange = (_event: any, value: number) => {
    setPage(value);
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý đăng ký tư vấn
            </Typography>
          </Box>

          {/* Filters */}
          <RegistrationFilters
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            processedFilter={processedFilter}
            setProcessedFilter={setProcessedFilter}
          />

          <RegistrationTable
            rows={rows}
            loading={loading}
                  page={page}
            totalPages={totalPages}
            onView={handleView}
            onDelete={(id) => setDeleteDialog({ open: true, id })}
            onMarkAsProcessed={handleMarkAsProcessed}
            onPageChange={handlePageChange}
          />
        </Box>
      </Box>

      <RegistrationViewDialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, data: null })}
        registration={viewDialog.data as any}
        onMarkAsProcessed={(id) => {
          handleMarkAsProcessed(id);
                  setViewDialog({ open: false, data: null });
        }}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Xác nhận xóa đăng ký"
        message="Bạn có chắc chắn muốn xóa đăng ký này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmColor="error"
      />

      {/* Notification */}
      <NotificationSnackbar
        open={notification.open}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        message={notification.message}
        severity={notification.severity}
        title={notification.severity === 'success' ? 'Thành công' : 'Lỗi'}
        autoHideDuration={3000}
      />
    </DashboardLayout>
  );
};

export default RegistrationManagement;
