import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import {
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { Staff } from '@shared/types';
import { BaseDialog } from '@shared/components';
import { formatDateDDMMYYYY } from '@features/teachers';

interface StaffViewDialogProps {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
  loading?: boolean;
}

const StaffViewDialog: React.FC<StaffViewDialogProps> = ({
  open,
  onClose,
  staff,
  loading = false,
}) => {
  if (!staff) return null;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết nhân viên"
      subtitle="Thông tin chi tiết về nhân viên"
      icon={<ViewIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      loading={loading}
      minHeight="60vh"
      contentPadding={0}
    >
      <Box sx={{ p: 4 }}>
        <Box>
          {/* Main Information Grid */}
        <Grid container spacing={3}>
            {/* Personal Info - Full width with 2-column layout inside */}
          <Grid item xs={12}>
            <Paper sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              border: '1px solid #e0e6ed',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="h6" gutterBottom sx={{
                color: '#2c3e50',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2
              }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    bgcolor: '#667eea',
                    borderRadius: 2
                  }} />
                  Thông tin cá nhân
              </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: '1px solid #e0e6ed'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {staff.email || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1">
                        {staff.phone || 'N/A'}
                      </Typography>
                    </Grid>
                <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1">
                        {staff.address || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Ngày sinh
                      </Typography>
                      <Typography variant="body1">
                        {staff.dayOfBirth ?
                          formatDateDDMMYYYY(String(staff.dayOfBirth))
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Giới tính
                      </Typography>
                      <Typography variant="body1">
                        {staff.gender === 'male' ? 'Nam' :
                         staff.gender === 'female' ? 'Nữ' : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Vai trò
                      </Typography>
                      <Typography variant="body1">
                        {staff.role?.name || staff.role?.description || 'Chưa có vai trò'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
            </Paper>
          </Grid>
        </Grid>
        </Box>
      </Box>
    </BaseDialog>
  );
};

export default StaffViewDialog;
