import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Teacher } from '@shared/types';
import { BaseDialog } from '@shared/components';
import { formatDateDDMMYYYY } from '@features/teachers';

interface TeacherViewDialogProps {
  open: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  loading?: boolean;
}

const TeacherViewDialog: React.FC<TeacherViewDialogProps> = ({
  open,
  onClose,
  teacher,
  loading = false
}) => {
  if (!teacher) return null;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết giáo viên"
      subtitle="Thông tin chi tiết về giáo viên và chuyên môn"
      icon={<ViewIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      loading={loading}
      minHeight="60vh"
      contentPadding={0}
    >
        <Box sx={{ p: 4 }}>
          <Box>
            {/* Main Information Grid */}
            <Grid container spacing={3}>
              {/* Personal Info - Full width with 2-column layout inside */}
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
                    Thông tin cá nhân
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {teacher.name || teacher.userId?.name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {teacher.email || teacher.userId?.email || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1">
                          {teacher.phone || teacher.userId?.phone || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1">
                          {teacher.address || teacher.userId?.address || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1">
                          {teacher.dayOfBirth ?
                            formatDateDDMMYYYY(String(teacher.dayOfBirth))
                            : teacher.userId?.dayOfBirth ?
                            formatDateDDMMYYYY(String(teacher.userId.dayOfBirth))
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Giới tính
                        </Typography>
                        <Typography variant="body1">
                          {(teacher.gender || teacher.userId?.gender) === 'male' ? 'Nam' :
                           (teacher.gender || teacher.userId?.gender) === 'female' ? 'Nữ' : 'N/A'}
                        </Typography>
                      </Grid>
                      {teacher.qualifications && teacher.qualifications.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Bằng cấp
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {teacher.qualifications.map((qualification, index) => (
                              <Typography key={index} variant="body2">
                                • {qualification}
                              </Typography>
                            ))}
                          </Box>
                        </Grid>
                      )}
                      {teacher.specializations && teacher.specializations.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Chuyên môn
                          </Typography>
                          <Typography variant="body1">
                            {teacher.specializations.join(', ')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Paper>
              </Grid>

              {/* Professional Info */}
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
                    Thông tin giảng dạy
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e6ed'
                  }}>
                    <Grid container spacing={2}>
                      {((teacher as any).salaryPerLesson !== undefined && (teacher as any).salaryPerLesson !== null) && (
                      <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Lương mỗi buổi học
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format((teacher as any).salaryPerLesson)}
                        </Typography>
                      </Grid>
                      )}
                      {teacher.salary && !(teacher as any).salaryPerLesson && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Mức lương
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(teacher.salary)}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Kinh nghiệm làm việc
                        </Typography>
                        <Typography variant="body1">
                          {(teacher as any).workExperience || 'Chưa cập nhật'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Giới thiệu
                        </Typography>
                        <Typography variant="body1">
                          {(teacher as any).introduction || 'Chưa cập nhật'}
                        </Typography>
                      </Grid>
              {teacher.description && (
                <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                      Mô tả
                    </Typography>
                      <Typography variant="body1">
                        {teacher.description}
                      </Typography>
                </Grid>
              )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Trạng thái
                    </Typography>
                        <Chip
                          label={teacher.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          color={teacher.isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                    </Grid>
                    </Box>
                  </Paper>
                </Grid>
            </Grid>
          </Box>
        </Box>
    </BaseDialog>
  );
};

export default TeacherViewDialog;
