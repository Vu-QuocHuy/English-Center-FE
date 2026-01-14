import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  CardActions,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  DoneAll as DoneAllIcon,
  HourglassEmpty as HourglassEmptyIcon,
  WatchLater as WatchLaterIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { getTeacherScheduleAPI } from '@features/teachers';
import { ClassDetailModal, AttendanceModal, AttendanceHistoryModal } from '@features/teachers';
import { commonStyles } from '@shared/utils';
import { NotificationSnackbar, StatCard } from '@shared/components';

interface ScheduleOldShape {
  dayOfWeeks: number[];
  timeSlots?: {
    startTime?: string;
    endTime?: string;
  };
}

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ClassData {
  id: string;
  name: string;
  students?: Student[];
  studentCount?: number;
  schedule?: ScheduleOldShape;
  status: string;
  grade?: string;
  section?: string;
  room?: string;
  startDate?: string;
  endDate?: string;
  totalSessions?: number;
  completedSessions?: number;
  attendanceRate?: number;
}

interface MyClassesData {
  classes: ClassData[];
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  totalStudents: number;
}

type ClassStatus = 'active' | 'upcoming' | 'closed' | 'completed' | 'pending';

interface StatusConfig {
  label: string;
  color: 'success' | 'warning' | 'error' | 'default' | 'primary';
}

const STATUS_CONFIG: Record<ClassStatus, StatusConfig> = {
  active: { label: 'Đang dạy', color: 'success' },
  upcoming: { label: 'Sắp diễn ra', color: 'warning' },
  closed: { label: 'Đã kết thúc', color: 'error' },
  completed: { label: 'Hoàn thành', color: 'error' },
  pending: { label: 'Chờ', color: 'warning' }
};

