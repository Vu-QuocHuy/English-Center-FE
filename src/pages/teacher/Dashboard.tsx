import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Alert,
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
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles } from '@shared/utils';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { StatCard } from '@shared/components';
import { getTeacherDashboardAPI } from '@shared/services';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>({
    totalStudent: 0,
    teachingClasses: 0,
    closedClasses: 0,
    upcomingClasses: 0,
    paymentInfo: [],
    activeClasses: [],
    recentlySalary: {}
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
      const teacherId = user?.teacherId || user?.id;
      if (!teacherId) {
        setError('Không tìm thấy thông tin giáo viên');
        setLoading(false);
        return;
      }

      const response = await getTeacherDashboardAPI(teacherId);
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalStudent: data.totalStudent || 0,
        teachingClasses: data.teachingClasses || 0,
        closedClasses: data.closedClasses || 0,
        upcomingClasses: data.upcomingClasses || 0,
        paymentInfo: data.paymentInfo || [],
        activeClasses: data.activeClasses || [],
        recentlySalary: data.recentlySalary || {}
      });

    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
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

  const formatMonthYear = (month: any, year: any) => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${monthNames[month - 1] || 'Tháng'} ${year}`;
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={{ py: 4 }}>
            <LinearProgress />
            <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
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
              Dashboard Giáo viên
            </Typography>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào <strong>{user?.name || 'Giáo viên'}</strong>, đây là thông tin giảng dạy của bạn
        </Typography>

        {/* Stat Cards - First Row */}
        <Grid container spacing={6} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đang dạy"
                value={dashboardData.teachingClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đã kết thúc"
                value={dashboardData.closedClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp sắp tới"
                value={dashboardData.upcomingClasses}
              icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
        </Grid>

          {/* Salary Stats */}
        <Grid container spacing={6} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng lương"
                value={formatCurrency(dashboardData.paymentInfo?.totalSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương đã nhận"
                value={formatCurrency(dashboardData.paymentInfo?.totalPaidAmount)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương chưa nhận"
                value={formatCurrency(dashboardData.paymentInfo?.totalUnPaidAmount)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
        </Grid>

        {/* Content Sections */}
        <Grid container spacing={4}>
          {/* Active Classes */}
          <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 1, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', bgcolor: '#fff', border: '1px solid #e0e0e0', mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Lớp học đang dạy
              </Typography>
                <Box mt={2} bgcolor="#f5f6fa" borderRadius={1} border="1px solid #e0e0e0" p={2}>
                  {dashboardData.activeClasses.length > 0 ? (
                    <TableContainer sx={commonStyles.tableContainer}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phòng học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.activeClasses.map((classItem: any, index: number) => {
                            const schedule = formatSchedule(classItem.schedule);
                            return (
                              <TableRow key={index} sx={commonStyles.tableRow}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {classItem.name}
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
                                    label="Đang dạy"
                                    color="success"
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Chưa có lớp học nào đang dạy
                    </Typography>
                  )}
                </Box>
            </Paper>
            </Grid>

          {/* Recent Salary */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 1, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', bgcolor: '#fff', border: '1px solid #e0e0e0', mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Lương tháng gần đây
              </Typography>
              {dashboardData.recentlySalary && Object.keys(dashboardData.recentlySalary).length > 0 ? (
                <Box mt={2} bgcolor="#f5f6fa" borderRadius={1} border="1px solid #e0e0e0" p={2}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Tháng/Năm</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Tổng buổi</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lương/buổi</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Tổng lương</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Đã thanh toán</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            {formatMonthYear(dashboardData.recentlySalary.month, dashboardData.recentlySalary.year)}
                          </TableCell>
                          <TableCell>
                            {dashboardData.recentlySalary.totalLessons || 0}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(dashboardData.recentlySalary.salaryPerLesson)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(
                              (dashboardData.recentlySalary.totalLessons || 0) *
                              (dashboardData.recentlySalary.salaryPerLesson || 0)
                            )}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(dashboardData.recentlySalary.paidAmount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Chưa có thông tin lương gần đây
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
