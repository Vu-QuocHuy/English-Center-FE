import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Staff } from '../../../types';
import BaseDialog from '../../common/BaseDialog';

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

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
        <Grid container spacing={3}>
          {/* Details */}
          <Grid item xs={12}>
            <Paper sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
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
                <PersonIcon sx={{ fontSize: 20 }} />
                Thông tin chi tiết
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Giới tính
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.gender === 'male' ? 'Nam' : 'Nữ'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.address}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ngày sinh
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(staff.dayOfBirth)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Vai trò
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {staff.role?.name || staff.role?.description || 'Chưa có vai trò'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </BaseDialog>
  );
};

export default StaffViewDialog;
