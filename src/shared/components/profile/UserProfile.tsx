import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { AvatarUpload, ChangePasswordDialog, NotificationSnackbar } from '@shared/components';
import { useUserProfile } from '@shared/hooks/useUserProfile';

interface UserProfileProps {
  role: 'admin' | 'student' | 'parent' | 'staff';
  roleLabel?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ role, roleLabel }) => {
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
    user,
    isEditing,
    setIsEditing,
    loading,
    error,
    success,
    changePasswordOpen,
    setChangePasswordOpen,
    formData,
    errors,
    handleInputChange,
    handleSave,
    handleCancel,
  } = useUserProfile({ role });

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


  if (!user) {
    return (
      <DashboardLayout role={role}>
        <Box sx={commonStyles.pageContainer}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Trang cá nhân
            </Typography>
          </Box>

          <Grid container spacing={1.5}>
            {/* Left Panel - Profile Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{
                height: 'fit-content',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'visible'
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  {/* Profile Picture */}
                  <Box sx={{ mb: 3 }}>
                    <AvatarUpload
                      currentAvatar={user.avatar}
                      userName={user.name}
                      width={280}
                      height={380}
                      onAvatarUpdate={(newAvatarUrl) => {
                        // Avatar will be updated through the context
                        console.log('Avatar updated:', newAvatarUrl);
                      }}
                    />
                  </Box>

                  {/* User Name */}
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {user.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Panel - Profile Details */}
            <Grid item xs={12} md={8}>
              <Card sx={{
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={1.5}>
                    {/* Left Column */}
                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          mb: 0.75,
                          p: 0.75,
                          border: 'none',
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                          Email
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          error={!!errors.email}
                          helperText={errors.email}
                          size="small"
                          type="email"
                          InputProps={{
                            readOnly: !isEditing
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: isEditing ? 'white' : '#f5f5f5',
                              height: '40px',
                              '&.Mui-readOnly': {
                                cursor: 'default'
                              }
                            }
                          }}
                        />
                      </Paper>

                      <Paper 
                        elevation={0}
                        sx={{ 
                          mb: 0.75,
                          p: 0.75,
                          border: 'none',
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                          Ngày sinh
                        </Typography>
                        <TextField
                          fullWidth
                          type="date"
                          value={formData.dayOfBirth}
                          onChange={(e) => handleInputChange('dayOfBirth', e.target.value)}
                          error={!!errors.dayOfBirth}
                          helperText={errors.dayOfBirth}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            readOnly: !isEditing
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: isEditing ? 'white' : '#f5f5f5',
                              height: '40px',
                              '&.Mui-readOnly': {
                                cursor: 'default'
                              }
                            }
                          }}
                        />
                      </Paper>

                      <Paper 
                        elevation={0}
                        sx={{ 
                          mb: 0.75,
                          p: 0.75,
                          border: 'none',
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                          Địa chỉ
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData.address || 'Chưa cập nhật'}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          error={!!errors.address}
                          helperText={errors.address}
                          size="small"
                          InputProps={{
                            readOnly: !isEditing
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: isEditing ? 'white' : '#f5f5f5',
                              height: '40px',
                              '&.Mui-readOnly': {
                                cursor: 'default'
                              }
                            }
                          }}
                        />
                      </Paper>

                      {roleLabel && (
                        <Paper 
                          elevation={0}
                          sx={{ 
                            mb: 0.75,
                            p: 0.75,
                            border: 'none',
                            borderRadius: 2,
                            bgcolor: 'transparent',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                            Vai trò
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            minHeight: '40px'
                          }}>
                            <Chip
                              label={roleLabel}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        </Paper>
                      )}

                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          mb: 0.75,
                          p: 0.75,
                          border: 'none',
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                          Họ và tên
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          error={!!errors.name}
                          helperText={errors.name}
                          size="small"
                          InputProps={{
                            readOnly: !isEditing
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: isEditing ? 'white' : '#f5f5f5',
                              height: '40px',
                              '&.Mui-readOnly': {
                                cursor: 'default'
                              }
                            }
                          }}
                        />
                      </Paper>

                      <Paper 
                        elevation={0}
                        sx={{ 
                          mb: 0.75,
                          p: 0.75,
                          border: 'none',
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                          Số điện thoại
                        </Typography>
                        <TextField
                          fullWidth
                          value={formData.phone || 'Chưa cập nhật'}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          size="small"
                          InputProps={{
                            readOnly: !isEditing
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: isEditing ? 'white' : '#f5f5f5',
                              height: '40px',
                              '&.Mui-readOnly': {
                                cursor: 'default'
                              }
                            }
                          }}
                        />
                      </Paper>

                      <Paper 
                        elevation={0}
                        sx={{ 
                          mb: 0.75,
                          p: 0.75,
                          border: 'none',
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.75rem' }}>
                          Giới tính
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ height: '40px' }}>
                          <Select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            error={!!errors.gender}
                            disabled={!isEditing}
                            sx={{
                              height: '40px',
                              bgcolor: isEditing ? 'white' : '#f5f5f5'
                            }}
                          >
                            <MenuItem value="male">Nam</MenuItem>
                            <MenuItem value="female">Nữ</MenuItem>
                            <MenuItem value="other">Khác</MenuItem>
                          </Select>
                        </FormControl>
                      </Paper>
                    </Grid>
                  </Grid>

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
                          disabled={loading}
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
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          onClick={handleSave}
                          disabled={loading}
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
                          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
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

export default UserProfile;