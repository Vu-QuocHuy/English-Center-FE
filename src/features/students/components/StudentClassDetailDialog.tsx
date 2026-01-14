import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { BaseDialog } from '@shared/components';

interface StudentClassDetailDialogProps {
  open: boolean;
  onClose: () => void;
  selectedClass: any | null;
  classDetailLoading: boolean;
  attendanceInfo: any;
  attendanceLoading: boolean;
  getStatusColor: (status: string) => 'success' | 'error' | 'warning' | 'default';
  getStatusLabel: (status: string) => string;
}

const StudentClassDetailDialog: React.FC<StudentClassDetailDialogProps> = ({
  open,
  onClose,
  selectedClass,
  classDetailLoading,
  attendanceInfo,
  attendanceLoading,
  getStatusColor,
  getStatusLabel,
}) => {
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết lớp học"
      subtitle={selectedClass?.name}
      icon={<SchoolIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      loading={classDetailLoading}
      contentPadding={0}
    >
      {selectedClass && !classDetailLoading && (
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2,
                    }}
                  />
                  Thông tin lớp học
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Tên lớp:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: '#2c3e50' }}
                        >
                          {selectedClass.name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Giáo viên:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: '#2c3e50' }}
                        >
                          {selectedClass.teacher?.name ||
                            selectedClass.teacher ||
                            'Chưa phân công'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Phòng học:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: '#2c3e50' }}
                        >
                          {selectedClass.room}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Lịch học:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: '#2c3e50' }}
                        >
                          {selectedClass.scheduleDays || 'Chưa có lịch'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Giờ học:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: '#2c3e50' }}
                        >
                          {selectedClass.scheduleTime || 'Chưa có giờ'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Trạng thái:
                        </Typography>
                        <Chip
                          label={getStatusLabel(selectedClass.status)}
                          color={getStatusColor(selectedClass.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            '& .MuiChip-icon': {
                              fontSize: '16px',
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            {/* Thống kê tham gia */}
            {selectedClass.status !== 'upcoming' && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: '1px solid #e0e6ed',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: '#2c3e50',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        bgcolor: '#667eea',
                        borderRadius: 2,
                      }}
                    />
                    Thống kê tham gia học tập
                  </Typography>
                  {attendanceLoading ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <LinearProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Đang tải thông tin điểm danh...
                      </Typography>
                    </Box>
                  ) : attendanceInfo ? (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <Card
                            sx={{
                              textAlign: 'center',
                              background:
                                'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: 'success.dark',
                                  fontWeight: 600,
                                }}
                              >
                                {attendanceInfo.attendanceStats?.presentSessions ??
                                  0}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="success.dark"
                                sx={{ fontWeight: 500 }}
                              >
                                Buổi đã học
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Card
                            sx={{
                              textAlign: 'center',
                              background:
                                'linear-gradient(135deg, #ffe0e3 0%, #ffb3ba 100%)',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="h4"
                                sx={{ color: 'error.dark', fontWeight: 600 }}
                              >
                                {attendanceInfo.attendanceStats?.absentSessions ??
                                  0}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="error.dark"
                                sx={{ fontWeight: 500 }}
                              >
                                Buổi đã nghỉ
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Card
                            sx={{
                              textAlign: 'center',
                              background:
                                'linear-gradient(135deg, #fff9e0 0%, #ffeab3 100%)',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: 'warning.dark',
                                  fontWeight: 600,
                                }}
                              >
                                {attendanceInfo.attendanceStats?.lateSessions ??
                                  0}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="warning.dark"
                                sx={{ fontWeight: 500 }}
                              >
                                Buổi muộn
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Card
                            sx={{
                              textAlign: 'center',
                              background:
                                'linear-gradient(135deg, #e3e0ff 0%, #b3baff 100%)',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="h4"
                                sx={{ color: 'info.dark', fontWeight: 600 }}
                              >
                                {attendanceInfo.attendanceStats?.attendanceRate ??
                                  0}
                                %
                              </Typography>
                              <Typography
                                variant="body2"
                                color="info.dark"
                                sx={{ fontWeight: 500 }}
                              >
                                Tỷ lệ tham gia
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ p: 2 }}
                    >
                      Không có dữ liệu điểm danh.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Lịch sử điểm danh */}
            {selectedClass.status !== 'upcoming' && (
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
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
                    Lịch sử điểm danh
                  </Typography>
                  {attendanceLoading ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <LinearProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>Đang tải lịch sử điểm danh...</Typography>
                    </Box>
                  ) : attendanceInfo && attendanceInfo.detailedAttendance?.length > 0 ? (
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ngày</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Trạng thái</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ghi chú</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {attendanceInfo.detailedAttendance.map((attendance: any, idx: number) => (
                              <TableRow key={idx} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                    {new Date(attendance.date).toLocaleDateString('vi-VN')}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={attendance.status === 'present' ? 'Có mặt' : attendance.status === 'absent' ? 'Vắng' : 'Đi muộn'}
                                    color={attendance.status === 'present' ? 'success' : attendance.status === 'absent' ? 'error' : 'warning'}
                                    size="small"
                                    icon={attendance.status === 'present' ? <CheckCircleIcon /> : attendance.status === 'absent' ? <CancelIcon /> : <ScheduleIcon />}
                                    sx={{ fontWeight: 600, '& .MuiChip-icon': { fontSize: '16px' } }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    {attendance.note || '-'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="black" align="center" sx={{ p: 2 }}>Không có dữ liệu điểm danh.</Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </BaseDialog>
  );
};

export default StudentClassDetailDialog;