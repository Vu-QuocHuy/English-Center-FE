import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { Teacher } from '@shared/types';
import { BaseDialog } from '@shared/components';

interface TeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (teacherData: Partial<Teacher>) => Promise<void>;
  teacher?: Teacher | null;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: 'male' | 'female';
  dayOfBirth: string;
  description: string;
  qualifications: string;
  specializations: string;
  introduction: string;
  workExperience: string;
  salaryPerLesson: string;
  isActive: boolean;
  typical: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  description?: string;
  qualifications?: string;
  specializations?: string;
  introduction?: string;
  workExperience?: string;
  salaryPerLesson?: string;
  isActive?: boolean;
  typical?: string;
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  open,
  onClose,
  onSubmit,
  teacher,
  loading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    gender: 'male',
    dayOfBirth: '',
    description: '',
    qualifications: '',
    specializations: '',
    introduction: '',
    workExperience: '',
    salaryPerLesson: '',
    isActive: true,
    typical: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Chỉ coi là chế độ chỉnh sửa khi có teacher và có id
    if (teacher && (teacher as any)?.id) {
      setFormData({
        name: teacher.name || (teacher as any)?.userId?.name || '',
        email: teacher.email || (teacher as any)?.userId?.email || '',
        password: '', // Không hiển thị password khi edit
        phone: teacher.phone || (teacher as any)?.userId?.phone || '',
        address: teacher.address || (teacher as any)?.userId?.address || '',
        gender: (teacher.gender as 'male' | 'female') || ((teacher as any)?.userId?.gender as 'male' | 'female') || 'male',
        dayOfBirth: teacher.dayOfBirth
          ? new Date(teacher.dayOfBirth as any).toISOString().split('T')[0]
          : (teacher as any)?.userId?.dayOfBirth
          ? new Date((teacher as any).userId.dayOfBirth).toISOString().split('T')[0]
          : '',
        description: (teacher as any)?.description || '',
        qualifications: Array.isArray((teacher as any)?.qualifications)
          ? (teacher as any)?.qualifications.join(', ')
          : (teacher as any)?.qualifications || '',
        specializations: Array.isArray((teacher as any)?.specializations)
          ? (teacher as any)?.specializations.join(', ')
          : (teacher as any)?.specializations || '',
        introduction: (teacher as any)?.introduction || '',
        workExperience: (teacher as any)?.workExperience || '',
        salaryPerLesson: (teacher as any)?.salaryPerLesson !== undefined && (teacher as any)?.salaryPerLesson !== null 
          ? String((teacher as any).salaryPerLesson) 
          : '',
        isActive: (teacher as any)?.isActive ?? true,
        typical: (teacher as any)?.typical ?? false
      });
    } else if (!open) {
      // Reset only when dialog closes to keep inputs while open
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      gender: 'male',
      dayOfBirth: '',
      description: '',
      qualifications: '',
      specializations: '',
      introduction: '',
      workExperience: '',
      salaryPerLesson: '',
      isActive: true,
      typical: false
    });
    setErrors({});
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validate = (): boolean => {
    // Tạm thời bỏ validation để test
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const teacherData: Partial<Teacher> = {
        ...(teacher ? { id: teacher.id } : {}),
        name: formData.name,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {}),
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender as any,
        dayOfBirth: formData.dayOfBirth as any,
        description: formData.description,
        qualifications: formData.qualifications ? formData.qualifications.split(',').map(q => q.trim()).filter(q => q) as any : [],
        specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()).filter(s => s) as any : [],
        introduction: formData.introduction,
        workExperience: formData.workExperience || 'null',
        ...(formData.salaryPerLesson ? { salaryPerLesson: Number(formData.salaryPerLesson) } : {}),
        isActive: formData.isActive,
        typical: formData.typical
      };

      await onSubmit(teacherData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting teacher form:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={teacher && (teacher as any)?.id ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}
      subtitle="Cập nhật thông tin giáo viên"
      icon={teacher ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={handleClose}
            variant="outlined"
            startIcon={<CancelIcon />}
            disabled={loading}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {loading ? 'Đang lưu...' : (teacher && (teacher as any)?.id ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </>
      }
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
        <Box sx={{ p: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>
                {!(teacher && (teacher as any)?.id) && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      error={!!errors.password}
                      helperText={errors.password}
                      required
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    type="date"
                    value={formData.dayOfBirth}
                    onChange={(e) => handleInputChange('dayOfBirth', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Giới tính"
                      onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lương mỗi buổi học (VNĐ)"
                    type="number"
                    value={formData.salaryPerLesson}
                    onChange={(e) => handleInputChange('salaryPerLesson', e.target.value)}
                    error={!!errors.salaryPerLesson}
                    helperText={errors.salaryPerLesson}
                    placeholder="200000"
                  />
                </Grid>
                {teacher && (teacher as any)?.id && (
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Trạng thái hoạt động"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description}
                    placeholder="Mô tả về kinh nghiệm giảng dạy, chuyên môn..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Giới thiệu"
                    multiline
                    rows={3}
                    value={formData.introduction}
                    onChange={(e) => handleInputChange('introduction', e.target.value)}
                    error={!!errors.introduction}
                    helperText={errors.introduction}
                    placeholder="Giới thiệu ngắn gọn về giáo viên..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Kinh nghiệm làm việc"
                    multiline
                    rows={3}
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    error={!!errors.workExperience}
                    helperText={errors.workExperience}
                    placeholder="Mô tả kinh nghiệm làm việc..."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bằng cấp"
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange('qualifications', e.target.value)}
                        error={!!errors.qualifications}
                    helperText={errors.qualifications}
                    placeholder="Bachelor of Arts, CELTA"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Chuyên môn"
                    value={formData.specializations}
                    onChange={(e) => handleInputChange('specializations', e.target.value)}
                    error={!!errors.specializations}
                    helperText={errors.specializations}
                    placeholder="Business English, Speaking"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
    </BaseDialog>
  );
};

export default TeacherForm;
