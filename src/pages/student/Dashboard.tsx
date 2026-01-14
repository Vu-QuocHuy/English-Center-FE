import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { StatCard } from '@shared/components';
import { getStudentDashboardAPI } from '@shared/services';
import { commonStyles } from '@shared/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>({
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    attendance: {
      totalSessions: 0,
      presentSessions: 0,
      absentSessions: 0,
      lateSessions: 0,
      attendanceRate: 0
    },
    classList: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const studentId = user?.studentId || user?.id;
      if (!studentId) {
        setError('Không tìm thấy thông tin học sinh');
        setLoading(false);
        return;
      }

      const response = await getStudentDashboardAPI(studentId);
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalClasses: data.totalClasses || 0,
        activeClasses: data.activeClasses || 0,
        completedClasses: data.completedClasses || 0,
        attendance: data.attendance || {
          totalSessions: 0,
          presentSessions: 0,
          absentSessions: 0,
          lateSessions: 0,
          attendanceRate: 0
        },
        classList: data.classList || []
      });

    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: any) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Get HH:MM format
  };

  const formatDayOfWeek = (dayNumber: any) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dayNumber] || '';
  };

  const formatSchedule = (schedule: any) => {
    if (!schedule) return { days: 'Chưa có lịch', time: '' };

    const days = schedule.days_of_week || [];
    const timeSlots = schedule.time_slots || {};

    const dayText = days.length > 0
      ? days.map((day: any) => formatDayOfWeek(day)).join(', ')
      : 'Chưa có lịch';

    const timeText = timeSlots.start_time && timeSlots.end_time
      ? `${formatTime(timeSlots.start_time)} - ${formatTime(timeSlots.end_time)}`
      : '';

    return { days: dayText, time: timeText };
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'closed') return 'error';
    if (status === 'upcoming') return 'warning';
    if (status === 'completed') return 'error';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'active') return 'Đang học';
    if (status === 'closed') return 'Đã kết thúc';
    if (status === 'upcoming') return 'Sắp khai giảng';
    if (status === 'completed') return 'Đã hoàn thành';
    return 'Không xác định';
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Học sinh
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào <strong>{user?.name || 'Học sinh'}</strong>, đây là thông tin học tập của bạn
        </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lớp học"
              value={dashboardData.totalClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang học"
              value={dashboardData.activeClasses}
                icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
                title="Lớp hoàn thành"
              value={dashboardData.completedClasses}
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
                title="Tỷ lệ tham gia"
                value={`${dashboardData.attendance.attendanceRate || 0}%`}
                icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>

          {/* Attendance Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
            <StatCard
                title="Tổng số buổi"
                value={dashboardData.attendance.totalSessions}
              icon={<TimeIcon sx={{ fontSize: 40 }} />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi có mặt"
                value={dashboardData.attendance.presentSessions}
                icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi vắng"
                value={dashboardData.attendance.absentSessions}
                icon={<PersonIcon sx={{ fontSize: 40 }} />}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <StatCard
                title="Buổi muộn"
                value={dashboardData.attendance.lateSessions}
                icon={<TimeIcon sx={{ fontSize: 40 }} />}
                color="warning"
            />
          </Grid>
          </Grid>

          {/* Class List */}
          <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Danh sách lớp học
              </Typography>
                {dashboardData.classList.length > 0 ? (
                <Box mt={2} bgcolor="#f5f6fa" borderRadius={2} border="1px solid #e0e0e0" p={2}>
                <TableContainer sx={commonStyles.tableContainer}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Phòng học</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                          {dashboardData.classList.map((classItem: any, index: number) => {
                            const schedule = formatSchedule(classItem.schedule);
                            return (
                              <TableRow key={index} sx={commonStyles.tableRow}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                                    {classItem.className}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {classItem.teacherName || 'Chưa phân công'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {classItem.room || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {schedule.days}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                                    {schedule.time}
                              </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(classItem.status)}
                              color={getStatusColor(classItem.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                            );
                          })}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Chưa có lớp học nào
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
