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
import { validateTeacher } from '@features/teachers/validations';
import type { TeacherFormData } from '@features/teachers/validations';
import { createTeacherAPI, updateTeacherAPI } from '../services/teachers.api';

interface TeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (result: { success: boolean; message?: string }) => void;
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
  dayOfBirth?: string;
  address?: string;
  gender?: string;
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
  loading: externalLoading = false
}) => {
  const [loading, setLoading] = useState(false);
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
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  useEffect(() => {
    // Chỉ coi là chế độ chỉnh sửa khi có teacher và có id
    if (teacher && (teacher as any)?.id) {
      const initialData = {
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
      };
      setFormData(initialData);
      setOriginalData(initialData); // Store original data for comparison
    } else if (open && !teacher) {
      // Reset form when opening dialog for new teacher
      resetForm();
      setOriginalData(null);
    } else if (!open) {
      // Reset only when dialog closes to keep inputs while open
      resetForm();
      setOriginalData(null);
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
    setOriginalData(null);
  };

  // Helper function to get only changed fields (flat structure for backend)
  const getChangedFields = (newData: FormData, original: FormData | null): Partial<FormData> => {
    if (!original) {
      // If no original data, return all data (for create)
      return newData;
    }

    const changedFields: Partial<FormData> = {};

    // Check all fields
    if (newData.name !== original.name) changedFields.name = newData.name;
    if (newData.email !== original.email) changedFields.email = newData.email;
    if (newData.phone !== original.phone) changedFields.phone = newData.phone;
    if (newData.address !== original.address) changedFields.address = newData.address;
    if (newData.gender !== original.gender) changedFields.gender = newData.gender;
    if (newData.dayOfBirth !== original.dayOfBirth) changedFields.dayOfBirth = newData.dayOfBirth;
    if (newData.description !== original.description) changedFields.description = newData.description;
    
    // Compare qualifications (arrays)
    const newQuals = newData.qualifications ? newData.qualifications.split(',').map(q => q.trim()).filter(q => q).sort().join(',') : '';
    const origQuals = original.qualifications ? original.qualifications.split(',').map(q => q.trim()).filter(q => q).sort().join(',') : '';
    if (newQuals !== origQuals) {
      changedFields.qualifications = newData.qualifications;
    }
    
    // Compare specializations (arrays)
    const newSpecs = newData.specializations ? newData.specializations.split(',').map(s => s.trim()).filter(s => s).sort().join(',') : '';
    const origSpecs = original.specializations ? original.specializations.split(',').map(s => s.trim()).filter(s => s).sort().join(',') : '';
    if (newSpecs !== origSpecs) {
      changedFields.specializations = newData.specializations;
    }
    
    if (newData.introduction !== original.introduction) changedFields.introduction = newData.introduction;
    if (newData.workExperience !== original.workExperience) changedFields.workExperience = newData.workExperience;
    
    const newSalary = newData.salaryPerLesson ? Number(newData.salaryPerLesson) : 0;
    const origSalary = original.salaryPerLesson ? Number(original.salaryPerLesson) : 0;
    if (newSalary !== origSalary) changedFields.salaryPerLesson = newData.salaryPerLesson;
    
    if (newData.isActive !== original.isActive) changedFields.isActive = newData.isActive;

    return changedFields;
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
    const newErrors: FormErrors = {};
    
    // Convert formData to TeacherFormData format for validation
    const teacherFormData: TeacherFormData = {
      name: formData.name,
      email: formData.email,
      password: teacher && (teacher as any)?.id ? undefined : formData.password, // Only validate password for new teachers
      phone: formData.phone,
      dayOfBirth: formData.dayOfBirth,
      address: formData.address,
      gender: formData.gender,
      description: formData.description,
      qualifications: formData.qualifications ? formData.qualifications.split(',').map(q => q.trim()).filter(q => q) : [],
      specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()).filter(s => s) : [],
      introduction: formData.introduction,
      workExperience: formData.workExperience,
      salaryPerLesson: formData.salaryPerLesson ? Number(formData.salaryPerLesson) : undefined,
      isActive: formData.isActive
    };

    // Validate using the validation function
    const validationErrors = validateTeacher(teacherFormData);
    
    // Map validation errors to form errors
    if (validationErrors.name) newErrors.name = validationErrors.name;
    if (validationErrors.email) newErrors.email = validationErrors.email;
    if (validationErrors.password) newErrors.password = validationErrors.password;
    if (validationErrors.phone) newErrors.phone = validationErrors.phone;
    if (validationErrors.dayOfBirth) newErrors.dayOfBirth = validationErrors.dayOfBirth;
    if (validationErrors.address) newErrors.address = validationErrors.address;
    if (validationErrors.gender) newErrors.gender = validationErrors.gender;
    if (validationErrors.description) newErrors.description = validationErrors.description;
    if (validationErrors.qualifications) newErrors.qualifications = validationErrors.qualifications;
    if (validationErrors.specializations) newErrors.specializations = validationErrors.specializations;
    if (validationErrors.introduction) newErrors.introduction = validationErrors.introduction;
    if (validationErrors.workExperience) newErrors.workExperience = validationErrors.workExperience;
    if (validationErrors.salaryPerLesson) newErrors.salaryPerLesson = validationErrors.salaryPerLesson;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Convert dayOfBirth from YYYY-MM-DD to MM/DD/YYYY format for backend
      let formattedDayOfBirth = formData.dayOfBirth;
      if (formData.dayOfBirth && formData.dayOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = formData.dayOfBirth.split('-');
        formattedDayOfBirth = `${month}/${day}/${year}`;
      }

      let payload: any;
      
      if (teacher && (teacher as any)?.id) {
        // Update: only send changed fields (flat structure)
        const changedFields = getChangedFields(formData, originalData);
        
        // Convert date format if dayOfBirth changed
        if (changedFields.dayOfBirth) {
          changedFields.dayOfBirth = formattedDayOfBirth;
        }

        // Convert qualifications and specializations to arrays if changed
        const updatePayload: any = {};
        if (changedFields.name !== undefined) updatePayload.name = changedFields.name;
        if (changedFields.email !== undefined) updatePayload.email = changedFields.email;
        if (changedFields.phone !== undefined) updatePayload.phone = changedFields.phone;
        if (changedFields.address !== undefined) updatePayload.address = changedFields.address;
        if (changedFields.gender !== undefined) updatePayload.gender = changedFields.gender;
        if (changedFields.dayOfBirth !== undefined) updatePayload.dayOfBirth = changedFields.dayOfBirth;
        if (changedFields.description !== undefined) updatePayload.description = changedFields.description;
        if (changedFields.qualifications !== undefined) {
          updatePayload.qualifications = changedFields.qualifications 
            ? changedFields.qualifications.split(',').map(q => q.trim()).filter(q => q) 
            : [];
        }
        if (changedFields.specializations !== undefined) {
          updatePayload.specializations = changedFields.specializations 
            ? changedFields.specializations.split(',').map(s => s.trim()).filter(s => s) 
            : [];
        }
        if (changedFields.introduction !== undefined) updatePayload.introduction = changedFields.introduction;
        if (changedFields.workExperience !== undefined) updatePayload.workExperience = changedFields.workExperience || '';
        if (changedFields.salaryPerLesson !== undefined) {
          updatePayload.salaryPerLesson = changedFields.salaryPerLesson ? Number(changedFields.salaryPerLesson) : 0;
        }
        if (changedFields.isActive !== undefined) updatePayload.isActive = changedFields.isActive;
        
        await updateTeacherAPI(teacher.id, updatePayload);
      } else {
        // Create: send all fields
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          dayOfBirth: formattedDayOfBirth,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          description: formData.description,
          qualifications: formData.qualifications ? formData.qualifications.split(',').map(q => q.trim()).filter(q => q) : [],
          specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()).filter(s => s) : [],
          introduction: formData.introduction,
          workExperience: formData.workExperience || '',
          salaryPerLesson: formData.salaryPerLesson ? Number(formData.salaryPerLesson) : 0,
          isActive: formData.isActive
        };
        
        await createTeacherAPI(payload);
      }

      // Notify parent component
      if (onSubmit) {
        onSubmit({ success: true, message: teacher && (teacher as any)?.id ? 'Cập nhật giáo viên thành công!' : 'Thêm giáo viên thành công!' });
      }

      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu giáo viên';

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
            {(loading || externalLoading) ? 'Đang lưu...' : (teacher && (teacher as any)?.id ? 'Cập nhật' : 'Tạo mới')}
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
                    error={!!errors.dayOfBirth}
                    helperText={errors.dayOfBirth}
                    InputLabelProps={{ shrink: true }}
                    required
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
                    required
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
