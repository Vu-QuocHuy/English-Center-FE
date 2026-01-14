import React, { useState } from 'react';
import {
  Button,
  TextField,
  IconButton,
  Box,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { changePasswordAPI } from '@shared/services';
import { validateChangePassword, type ChangePasswordData, type ChangePasswordErrors } from '@shared/validations/common';
import NotificationSnackbar from './NotificationSnackbar';
import BaseDialog from './BaseDialog';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ChangePasswordData>({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const handleInputChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData((prev: ChangePasswordData) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: ChangePasswordErrors) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleTogglePasswordVisibility = (field: 'current' | 'newPassword' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate form data
      const validationErrors = validateChangePassword(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Call API
      await changePasswordAPI(
        formData.current,
        formData.newPassword,
        formData.confirm
      );

      // Reset form
      setFormData({
        current: '',
        newPassword: '',
        confirm: '',
      });
      setErrors({});

      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'Đổi mật khẩu thành công!',
        severity: 'success',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog after a short delay to allow snackbar to show
      setTimeout(() => {
        handleClose();
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        current: '',
        newPassword: '',
        confirm: '',
      });
      setErrors({});
      setError('');
      onClose();
    }
  };

  return (
    <>
      <BaseDialog
      open={open}
      onClose={handleClose}
        title="Đổi mật khẩu"
        subtitle="Vui lòng nhập thông tin để đổi mật khẩu"
        icon={<LockIcon sx={{ fontSize: 28, color: 'white' }} />}
        maxWidth="xs"
      fullWidth
        loading={loading}
        error={error}
        showCloseButton={!loading}
        contentPadding={3}
        actions={
          <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              variant="outlined"
        sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
        }}
      >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
            sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
            }}
          >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </Box>
        }
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <TextField
            fullWidth
            label="Mật khẩu hiện tại"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.current}
            onChange={(e) => handleInputChange('current', e.target.value)}
            error={!!errors.current}
            helperText={errors.current}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('current')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Mật khẩu mới"
            type={showPasswords.newPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('newPassword')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Xác nhận mật khẩu mới"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirm}
            onChange={(e) => handleInputChange('confirm', e.target.value)}
            error={!!errors.confirm}
            helperText={errors.confirm}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('confirm')}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </BaseDialog>

    <NotificationSnackbar
      open={snackbar.open}
      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      message={snackbar.message}
      severity={snackbar.severity}
    />
    </>
  );
};

export default ChangePasswordDialog;
