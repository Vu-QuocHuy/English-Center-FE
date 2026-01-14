import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { commonStyles } from '@shared/utils';
import { StatCard } from '@shared/components';
import { getParentDashboardAPI } from '@shared/services';
import { getStudentScheduleAPI } from '@features/students';
import { getParentByIdAPI } from '@features/parents';
import { getStudentStatus } from '@features/students';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // const [dashboardData, setDashboardData] = useState<any>(null);
  const [childrenSchedules, setChildrenSchedules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalChildren: 0,
    totalClasses: 0,
    totalFees: 0,
    paidFees: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (user) {
      fetchParentData();
    }
  }, [user]);

  const fetchParentData = async () => {
    setLoading(true);
    setError('');

    try {
      // Get parent ID from user data
      const parentId = (user as any)?.parentId || (user as any)?.id || localStorage.getItem('parent_id');

      if (!parentId) {
        setError('Không tìm thấy thông tin phụ huynh');
        setLoading(false);
        return;
      }

      // Call parent dashboard API
      const parentDashboardRes = await getParentDashboardAPI(parentId);
      const dash = (parentDashboardRes as any)?.data?.data || (parentDashboardRes as any)?.data || {};

      // Get full children list from parent detail API
      const parentDetailRes = await getParentByIdAPI(String(parentId));
      const parentPayload = (parentDetailRes as any)?.data?.data ?? (parentDetailRes as any)?.data ?? {};
      const students: Array<{ id: string; name?: string; email?: string }> =
        Array.isArray(parentPayload?.students) ? parentPayload.students : [];

      // Fetch schedules for each child
      const schedulesPromises = students.map(async (stu: any) => {
        try {
          const scheduleRes = await getStudentScheduleAPI(String(stu.id));
          const scheduleData = (scheduleRes as any)?.data?.data || (scheduleRes as any)?.data || {};
          // Normalize to array of schedules; support both array and object shapes
          const schedules = (scheduleData as any).schedules || (Array.isArray(scheduleData) ? scheduleData : []);
          const totalActiveClasses = (scheduleData as any).totalActiveClasses || 0;
          return {
            studentId: stu.id,
            studentName: stu.name || parentPayload?.name,
            studentEmail: stu.email || parentPayload?.email,
            schedules,
            totalActiveClasses,
          };
        } catch (err) {
          return {
            studentId: stu.id,
            studentName: stu.name || parentPayload?.name,
            studentEmail: stu.email || parentPayload?.email,
            schedules: [],
            totalActiveClasses: 0,
          };
        }
      });

      const childrenWithSchedules = await Promise.all(schedulesPromises);
      setChildrenSchedules(childrenWithSchedules);

      // Calculate statistics from dashboard data
      const paymentInfo = dash.paymentInfo || {};
      const calculatedStats = {
        totalChildren: dash.totalChildren || students.length || childrenWithSchedules.length || 0,
        totalClasses: childrenWithSchedules.reduce((total: number, child: any) => total + (child.totalActiveClasses || 0), 0),
        totalFees: paymentInfo.totalRevenue || 0,
        paidFees: paymentInfo.totalPaidAmount || 0,
        pendingPayments: paymentInfo.totalUnPaidAmount || 0,
      };
      setStats(calculatedStats);

    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      setStats({
        totalChildren: 0,
        totalClasses: 0,
        totalFees: 0,
        paidFees: 0,
        pendingPayments: 0,
      });
      setChildrenSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDayOfWeek = (dayNumber: any) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    // Support number or string day indices
    const idx = typeof dayNumber === 'string' ? Number(dayNumber) : dayNumber;
    return days[idx] || '';
  };

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Phụ huynh
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào {(user as any)?.name || (user as any)?.userId?.name || 'Phụ huynh'}, đây là thông tin học tập và thanh toán của con bạn
          </Typography>

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Số con"
                value={stats.totalChildren || 0}
                icon={<PersonIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng học phí"
                value={formatCurrency(stats.totalFees || 0)}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã thanh toán"
                value={formatCurrency(stats.paidFees || 0)}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Còn thiếu"
                value={formatCurrency(stats.pendingPayments || 0)}
                icon={<WarningIcon sx={{ fontSize: 40 }} />}
                color="error"
              />
            </Grid>
          </Grid>

          {/* Children Information with Schedules */}
          <Grid container spacing={3}>
            {childrenSchedules.map((child: any, childIndex: number) => (
              <Grid item xs={12} key={child.studentId || childIndex}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {child.studentName?.charAt(0)?.toUpperCase() || 'N'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {child.studentName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {child.studentEmail || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Child's Schedules */}
                  {child.schedules && child.schedules.length > 0 ? (
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
                          {child.schedules.map((scheduleItem: any, scheduleIndex: number) => (
                            <TableRow key={scheduleIndex} sx={commonStyles.tableRow}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {scheduleItem.class?.name || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Lớp {scheduleItem.class?.grade || ''} - Năm {scheduleItem.class?.year || ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {scheduleItem.teacher?.name
                                    || scheduleItem.class?.teacher?.name
                                    || scheduleItem.class?.teacher
                                    || 'Chưa phân công'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {scheduleItem.class?.room || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {(scheduleItem.class?.schedule?.days_of_week || scheduleItem.schedule?.dayOfWeeks || scheduleItem.schedule?.days_of_week || [])
                                    .map((d: any) => formatDayOfWeek(d)).join(', ')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {(scheduleItem.class?.schedule?.time_slots?.start_time || scheduleItem.schedule?.timeSlots?.startTime || scheduleItem.schedule?.time_slots?.start_time || '')}
                                  {' '}
                                  -
                                  {' '}
                                  {(scheduleItem.class?.schedule?.time_slots?.end_time || scheduleItem.schedule?.timeSlots?.endTime || scheduleItem.schedule?.time_slots?.end_time || '')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const statusConfig = getStudentStatus(
                                    scheduleItem.class?.status,
                                    scheduleItem.isActive === true
                                  );
                                  return (
                                    <Chip
                                      label={statusConfig.label}
                                      size="small"
                                      sx={{
                                        bgcolor: statusConfig.bgColor,
                                        color: statusConfig.color,
                                        fontWeight: 600,
                                      }}
                                    />
                                  );
                                })()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Chưa có lịch học nào
                    </Typography>
                  )}

                  {/* Payment Summary */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Tóm tắt thanh toán
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Tổng học phí: <strong>{formatCurrency(child.totalAmount || 0)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Đã thanh toán: <strong style={{ color: 'green' }}>{formatCurrency(child.totalPaidAmount || 0)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Còn thiếu: <strong style={{ color: 'red' }}>{formatCurrency(child.totalUnPaidAmount || 0)}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {childrenSchedules.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có con nào được đăng ký
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng liên hệ admin để thêm con vào hệ thống.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
