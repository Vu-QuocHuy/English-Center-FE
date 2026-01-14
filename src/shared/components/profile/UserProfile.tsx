import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { AvatarUpload, ChangePasswordDialog } from '@shared/components';
import { useUserProfile } from '@shared/hooks/useUserProfile';

interface UserProfileProps {
  role: 'admin' | 'student' | 'parent' | 'staff';
  roleLabel?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ role, roleLabel }) => {
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
  } = useUserProfile();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Get dayOfBirth from user or nested objects
  const getDayOfBirth = () => {
    return user?.dayOfBirth || (user as any)?.student?.dayOfBirth || (user as any)?.parent?.dayOfBirth || '';
  };

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

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
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
                      size={200}
                      onAvatarUpdate={(newAvatarUrl) => {
                        // Avatar will be updated through the context
                        console.log('Avatar updated:', newAvatarUrl);
                      }}
                    />
                  </Box>

                  {/* User Name */}
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
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
                  <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Email
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                            size="small"
                            type="email"
                          />
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {user.email}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Ngày sinh
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            type="date"
                            value={formData.dayOfBirth}
                            onChange={(e) => handleInputChange('dayOfBirth', e.target.value)}
                            error={!!errors.dayOfBirth}
                            helperText={errors.dayOfBirth}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {formatDate(getDayOfBirth())}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Địa chỉ
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            error={!!errors.address}
                            helperText={errors.address}
                            size="small"
                          />
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {user.address || 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      {roleLabel && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Vai trò
                          </Typography>
                          <Chip
                            label={roleLabel}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      )}

                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Họ và tên
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            size="small"
                          />
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {user.name}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Số điện thoại
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            size="small"
                          />
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {user.phone || 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Giới tính
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={formData.gender}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              error={!!errors.gender}
                            >
                              <MenuItem value="male">Nam</MenuItem>
                              <MenuItem value="female">Nữ</MenuItem>
                              <MenuItem value="other">Khác</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Typography>
                        )}
                      </Box>
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
    </DashboardLayout>
  );
};

export default UserProfile;