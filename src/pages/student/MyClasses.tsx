import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { COLORS } from "@shared/utils";
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import { useAuth } from '../../contexts/AuthContext';
import { StudentMyClassesTable, useStudentMyClasses } from '@features/students';
import { StatCard } from '@shared/components';
import StudentClassDetailDialog from '@features/students/components/StudentClassDetailDialog';

const MyClasses = () => {
  const { user } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    selectedTab,
    handleTabChange,
    classes,
    filteredClasses,
    loading,
    dashboardData,
    openDialog,
    selectedClass,
    classDetailLoading,
    attendanceInfo,
    attendanceLoading,
    handleOpenDialog,
    handleCloseDialog,
  } = useStudentMyClasses(user);

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


  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, color: `${COLORS.primary}`, fontWeight: 600 }}>
            Thông tin học tập
          </Typography>

          <Grid container spacing={3}>
            {/* Stat Cards */}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số lớp"
                    value={dashboardData.totalClasses || classes.length}
                    icon={<SchoolIcon sx={{ fontSize: 40 }} />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Đang học"
                    value={dashboardData.activeClasses || classes.filter((c) => c.status === 'active').length}
                    icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Đã kết thúc"
                    value={dashboardData.completedClasses || classes.filter((c) => c.status === 'closed' || c.status === 'completed').length}
                    icon={<CancelIcon sx={{ fontSize: 40 }} />}
                    color="info"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tỷ lệ tham gia"
                    value={typeof dashboardData.attendance.attendanceRate === 'number' ? `${dashboardData.attendance.attendanceRate}%` : ''}
                    icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                    color="warning"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số buổi"
                    value={dashboardData.attendance.totalSessions}
                    icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                    color="secondary"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Buổi có mặt"
                    value={dashboardData.attendance.presentSessions}
                    icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Buổi vắng"
                    value={dashboardData.attendance.absentSessions}
                    icon={<CancelIcon sx={{ fontSize: 40 }} />}
                    color="error"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Buổi muộn"
                    value={dashboardData.attendance.lateSessions}
                    icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                    color="warning"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Danh sách lớp học */}
            <Grid item xs={12}>
              <Paper sx={{ p: 0, mb: 3, boxShadow: 'none', background: 'transparent' }}>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm lớp học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: '100%', background: '#fff', borderRadius: 2, boxShadow: 1 }}
                  />
                </Box>
              </Paper>

              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                sx={{ mb: 2, width: '100%' }}
                TabIndicatorProps={{ sx: { height: 4, borderRadius: 2 } }}
              >
                <Tab label="Đang học" sx={{ width: '33.33%' }} />
                <Tab label="Sắp khai giảng" sx={{ width: '33.33%' }} />
                <Tab label="Đã kết thúc" sx={{ width: '33.33%' }} />
              </Tabs>

              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <LinearProgress />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Đang tải dữ liệu lớp học...
                  </Typography>
                </Box>
              ) : filteredClasses.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchQuery ? 'Không tìm thấy lớp học phù hợp' :
                     selectedTab === 0 ? 'Chưa có lớp học nào đang diễn ra' :
                     selectedTab === 1 ? 'Chưa có lớp học nào đã kết thúc' :
                     'Chưa có lớp học nào sắp khai giảng'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Vui lòng liên hệ admin để được phân lớp'}
                  </Typography>
                </Box>
              ) : (
                <StudentMyClassesTable
                  classes={filteredClasses}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  onViewDetails={handleOpenDialog}
                />
              )}
            </Grid>
          </Grid>

          {/* Dialog xem chi tiết lớp học */}
          <StudentClassDetailDialog
            open={openDialog}
            onClose={handleCloseDialog}
            selectedClass={selectedClass}
            classDetailLoading={classDetailLoading}
            attendanceInfo={attendanceInfo}
            attendanceLoading={attendanceLoading}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;