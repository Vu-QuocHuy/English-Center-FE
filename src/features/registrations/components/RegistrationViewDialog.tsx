import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Button } from '@mui/material';
import { Visibility as ViewIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { BaseDialog } from '@shared/components';

export interface RegistrationDetail {
  id: string;
  name: string;
  email?: string;
  phone: string;
  gender?: 'male' | 'female';
  address?: string;
  note?: string;
  processed?: boolean;
  createdAt?: string;
  class?: {
    id: string;
    name: string;
  };
}

interface RegistrationViewDialogProps {
  open: boolean;
  onClose: () => void;
  registration: RegistrationDetail | null;
  onMarkAsProcessed: (id: string) => void;
}

const RegistrationViewDialog: React.FC<RegistrationViewDialogProps> = ({
  open,
  onClose,
  registration,
  onMarkAsProcessed,
}) => {
  if (!registration) return null;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết đăng ký tư vấn"
      subtitle="Thông tin chi tiết về đăng ký tư vấn"
      icon={<ViewIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      fullWidth
      contentPadding={0}
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, flex: 1, justifyContent: 'flex-end' }}>
          {!registration.processed && (
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckIcon />}
              onClick={() => {
                onMarkAsProcessed(registration.id);
                onClose();
              }}
              sx={{
                fontWeight: 700,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                },
              }}
            >
              Đánh dấu đã xử lý
            </Button>
          )}
          <Button
            variant="outlined"
            size="large"
            onClick={onClose}
            sx={{
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            Đóng
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 4 }}>
        <Box>
          <Grid container spacing={3}>
            {/* Thông tin cá nhân */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2,
                    }}
                  />
                  Thông tin cá nhân
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {registration.name || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                        {registration.email || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1">
                        {registration.phone || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Giới tính
                      </Typography>
                      <Typography variant="body1">
                        {registration.gender === 'male'
                          ? 'Nam'
                          : registration.gender === 'female'
                          ? 'Nữ'
                          : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1">
                        {registration.address || '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            {/* Thông tin đăng ký */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2,
                    }}
                  />
                  Thông tin đăng ký
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Lớp học
                      </Typography>
                      <Typography variant="body1">
                        {registration.class?.name || 'Tư vấn chung'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Thời gian đăng ký
                      </Typography>
                      <Typography variant="body1">
                        {registration.createdAt
                          ? new Date(registration.createdAt).toLocaleString('vi-VN')
                          : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Ghi chú từ khách hàng
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: 'pre-line' }}
                      >
                        {registration.note || 'Không có ghi chú'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Trạng thái xử lý
                      </Typography>
                      <Chip
                        label={registration.processed ? 'Đã xử lý' : 'Chưa xử lý'}
                        color={registration.processed ? 'success' : 'warning'}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 999,
                          px: 1.5,
                          mt: 0.5,
                          '& .MuiChip-label': {
                            px: 0.5,
                          },
                        }}
                      />
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

export default RegistrationViewDialog;

