import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '@shared/services';
import { updateTeacherAPI } from '@features/teachers';
import { validateUserUpdate } from '@shared/validations/common';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { AvatarUpload, ChangePasswordDialog } from '@shared/components';

interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  dayOfBirth: string;
}

interface TeacherUpdateData {
  description: string;
  qualifications: string[];
  specializations: string[];
  workExperience?: number | string;
}

interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  dayOfBirth?: string;
}

interface TeacherUpdateErrors {
  description?: string;
  qualifications?: string;
  specializations?: string;
  workExperience?: string;
}

const TeacherProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [userFormData, setUserFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    dayOfBirth: user?.dayOfBirth || '',
  });

  const [teacherFormData, setTeacherFormData] = useState<TeacherUpdateData>({
    description: user?.teacher?.description || '',
    qualifications: user?.teacher?.qualifications || [],
    specializations: user?.teacher?.specializations || [],
    workExperience: user?.teacher?.workExperience || undefined,
  });

  const [userErrors, setUserErrors] = useState<UserUpdateErrors>({});
  const [teacherErrors, setTeacherErrors] = useState<TeacherUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setUserFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
        dayOfBirth: user.dayOfBirth || '',
      });

      setTeacherFormData({
        description: user.teacher?.description || '',
        qualifications: user.teacher?.qualifications || [],
        specializations: user.teacher?.specializations || [],
        workExperience: user.teacher?.workExperience || undefined,
      });
    }
  }, [user]);

  const handleUserInputChange = (field: keyof UserUpdateData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (userErrors[field]) {
      setUserErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleTeacherInputChange = (field: keyof TeacherUpdateData, value: string | boolean | string[] | number | undefined | null) => {
    // Convert null to undefined
    const normalizedValue = value === null ? undefined : value;
    setTeacherFormData(prev => ({
      ...prev,
      [field]: normalizedValue as any,
    }));

    if (teacherErrors[field as keyof TeacherUpdateErrors]) {
      setTeacherErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleArrayInputChange = (field: 'qualifications' | 'specializations', value: string) => {
    // Split by comma or newline and filter empty strings
    const items = value.split(/[,\n]/).map(item => item.trim()).filter(item => item.length > 0);
    handleTeacherInputChange(field, items);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate user data
      const userValidationErrors = validateUserUpdate(userFormData);
      if (Object.keys(userValidationErrors).length > 0) {
        setUserErrors(userValidationErrors);
        return;
      }

      // Validate teacher data (only description is required in validation, but we allow all fields)
      const teacherValidationErrors: TeacherUpdateErrors = {};
      if (!teacherFormData.description || teacherFormData.description.trim() === '') {
        teacherValidationErrors.description = 'Mô tả không được để trống';
      }
      if (Object.keys(teacherValidationErrors).length > 0) {
        setTeacherErrors(teacherValidationErrors);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      // Update user data
      const userResponse = await updateUserAPI(user.id, userFormData);

      // Update teacher data if user update is successful
      if (userResponse.data && user.teacher?.id) {
        await updateTeacherAPI(user.teacher.id, {
          description: teacherFormData.description,
          qualifications: teacherFormData.qualifications,
          specializations: teacherFormData.specializations,
          workExperience: teacherFormData.workExperience 
            ? (typeof teacherFormData.workExperience === 'number' 
                ? String(teacherFormData.workExperience) 
                : teacherFormData.workExperience)
            : undefined,
        });
      }

      // Update local user data
      updateUser({
        ...user,
        ...userFormData,
        dayOfBirth: userFormData.dayOfBirth,
        gender: userFormData.gender as 'male' | 'female' | undefined,
        teacher: {
          ...user.teacher,
          description: teacherFormData.description,
          qualifications: teacherFormData.qualifications,
          specializations: teacherFormData.specializations,
          workExperience: teacherFormData.workExperience,
        } as any,
      });

      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUserFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: user?.address || '',
      dayOfBirth: user?.dayOfBirth || '',
    });

    setTeacherFormData({
      description: user?.teacher?.description || '',
      qualifications: user?.teacher?.qualifications || [],
      specializations: user?.teacher?.specializations || [],
      workExperience: user?.teacher?.workExperience || undefined,
    });

    setUserErrors({});
    setTeacherErrors({});
    setIsEditing(false);
  };



  if (!user) {
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
                          Họ và tên
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={userFormData.name}
                            onChange={(e) => handleUserInputChange('name', e.target.value)}
                            error={!!userErrors.name}
                            helperText={userErrors.name}
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
                            value={userFormData.phone}
                            onChange={(e) => handleUserInputChange('phone', e.target.value)}
                            error={!!userErrors.phone}
                            helperText={userErrors.phone}
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
                              value={userFormData.gender}
                              onChange={(e) => handleUserInputChange('gender', e.target.value)}
                              error={!!userErrors.gender}
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
                            {userFormData.gender === 'male'
                              ? 'Nam'
                              : userFormData.gender === 'female'
                              ? 'Nữ'
                              : 'Khác'}
                          </Typography>
                        )}
                      </Box>

                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Email
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            value={userFormData.email}
                            onChange={(e) => handleUserInputChange('email', e.target.value)}
                            error={!!userErrors.email}
                            helperText={userErrors.email}
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
                            value={userFormData.dayOfBirth}
                            onChange={(e) => handleUserInputChange('dayOfBirth', e.target.value)}
                            error={!!userErrors.dayOfBirth}
                            helperText={userErrors.dayOfBirth}
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
                            {userFormData.dayOfBirth
                              ? new Date(userFormData.dayOfBirth).toLocaleDateString('vi-VN')
                              : 'Chưa cập nhật'}
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
                            value={userFormData.address}
                            onChange={(e) => handleUserInputChange('address', e.target.value)}
                            error={!!userErrors.address}
                            helperText={userErrors.address}
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

                    </Grid>

                    {/* Teacher Specific Fields - 2 Columns */}
                    <Grid item xs={12} sm={6}>
                      {/* Mô tả */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Mô tả
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={teacherFormData.description}
                            onChange={(e) => handleTeacherInputChange('description', e.target.value)}
                            error={!!teacherErrors.description}
                            helperText={teacherErrors.description}
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
                            {user.teacher?.description || 'Chưa cập nhật'}
                          </Typography>
                        )}
                      </Box>

                      {/* Bằng cấp */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Bằng cấp
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={teacherFormData.qualifications.join(', ')}
                            onChange={(e) => handleArrayInputChange('qualifications', e.target.value)}
                            error={!!teacherErrors.qualifications}
                            helperText={teacherErrors.qualifications}
                            size="small"
                          />
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {teacherFormData.qualifications && teacherFormData.qualifications.length > 0 ? (
                              teacherFormData.qualifications.map((qual, index) => (
                                <Chip key={index} label={qual} size="small" variant="outlined" />
                              ))
                            ) : (
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  minHeight: '40px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                Chưa cập nhật
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      {/* Chuyên môn */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Chuyên môn
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={teacherFormData.specializations.join(', ')}
                            onChange={(e) => handleArrayInputChange('specializations', e.target.value)}
                            error={!!teacherErrors.specializations}
                            helperText={teacherErrors.specializations}
                            size="small"
                          />
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {teacherFormData.specializations && teacherFormData.specializations.length > 0 ? (
                              teacherFormData.specializations.map((spec, index) => (
                                <Chip key={index} label={spec} size="small" color="primary" variant="outlined" />
                              ))
                            ) : (
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  minHeight: '40px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                Chưa cập nhật
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Kinh nghiệm làm việc */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                          Kinh nghiệm làm việc
                        </Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={teacherFormData.workExperience || ''}
                            onChange={(e) => handleTeacherInputChange('workExperience', e.target.value)}
                            error={!!teacherErrors.workExperience}
                            helperText={teacherErrors.workExperience}
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
                            {teacherFormData.workExperience 
                              ? typeof teacherFormData.workExperience === 'number' 
                                ? `${teacherFormData.workExperience} năm`
                                : teacherFormData.workExperience
                              : 'Chưa cập nhật'}
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

export default TeacherProfile;
