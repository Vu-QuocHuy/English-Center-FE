import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';

import { Class, ClassFormData, ClassFormErrors } from '@shared/types';
import { getClassByIdAPI } from '../services/classes.api';
import ClassTeacherManagement from '../../../pages/admin/ClassTeacherManagement';
import ClassStudentManagement from '../../../pages/admin/ClassStudentManagement';
import { BaseDialog } from '@shared/components';

interface ClassFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (classData: ClassFormData) => Promise<void>;
  classItem?: Class | null;
  loading?: boolean;
}

const initialFormData: ClassFormData = {
  name: '',
  grade: 1,
  section: 1,
  year: new Date().getFullYear(),
  description: '',
  feePerLesson: 0,
  status: 'active',
  max_student: 30,
  room: '',
  schedule: {
    start_date: '',
    end_date: '',
    days_of_week: [],
    time_slots: {
      start_time: '',
      end_time: ''
    }
  }
};

const daysOfWeekOptions = [
  { value: '1', label: 'Thứ 2' },
  { value: '2', label: 'Thứ 3' },
  { value: '3', label: 'Thứ 4' },
  { value: '4', label: 'Thứ 5' },
  { value: '5', label: 'Thứ 6' },
  { value: '6', label: 'Thứ 7' },
  { value: '0', label: 'Chủ nhật' }
] as const;

