import React from 'react';
import {
  Typography,
  TextField,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';

interface TeacherProfileFormProps {
  form: any;
  formErrors: any;
  isEditing: boolean;
  getFormValue: (field: string) => string;
  handleInputChange: (field: string, value: string | boolean) => void;
}

const TeacherProfileForm: React.FC<TeacherProfileFormProps> = ({
  form,
  formErrors,
  isEditing,
  getFormValue,
  handleInputChange,
}) => {
  const fieldPaperStyle = {
    mb: 0.75,
    p: 0.75,
    border: 'none',
    borderRadius: 2,
    bgcolor: 'transparent',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    mb: 0.5,
    fontWeight: 600,
    fontSize: '0.75rem'
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'white',
      height: '40px'
    }
  };

  return (
    <Grid container spacing={1.5}>
      {/* Left Column */}
      <Grid item xs={12} sm={6}>
        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Họ và tên
          </Typography>
          <TextField
            fullWidth
            value={getFormValue('userId.name')}
            onChange={(e) => handleInputChange('userId.name', e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            size="small"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={textFieldStyle}
          />
        </Paper>

        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Số điện thoại
          </Typography>
          <TextField
            fullWidth
            value={isEditing ? (getFormValue('userId.phone') || '') : (getFormValue('userId.phone') || 'Chưa cập nhật')}
            onChange={(e) => handleInputChange('userId.phone', e.target.value)}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
            size="small"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={textFieldStyle}
          />
        </Paper>

        <Paper elevation={0} sx={{ ...fieldPaperStyle, mb: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Giới tính
          </Typography>
          <FormControl fullWidth size="small" sx={{ height: '40px' }}>
            <Select
              value={getFormValue('userId.gender') || 'male'}
              onChange={(e) => handleInputChange('userId.gender', e.target.value)}
              error={!!formErrors.gender}
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

      {/* Right Column */}
      <Grid item xs={12} sm={6} sx={{ mt: 0 }}>
        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Email
          </Typography>
          <TextField
            fullWidth
            value={getFormValue('userId.email')}
            onChange={(e) => handleInputChange('userId.email', e.target.value)}
            error={!!formErrors.email}
            helperText={formErrors.email}
            size="small"
            type="email"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={textFieldStyle}
          />
        </Paper>

        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Ngày sinh
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={getFormValue('userId.dayOfBirth')}
            onChange={(e) => handleInputChange('userId.dayOfBirth', e.target.value)}
            error={!!formErrors.dayOfBirth}
            helperText={formErrors.dayOfBirth}
            size="small"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: !isEditing
            }}
            sx={textFieldStyle}
          />
        </Paper>

        <Paper elevation={0} sx={{ ...fieldPaperStyle, mb: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Địa chỉ
          </Typography>
          <TextField
            fullWidth
            value={isEditing ? (getFormValue('userId.address') || '') : (getFormValue('userId.address') || 'Chưa cập nhật')}
            onChange={(e) => handleInputChange('userId.address', e.target.value)}
            error={!!formErrors.address}
            helperText={formErrors.address}
            size="small"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={textFieldStyle}
          />
        </Paper>
      </Grid>

      {/* Teacher Specific Fields - 2 Columns */}
      <Grid item xs={12} sm={6} sx={{ mt: 0 }}>
        {/* Bằng cấp */}
        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Bằng cấp
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={Array.isArray(form.qualifications) ? form.qualifications.join(', ') : (form.qualifications || '')}
            onChange={(e) => handleInputChange('qualifications', e.target.value)}
            error={!!formErrors.qualifications}
            helperText={formErrors.qualifications}
            size="small"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isEditing ? 'white' : '#f5f5f5'
              }
            }}
          />
        </Paper>

        {/* Mô tả */}
        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Mô tả
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={isEditing ? (getFormValue('description') || '') : (getFormValue('description') || 'Chưa cập nhật')}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!formErrors.description}
            helperText={formErrors.description}
            size="small"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isEditing ? 'white' : '#f5f5f5'
              }
            }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        {/* Chuyên môn */}
        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Chuyên môn
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={Array.isArray(form.specializations) ? form.specializations.join(', ') : (form.specializations || '')}
            onChange={(e) => handleInputChange('specializations', e.target.value)}
            error={!!formErrors.specializations}
            helperText={formErrors.specializations}
            size="small"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isEditing ? 'white' : '#f5f5f5'
              }
            }}
          />
        </Paper>

        {/* Kinh nghiệm làm việc */}
        <Paper elevation={0} sx={fieldPaperStyle}>
          <Typography variant="body2" color="text.secondary" sx={labelStyle}>
            Kinh nghiệm làm việc
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={isEditing ? (getFormValue('workExperience') || '') : (getFormValue('workExperience') || 'Chưa cập nhật')}
            onChange={(e) => handleInputChange('workExperience', e.target.value)}
            error={!!formErrors.workExperience}
            helperText={formErrors.workExperience}
            size="small"
            InputProps={{
              readOnly: !isEditing
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isEditing ? 'white' : '#f5f5f5'
              }
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TeacherProfileForm;
