import React from 'react';
import { Box, Typography, Chip, Paper, Grid } from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { Class } from '@shared/types';
import { BaseDialog } from '@shared/components';
import { formatClassDate, formatClassCurrency, getClassStatusText, getDaysOfWeekText } from '@features/classes';

interface ClassDetailsModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
}

const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  classItem,
  open,
  onClose
}) => {
  if (!classItem) return null;

  const daysText = getDaysOfWeekText(classItem.schedule?.days_of_week || []);
  const timeRange = classItem.schedule?.time_slots
    ? `${classItem.schedule?.time_slots.start_time} - ${classItem.schedule?.time_slots.end_time}`
    : 'Chưa có thời gian';
  const studentCount = classItem.students?.length ?? 0;
  const maxStudents = classItem.max_student ?? classItem.maxStudents ?? 0;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết lớp học"
      subtitle="Thông tin chi tiết về lớp học và học sinh"
      icon={<ViewIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      contentPadding={0}
    >
      <Box sx={{ p: 4 }}>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
          {/* Thông tin cơ bản */}
          <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Thông tin cơ bản</Typography>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tên lớp</Typography>
                  <Typography variant="body1" fontWeight={600}>{classItem.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Giáo viên phụ trách</Typography>
                  <Typography variant="body1">
                    {classItem.teacher?.name || classItem.teacher?.userId?.name || 'Chưa phân công'}{classItem.teacher?.email || classItem.teacher?.userId?.email ? ` (${classItem.teacher?.email || classItem.teacher?.userId?.email})` : ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Năm học</Typography>
                  <Typography variant="body1">{classItem.year || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Khối</Typography>
                  <Typography variant="body1">{classItem.grade ? `Khối ${classItem.grade}` : '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Phòng học</Typography>
                  <Typography variant="body1">{classItem.room || '-'}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Thống kê lớp học */}
          <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Thống kê lớp học</Typography>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Số lượng học sinh</Typography>
                  <Typography variant="body1">{studentCount}/{maxStudents || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Học phí mỗi buổi</Typography>
                  <Typography variant="body1">{formatClassCurrency(classItem.feePerLesson)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Thời gian học</Typography>
                  <Typography variant="body1">{daysText || '-'}</Typography>
                  <Typography variant="body2" color="text.secondary">{timeRange}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Trạng thái lớp học</Typography>
                  <Chip label={getClassStatusText(classItem.status)} color={classItem.status === 'closed' ? 'error' : 'success'} sx={{ fontWeight: 700 }} />
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Lịch học chi tiết */}
        <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, mt: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Lịch học chi tiết</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#fb8c00' }}>
                <Typography variant="subtitle2" color="text.secondary">Ngày bắt đầu</Typography>
                <Typography variant="h6" sx={{ color: '#fb8c00', fontWeight: 800 }}>{formatClassDate(classItem.schedule?.start_date)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#43a047' }}>
                <Typography variant="subtitle2" color="text.secondary">Ngày kết thúc</Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 800 }}>{formatClassDate(classItem.schedule?.end_date)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#64b5f6' }}>
                <Typography variant="subtitle2" color="text.secondary">Thời gian</Typography>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 800 }}>{timeRange}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: '#ce93d8' }}>
                <Typography variant="subtitle2" color="text.secondary">Ngày trong tuần</Typography>
                <Typography variant="h6" sx={{ color: '#7b1fa2', fontWeight: 800 }}>{daysText || '-'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Mô tả */}
        <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, mt: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Mô tả lớp học</Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{classItem.description || 'Không có mô tả'}</Typography>
          </Paper>
        </Box>

        {/* Danh sách học sinh */}
        <Box component={Paper} elevation={0} sx={{ p: 2.5, borderRadius: 3, mt: 3, background: 'linear-gradient(180deg, #edf2ff, #e9eef9)' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Danh sách học sinh ({studentCount})</Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              {(classItem.students || []).map((s: any, idx: number) => (
                <Grid item xs={12} sm={6} md={4} key={s.student?.id || s.id || idx}>
                  <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f3f4f6' }} variant="outlined">
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {idx + 1}. {s.student?.name || s?.name || s?.userId?.name || 'Không tên'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Giảm giá: {s.discountPercent || 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Trạng thái: {s.isActive ? 'Đang học' : 'Đã nghỉ'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
              {studentCount === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Chưa có học sinh</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>
      </Box>
    </BaseDialog>
  );
};

export default ClassDetailsModal;