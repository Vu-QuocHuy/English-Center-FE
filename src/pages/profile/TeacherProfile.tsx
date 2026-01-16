import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTeacherProfile, TeacherProfileForm, TeacherProfileSummary } from '@features/teachers';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { ChangePasswordDialog, NotificationSnackbar } from '@shared/components';

const TeacherProfile: React.FC = () => {
  const { user } = useAuth();
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const {
    isEditing,
    error,
    success,
    changePasswordOpen,
    form,
    formErrors,
    formLoading,
    loading,
    setIsEditing,
    setChangePasswordOpen,
    handleSave,
    handleCancel,
    getFormValue,
    handleInputChange,
  } = useTeacherProfile();

  // Show snackbar when error or success changes
  React.useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error',
      });
    }
  }, [error]);

  React.useEffect(() => {
    if (success) {
      setSnackbar({
        open: true,
        message: success,
        severity: 'success',
      });
    }
  }, [success]);

  if (!user || loading) {
    return (
      <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
        <CircularProgress />
      </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
    <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Trang cá nhân
        </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Left Panel - Profile Summary */}
            <Grid item xs={12} md={4}>
              <TeacherProfileSummary
                avatar={user.avatar}
                userName={user.name}
              />
            </Grid>

            {/* Right Panel - Profile Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <TeacherProfileForm
                    form={form}
                    formErrors={formErrors}
                    isEditing={isEditing}
                    getFormValue={getFormValue}
                    handleInputChange={handleInputChange}
                  />

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setChangePasswordOpen(true)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                          borderColor: '#2563eb',
                          bgcolor: '#eff6ff'
                        }
                      }}
                    >
                      Đổi mật khẩu
                    </Button>

                    {!isEditing ? (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          bgcolor: '#3b82f6',
                          '&:hover': {
                            bgcolor: '#2563eb'
                          }
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={formLoading}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            borderColor: '#64748b',
                            color: '#64748b',
                            '&:hover': {
                              borderColor: '#475569',
                              bgcolor: '#f1f5f9'
                            }
                          }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  startIcon={formLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={formLoading}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            bgcolor: '#3b82f6',
                            '&:hover': {
                              bgcolor: '#2563eb'
                            }
                          }}
                >
                  {formLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            )}
                  </Box>
          </CardContent>
        </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </DashboardLayout>
  );
};

export default TeacherProfile;
