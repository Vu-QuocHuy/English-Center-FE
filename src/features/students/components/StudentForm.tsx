import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { Student } from '@shared/types';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateGender,
  validateDiscountCode,
  validatePassword
} from '@shared/validations/common';
import { createStudentAPI, updateStudentAPI } from '../services/students.api';
import { BaseDialog } from '@shared/components';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (result: { success: boolean; message?: string }) => void;
  student?: Student | null;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSubmit,
  student,
  loading: externalLoading = false
}) => {
  // Removed theme-based avatar UI for edit layout
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [classEdits, setClassEdits] = useState<Array<{ classId?: string; className: string; discountPercent: number; status: 'active' | 'completed'; }>>([]);
  const [loading, setLoading] = useState(false);
  // Removed avatar editing in this dialog

  // Removed levels/grades UI for this dialog per design

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || student.userId?.name || '',
        email: student.email || student.userId?.email || '',
        password: '', // Không hiển thị password khi edit
        phone: student.phone || student.userId?.phone || '',
        address: student.address || student.userId?.address || '',
        dateOfBirth: student.dayOfBirth ? new Date(student.dayOfBirth).toISOString().split('T')[0] :
                     student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        gender: student.gender || 'male'
      });
      const mapped = (student.classes || []).map((cls: any, index: number) => ({
        classId: cls.class?.id || cls.classId?.id || cls.classId,
        className: cls.class?.name || cls.classId?.name || cls.name ||
                  (cls.class?.grade && cls.class?.section ? `${cls.class.grade}.${cls.class.section}` : '') ||
                  (cls.classId?.grade && cls.classId?.section ? `${cls.classId.grade}.${cls.classId.section}` : '') ||
                  `Lớp ${index + 1}`,
        discountPercent: Number(cls.discountPercent || cls.discount || 0),
        status: (cls.status as 'active' | 'completed') ?? 'active'
      }));
      setClassEdits(mapped);
    } else {
      resetForm();
    }
  }, [student, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'male'
    });
    setErrors({});
    setClassEdits([]);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClassChange = (index: number, field: 'discountPercent' | 'status', value: any) => {
    setClassEdits(prev => prev.map((item, i) => i === index ? { ...item, [field]: field === 'discountPercent' ? Number(value) : value } : item));
  };

  // Helper function to validate date format (yyyy-mm-dd from input type="date")
  const validateDateOfBirth = (dateStr: string): string => {
    if (!dateStr) return 'Ngày sinh không được để trống';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Ngày sinh không hợp lệ';

    const today = new Date();
    if (date >= today) return 'Ngày sinh phải nhỏ hơn ngày hiện tại';

    // Check minimum age (e.g., at least 3 years old)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 3);
    if (date > minDate) return 'Học sinh phải ít nhất 3 tuổi';

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password (only for new students)
    if (!student) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    // Validate phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    // Validate address
    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    // Validate date of birth
    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;

    // Validate gender
    const genderError = validateGender(formData.gender);
    if (genderError) newErrors.gender = genderError;

    // Validate discount percent for each class
    for (let i = 0; i < classEdits.length; i++) {
      const discountError = validateDiscountCode(classEdits[i].discountPercent);
      if (discountError) {
        newErrors.address = newErrors.address || `Lỗi giảm giá lớp ${classEdits[i].className}: ${discountError}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = student?.id
        ? {
            userData: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              dayOfBirth: formData.dateOfBirth,
              gender: formData.gender,
              address: formData.address,
            },
            studentData: classEdits.map(edit => ({
              classId: edit.classId,
              status: edit.status,
              discountPercent: edit.discountPercent || 0
            }))
          }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            dayOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            address: formData.address,
            gender: formData.gender
          };

      if (student?.id) {
        await updateStudentAPI(student.id, payload as any);
      } else {
        await createStudentAPI(payload as any);
      }

      // Notify parent component
      if (onSubmit) {
        onSubmit({ success: true, message: student?.id ? 'Cập nhật học sinh thành công!' : 'Thêm học sinh thành công!' });
      }

      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu học sinh';

      // Notify parent component
      if (onSubmit) {
        onSubmit({ success: false, message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const sectionTitle = (title: string) => (
    <Typography variant="h6" gutterBottom sx={{
      color: '#2c3e50',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 2
    }}>
      <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
      {title}
    </Typography>
  );

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={student ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
      subtitle={student ? 'Cập nhật thông tin học sinh' : 'Nhập thông tin học sinh mới'}
      icon={student ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={handleClose}
            startIcon={<CancelIcon />}
            variant="outlined"
            disabled={loading || externalLoading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                bgcolor: '#667eea',
                color: 'white'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            startIcon={(loading || externalLoading) ? <CircularProgress size={20} /> : <SaveIcon />}
            variant="contained"
            disabled={loading || externalLoading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#667eea',
              '&:hover': {
                bgcolor: '#5a6fd8'
              }
            }}
          >
            {(loading || externalLoading) ? 'Đang lưu...' : (student ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </>
      }
    >
        <Box sx={{ p: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
            {sectionTitle('Thông tin học sinh')}
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

            {!student && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password || 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số'}
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
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.gender}>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Giới tính"
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error" mt={0.5}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* End personal section */}
            </Grid>
            </Box>
          </Paper>

          {student && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
                {sectionTitle('Danh sách lớp đang học')}
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={2}>
                  {classEdits.map((item, idx) => (
                    <React.Fragment key={idx}>
                                             <Grid item xs={12} md={4}>
                         <TextField
                           fullWidth
                           label="Tên lớp"
                           value={item.className}
                           InputProps={{
                             readOnly: true
                           }}
                           sx={{
                             '& .MuiInputBase-input': {
                               backgroundColor: '#f5f5f5',
                               cursor: 'not-allowed'
                             }
                           }}
                         />
             </Grid>
                      <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                          label="Giảm giá (%)"
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) => handleClassChange(idx, 'discountPercent', e.target.value)}
              />
            </Grid>
                      <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                          <InputLabel>Trạng thái</InputLabel>
                <Select
                            value={item.status}
                            label="Trạng thái"
                            onChange={(e) => handleClassChange(idx, 'status', e.target.value as any)}
                          >
                            <MenuItem value="active">Đang học</MenuItem>
                            <MenuItem value="completed">Đã hoàn thành</MenuItem>
                </Select>
              </FormControl>
            </Grid>
                    </React.Fragment>
                  ))}
                  {classEdits.length === 0 && (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">Học sinh chưa có lớp nào.</Typography>
                    </Grid>
                  )}
            </Grid>
              </Box>
            </Paper>
          </Box>
          )}
        </Box>
    </BaseDialog>
  );
};

export default StudentForm;