const ClassForm: React.FC<ClassFormProps> = ({
  open,
  onClose,
  onSubmit,
  classItem,
  loading = false
}) => {
  const [formData, setFormData] = useState<ClassFormData>(initialFormData);
  const [errors, setErrors] = useState<ClassFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<any | null>(null);
  const [studentsInfo, setStudentsInfo] = useState<Array<any>>([]);

  const [activeTab, setActiveTab] = useState(0);
  const [maxStudentError, setMaxStudentError] = useState<string>('');

  // Initialize form data when classItem changes
  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name || '',
        grade: classItem.grade || 1,
        section: classItem.section || 1,
        year: classItem.year || new Date().getFullYear(),
        description: classItem.description || '',
        feePerLesson: classItem.feePerLesson || 0,
        status: classItem.status || 'active',
        max_student: classItem.max_student || classItem.maxStudents || 30,
        room: classItem.room || '',
        schedule: {
          start_date: classItem.schedule?.start_date ?
            new Date(classItem.schedule.start_date).toISOString().split('T')[0] : '',
          end_date: classItem.schedule?.end_date ?
            new Date(classItem.schedule.end_date).toISOString().split('T')[0] : '',
          days_of_week: (() => {
            const days = classItem.schedule?.days_of_week || [];
            // Convert numbers to strings if needed
            return days.map(d => String(d));
          })(),
          time_slots: {
            start_time: classItem.schedule?.time_slots?.start_time || '',
            end_time: classItem.schedule?.time_slots?.end_time || ''
          }
        }
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setMaxStudentError('');
  }, [classItem, open]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (classItem && open) {
        try {
          const res = await getClassByIdAPI(classItem.id);
          const data = res?.data?.data || res?.data;
          if (data) {
            setTeacherInfo(data.teacher || null);
            setStudentsInfo(data.students || []);
          }
        } catch (e) {
        }
      } else {
        setTeacherInfo(null);
        setStudentsInfo([]);
      }
    };
    fetchDetails();
  }, [classItem, open]);

  const handleInputChange = (field: string, value: any) => {
    // Xử lý time fields trước (có 3 phần: schedule.time_slots.start_time/end_time)
    if (field === 'schedule.time_slots.start_time' || field === 'schedule.time_slots.end_time') {
      const timeField = field.split('.')[2]; // 'start_time' hoặc 'end_time'
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          time_slots: {
            ...prev.schedule.time_slots,
            [timeField]: value
          }
        }
      }));
    } else if (field.includes('.')) {
      // Xử lý các nested fields khác (2 phần: schedule.start_date, schedule.end_date, etc.)
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof ClassFormData] as any),
            [child]: value
          }
        }));
      }
    } else {
      // Xử lý các field đơn giản
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Clear custom error for max_student khi user nhập lại
      if (field === 'max_student' && maxStudentError) {
        setMaxStudentError('');
      }
    }

    // Clear error for this field
    if (errors[field as keyof ClassFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    // Bỏ validation - luôn return true
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Validate số học sinh tối đa
    const currentMax = Number(formData.max_student) || 0;
    const currentStudentsCount = Array.isArray(studentsInfo) ? studentsInfo.length : 0;

    if (!currentMax || currentMax <= 0) {
      setMaxStudentError('Số học sinh tối đa phải lớn hơn 0');
      return;
    }

    if (currentMax > 100) {
      setMaxStudentError('Số học sinh tối đa không được vượt quá 100');
      return;
    }

    if (classItem && currentStudentsCount > 0 && currentMax < currentStudentsCount) {
      setMaxStudentError(`Số học sinh tối đa không được nhỏ hơn số học sinh hiện tại (${currentStudentsCount})`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate year from end date
      const endDate = new Date(formData.schedule.end_date);
      const year = endDate.getFullYear();

      // Determine status based on dates
      const now = new Date();
      const startDate = new Date(formData.schedule.start_date);
      let status: 'active' | 'inactive' | 'completed' | 'cancelled' | 'closed' = 'active';

      if (startDate > now) {
        status = 'active'; // upcoming is not in the type, use active
      } else if (endDate < now) {
        status = 'completed';
      }

      const submitData = {
        ...formData,
        grade: parseInt(formData.grade.toString()) || 1,
        section: parseInt(formData.section.toString()) || 1,
        feePerLesson: parseInt(formData.feePerLesson.toString()) || 0,
        max_student: parseInt(formData.max_student.toString()) || 30,
        year,
        status
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting class form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setMaxStudentError('');
    onClose();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUpdateClass = () => {
    // Refresh class data when teacher/student management updates
    if (classItem) {
      const fetchDetails = async (retryCount = 0) => {
        try {
          const res = await getClassByIdAPI(classItem.id);
          const data = res?.data?.data || res?.data;
          if (data) {
            setTeacherInfo(data.teacher || null);
            setStudentsInfo(data.students || []);
          }
        } catch (e) {
          console.error('Error refreshing class details:', e);

          // Retry logic - thử lại tối đa 3 lần với delay 1s
          if (retryCount < 3) {
            console.log(`Retrying... Attempt ${retryCount + 1}/3`);
            setTimeout(() => {
              fetchDetails(retryCount + 1);
            }, 1000);
          } else {
            console.error('Failed to refresh class details after 3 attempts');
            // Có thể hiển thị thông báo lỗi cho user
          }
        }
      };
      fetchDetails();
    }
  };

  const renderGeneralInfoTab = () => (
    <Grid container spacing={3}>
      {/* Left Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Khối"
            value={formData.grade ?? ''}
            onChange={(e) => handleInputChange('grade', e.target.value)}
            error={!!errors.grade}
            helperText={errors.grade}
            required
          />

          <TextField
            fullWidth
            label="Tên lớp"
            value={formData.name ?? ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />

          <TextField
            fullWidth
            label="Giờ bắt đầu"
            type="time"
            value={formData.schedule?.time_slots?.start_time ?? ''}
            onChange={(e) => handleInputChange('schedule.time_slots.start_time', e.target.value)}
            error={!!errors.start_time}
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 300, // 5 minutes
            }}
          />

          <TextField
            fullWidth
            label="Phòng học"
            value={formData.room ?? ''}
            onChange={(e) => handleInputChange('room', e.target.value)}
            error={!!errors.room}
            helperText={errors.room}
            required
          />

          <TextField
            fullWidth
            label="Ngày bắt đầu"
            type="date"
            value={formData.schedule?.start_date ?? ''}
            onChange={(e) => handleInputChange('schedule', {
              ...formData.schedule,
              start_date: e.target.value
            })}
            error={!!errors.start_date}
            helperText={errors.start_date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Lớp"
            value={formData.section ?? ''}
            onChange={(e) => handleInputChange('section', e.target.value)}
            error={!!errors.section}
            helperText={errors.section}
            required
          />

          <TextField
            fullWidth
            label="Học phí/buổi"
            value={formData.feePerLesson ?? ''}
            onChange={(e) => handleInputChange('feePerLesson', e.target.value)}
            error={!!errors.feePerLesson}
            helperText={errors.feePerLesson}
            required
          />

          <TextField
            fullWidth
            label="Giờ kết thúc"
            type="time"
            value={formData.schedule?.time_slots?.end_time ?? ''}
            onChange={(e) => handleInputChange('schedule.time_slots.end_time', e.target.value)}
            error={!!errors.end_time}
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 300, // 5 minutes
            }}
          />

          <TextField
            fullWidth
            label="Số học sinh tối đa"
            type="number"
            value={formData.max_student === 0 ? '' : formData.max_student ?? ''}
            onChange={(e) => {
              const inputValue = e.target.value;
              const numericValue = inputValue === '' ? 0 : Number(inputValue);
              handleInputChange('max_student', numericValue);
            }}
            error={!!errors.max_student || !!maxStudentError}
            InputProps={{ inputProps: { min: 1, max: 100 } }}
            required
          />

          <TextField
            fullWidth
            label="Ngày kết thúc"
            type="date"
            value={formData.schedule?.end_date ?? ''}
            onChange={(e) => handleInputChange('schedule', {
              ...formData.schedule,
              end_date: e.target.value
            })}
            error={!!errors.end_date}
            helperText={errors.end_date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
      </Grid>

      {/* Ngày học trong tuần - Full width */}
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.days_of_week}>
          <InputLabel id="days-of-week-label">Ngày học trong tuần *</InputLabel>
          <Select
            labelId="days-of-week-label"
            multiple
            value={formData.schedule?.days_of_week || []}
            onChange={(e) => {
              const value = typeof e.target.value === 'string' 
                ? e.target.value.split(',') 
                : e.target.value;
              handleInputChange('schedule', {
                ...formData.schedule,
                days_of_week: value
              });
            }}
            input={<OutlinedInput label="Ngày học trong tuần *" />}
            renderValue={(selected) => {
              if (!selected || selected.length === 0) return '';
              return selected.map(val => {
                const day = daysOfWeekOptions.find(d => d.value === String(val));
                return day?.label;
              }).filter(Boolean).join(', ');
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
            }}
          >
            {daysOfWeekOptions.map((day) => (
              <MenuItem key={day.value} value={day.value}>
                <Checkbox checked={(formData.schedule?.days_of_week || []).indexOf(day.value) > -1} />
                <ListItemText primary={day.label} />
              </MenuItem>
            ))}
          </Select>
          {errors.days_of_week && (
            <FormHelperText error>{errors.days_of_week}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Mô tả - Full width */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Mô tả"
          multiline
          rows={3}
          value={formData.description ?? ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={classItem ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
      subtitle={classItem ? 'Cập nhật thông tin lớp học' : 'Thêm lớp học mới vào hệ thống'}
      icon={classItem ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={handleClose}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              border: '2px solid #667eea',
              color: '#667eea',
              bgcolor: 'white',
              '&:hover': {
                bgcolor: '#f0f2ff',
                borderColor: '#5a6fd8'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#667eea',
              color: 'white',
              '&:hover': { bgcolor: '#5a6fd8' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : (classItem ? <EditIcon /> : <AddIcon />)}
          >
            {isSubmitting ? 'Đang lưu...' : (classItem ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </>
      }
    >
        <Box sx={{ p: 4 }}>
          <Paper sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" gutterBottom sx={{
              color: '#2c3e50',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}>
              <Box sx={{
                width: 4,
                height: 20,
                bgcolor: '#667eea',
                borderRadius: 2
              }} />
              Thông tin lớp học
              </Typography>

            {classItem ? (
              // Edit mode - Show tabs
              <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    px: 3,
                    pt: 2,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      minHeight: 48,
                      color: '#666',
                      '&.Mui-selected': {
                        color: '#667eea',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#667eea',
                      height: 3
                    }
                  }}
                >
                  <Tab label="Thông tin chung" />
                  <Tab label="Giáo viên" />
                  <Tab label="Học sinh" />
                </Tabs>

                <Divider sx={{ mx: 3 }} />

                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                    {renderGeneralInfoTab()}
                  </Box>
                  <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                    <ClassTeacherManagement
                      classData={{
                        ...classItem,
                        teacherId: teacherInfo
                      }}
                      onUpdate={handleUpdateClass}
                      onClose={() => {}}
                    />
                  </Box>
                  <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                    <ClassStudentManagement
                      classData={{
                        ...classItem,
                        students: studentsInfo
                      }}
                      onUpdate={handleUpdateClass}
                    />
                  </Box>
                </Box>
              </Box>
            ) : (
              // Create mode - Show original form
              <Box sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2
              }}>
                {renderGeneralInfoTab()}
            </Box>
            )}
          </Paper>
        </Box>
    </BaseDialog>
  );
};

export default ClassForm;