const MyClasses: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [classesData, setClassesData] = useState<MyClassesData>({
    classes: [],
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    totalStudents: 0
  });

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  // Removed prefetch of today's session to avoid API call on page load

  // UI states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      fetchMyClasses();
    }
  }, [user]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 700);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const normalizeStatus = (status: string): ClassStatus => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'đang học') return 'active';
    if (statusLower === 'completed' || statusLower === 'hoàn thành') return 'completed';
    if (statusLower === 'pending' || statusLower === 'chờ') return 'pending';
    if (statusLower === 'upcoming' || statusLower === 'sắp diễn ra') return 'upcoming';
    if (statusLower === 'closed' || statusLower === 'đã kết thúc') return 'closed';
    return 'active'; // default
  };

  const getStatusConfig = (status: string): StatusConfig => {
    const normalizedStatus = normalizeStatus(status);
    return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.active;
  };

  const fetchMyClasses = async (): Promise<void> => {
    try {
      setLoading(true);
      const teacherId = (user as any)?.teacherId || (user as any)?.teacher?.teacher_id || user?.id;
      if (!teacherId) {
        throw new Error('Thiếu thông tin giáo viên');
      }

      const response = await getTeacherScheduleAPI(String(teacherId));
      const classes: ClassData[] = (response?.data?.classes || response?.data?.data || response?.data || []).map((item: any) => {
        const schedule = item?.schedule || {};
        const days: any[] = schedule.days_of_week || schedule.dayOfWeeks || [];
        const timeSlotsApi: any = schedule.time_slots || schedule.timeSlots || {};

        const scheduleOld: ScheduleOldShape | undefined = (days && days.length) || timeSlotsApi?.start_time || timeSlotsApi?.end_time
          ? {
              dayOfWeeks: days.map((d: any) => Number(d)),
              timeSlots: {
                startTime: (timeSlotsApi.start_time || timeSlotsApi.startTime || '').slice(0, 5) || undefined,
                endTime: (timeSlotsApi.end_time || timeSlotsApi.endTime || '').slice(0, 5) || undefined,
              }
            }
          : undefined;

        const status: string = item?.status || 'active';

        return {
          id: String(item?.id || item?.classId || item?._id || `${item?.name}-${Math.random()}`),
          name: item?.name || 'Lớp chưa đặt tên',
          students: item?.students,
          studentCount: item?.studentCount,
          schedule: scheduleOld,
          status,
          grade: item?.grade,
          section: item?.section,
          room: item?.room,
          startDate: schedule.start_date || schedule.startDate,
          endDate: schedule.end_date || schedule.endDate,
        } as ClassData;
      });

      const totalClasses: number = classes.length;
      let activeClasses: number = 0;
      let completedClasses: number = 0;
      let totalStudents: number = 0;

      for (const classItem of classes) {
        const normalizedStatus = normalizeStatus(classItem.status);
        if (normalizedStatus === 'active') activeClasses++;
        if (normalizedStatus === 'completed' || normalizedStatus === 'closed') completedClasses++;
        const count = classItem.studentCount || (classItem.students ? classItem.students.length : 0) || 0;
        totalStudents += count;
      }

      setClassesData({
        classes,
        totalClasses,
        activeClasses,
        completedClasses,
        totalStudents
      });

      // Do not prefetch today's sessions here; we'll compute locally per class for UI
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for modals
  const handleOpenDetail = (classItem: ClassData): void => {
    setSelectedClass(classItem);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = (): void => {
    setDetailModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenAttendance = (classItem: ClassData): void => {
    setSelectedClass(classItem);
    setAttendanceModalOpen(true);
  };

  const handleCloseAttendance = (): void => {
    setAttendanceModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenHistory = (classItem: ClassData): void => {
    setSelectedClass(classItem);
    setHistoryModalOpen(true);
  };

  const handleCloseHistory = (): void => {
    setHistoryModalOpen(false);
    setSelectedClass(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setSelectedTab(newValue);
  };

  const formatSchedule = (schedule?: ScheduleOldShape): string => {
    if (!schedule) return '';
    const days = (schedule.dayOfWeeks || [])
      .map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d])
      .join(', ');
    const time = schedule.timeSlots?.startTime && schedule.timeSlots?.endTime
      ? `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`
      : '';
    return `${days}${time ? ' | ' + time : ''}`;
  };

  const filteredClasses = useMemo(() => {
    const base = classesData.classes || [];
    const q = debouncedSearchQuery.trim().toLowerCase();
    let filtered = q ? base.filter(c => c.name?.toLowerCase().includes(q)) : base;

    const statusFilters: ClassStatus[] = ['active', 'upcoming', 'closed'];
    if (selectedTab < statusFilters.length) {
      filtered = filtered.filter(classItem => normalizeStatus(classItem.status) === statusFilters[selectedTab]);
    }
    return filtered;
  }, [classesData.classes, debouncedSearchQuery, selectedTab]);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>Quản lý lớp dạy</Typography>
          </Box>

          {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Tổng số lớp" value={classesData.totalClasses} icon={<SchoolIcon sx={{ fontSize: 40 }} />} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Đang dạy" value={classesData.activeClasses} icon={<HourglassEmptyIcon sx={{ fontSize: 40 }} />} color="success" />
          </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Sắp diễn ra" value={Math.max(classesData.totalClasses - classesData.activeClasses - classesData.completedClasses, 0)} icon={<WatchLaterIcon sx={{ fontSize: 40 }} />} color="warning" />
          </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Lớp đã kết thúc" value={classesData.completedClasses} icon={<DoneAllIcon sx={{ fontSize: 40 }} />} color="primary" />
          </Grid>
          </Grid>

          {/* Search */}
          <Paper sx={commonStyles.searchContainer}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên lớp học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={commonStyles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* Tabs */}
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }} variant="fullWidth">
            <Tab label="Đang dạy" />
            <Tab label="Sắp diễn ra" />
            <Tab label="Đã kết thúc" />
          </Tabs>

          {/* Class Cards Grid */}
        <Grid container spacing={3}>
            {filteredClasses.map((classItem) => {
              const statusConfig = getStatusConfig(classItem.status);
              const isActive = normalizeStatus(classItem.status) === 'active';
              // Compute hasSessionToday locally without API: check schedule day
              const todayIdx = new Date().getDay();
              const hasSessionToday = !!classItem.schedule?.dayOfWeeks?.includes(todayIdx);

              return (
                <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                    <Chip
                        label={statusConfig.label}
                        color={statusConfig.color}
                      size="small"
                        sx={{ mb: 1.5 }}
                      />
                      <Typography variant="h6" component="div" gutterBottom>
                        {classItem.name}
                        </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                        <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">Khối {classItem.grade} - Phần {classItem.section}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                        <EventIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{formatSchedule(classItem.schedule)}</Typography>
                    </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                        <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">Phòng {classItem.room}</Typography>
                    </Box>
                </CardContent>
                <CardActions>
                      <Button size="small" onClick={() => handleOpenDetail(classItem)}>Xem chi tiết</Button>
                      {(isActive || normalizeStatus(classItem.status) === 'closed') && (
                        <Tooltip title="Xem lịch sử điểm danh">
                          <Button size="small" startIcon={<HistoryIcon />} onClick={() => handleOpenHistory(classItem)}>
                            Lịch sử điểm danh
                  </Button>
                        </Tooltip>
                      )}
                      {isActive && hasSessionToday && (
                        <Tooltip title="Điểm danh buổi học hôm nay">
                          <Button size="small" startIcon={<AssignmentIcon />} onClick={() => handleOpenAttendance(classItem)}>
                            Điểm danh
                  </Button>
                        </Tooltip>
                      )}
                </CardActions>
              </Card>
            </Grid>
              );
            })}
        </Grid>

          {filteredClasses.length === 0 && (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
              Không tìm thấy lớp học nào.
            </Typography>
          )}

          {/* Modals */}
          <ClassDetailModal open={detailModalOpen} onClose={handleCloseDetail} classData={selectedClass as any} />
          <AttendanceModal open={attendanceModalOpen} onClose={handleCloseAttendance} classData={selectedClass as any} />
          <AttendanceHistoryModal open={historyModalOpen} onClose={handleCloseHistory} classData={selectedClass as any} />

          {/* Notification */}
          <NotificationSnackbar
            open={notification.open}
            onClose={() => setNotification({ ...notification, open: false })}
            message={notification.message}
            severity={notification.severity}
            autoHideDuration={6000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          />
          </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;