import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Collapse,
  IconButton,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Percent as PercentIcon,
  AttachMoney as AttachMoneyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MeetingRoom as RoomIcon,
} from '@mui/icons-material';
import { BaseDialog } from '@shared/components';
import { getStudentStatus } from '@features/students';
import { getCurrentClassesForChild, getPastClassesForChild } from '@features/parents';
import ChildClassAttendance from './ChildClassAttendance';

interface ChildClass {
  id?: string;
  name: string;
  teacher?: string;
  schedule?: any;
  status: string;
  grade?: string;
  section?: string;
  attendanceRate?: number;
  progress?: number;
  classId?: string;
  isActive?: boolean;
  discountPercent?: number;
}

interface Child {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  grade?: string;
  section?: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendanceRate?: number;
  classes: ChildClass[];
  studentId?: string;
}

interface ChildDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  child: Child | null;
  loading: boolean;
  classDetails: Record<string, any>;
  attendanceData: any;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getGenderLabel = (gender?: string): string => {
  if (!gender) return 'Chưa cập nhật';
  const g = gender.toString().toLowerCase();
  if (g === 'male' || g === 'nam') return 'Nam';
  if (g === 'female' || g === 'nữ' || g === 'nu') return 'Nữ';
  if (g === 'other' || g === 'khác') return 'Khác';
  return gender;
};

const ChildDetailsDialog: React.FC<ChildDetailsDialogProps> = ({
  open,
  onClose,
  child,
  loading,
  classDetails,
  attendanceData,
}) => {
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [tabValue, setTabValue] = useState<number>(0);

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Chi tiết học sinh"
      subtitle={child?.name}
      icon={<PersonIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      loading={loading}
      contentPadding={0}
    >
      <Box sx={{ p: 4 }}>
        {loading && (
          <Box sx={{ py: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {child && (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={(_event, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Thông tin con" />
                <Tab label="Lớp đang học" />
                <Tab label="Lớp đã học" />
              </Tabs>
            </Box>

            {/* Tab 1: Thông tin con */}
            {tabValue === 0 && (
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Thông tin con
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Họ và tên
                      </Typography>
                      <Typography variant="body1">
                        {child.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Giới tính
                      </Typography>
                      <Typography variant="body1">
                        {getGenderLabel(child.gender)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Ngày sinh
                      </Typography>
                      <Typography variant="body1">
                        {child.dateOfBirth ? formatDate(child.dateOfBirth) : 'Chưa cập nhật'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1">
                        {child.address || 'Chưa cập nhật'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1">
                        {child.phone || 'Chưa có số điện thoại'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {child.email || 'Chưa có email'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tổng lớp học
                      </Typography>
                      <Typography variant="body1">
                        {child.totalClasses}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Lớp đang học
                      </Typography>
                      <Typography variant="body1">
                        {getCurrentClassesForChild(child, classDetails).length}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Lớp đã học
                      </Typography>
                      <Typography variant="body1">
                        {getPastClassesForChild(child, classDetails).length}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* Tab 2: Lớp đang học */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                  Lớp đang học
                </Typography>
                {(() => {
                  const currentClasses = getCurrentClassesForChild(child, classDetails);

                  if (currentClasses.length === 0) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        Hiện tại không có lớp nào đang học.
                      </Typography>
                    );
                  }

                  return (
                    <Grid container spacing={2}>
                      {currentClasses.map((classDetail: any) => {
                        const classData = classDetail.classData;
                        const classId = classDetail.classId;
                        const expanded = expandedClasses[classId] || false;

                        return (
                          <Grid item xs={12} key={classId}>
                            <Card sx={{ mb: 2 }}>
                              <CardContent>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => setExpandedClasses(prev => ({
                                    ...prev,
                                    [classId]: !prev[classId]
                                  }))}
                                >
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                      Lớp {classData.name || 'Không xác định'}
                                    </Typography>
                                    {(() => {
                                      const enrollment = (child as any)?.classes?.find((c: any) =>
                                        (c.id === classId || c.classId === classId)
                                      );
                                      const statusConfig = getStudentStatus(
                                        classData.status,
                                        enrollment?.isActive === true
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
                                    <Chip
                                      label={`Khối ${classData.grade || 'N/A'}`}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Box>
                                  <IconButton size="small">
                                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                </Box>

                                <Collapse in={expanded}>
                                  <Divider sx={{ my: 2 }} />

                                  {/* Thông tin cơ bản */}
                                  <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                      Thông tin cơ bản
                                    </Typography>
                                    <Grid container spacing={3}>
                                      {/* Room */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <RoomIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Phòng học
                                            </Typography>
                                          </Box>
                                          <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                            {classData.room || 'Chưa xác định'}
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      {/* Fee */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <AttachMoneyIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Học phí / buổi
                                            </Typography>
                                          </Box>
                                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main', pl: 3 }}>
                                            {classData.feePerLesson
                                              ? `${classData.feePerLesson.toLocaleString('vi-VN')} ₫`
                                              : 'Chưa xác định'}
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      {/* Discount */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <PercentIcon sx={{ fontSize: 18, mr: 0.5, color: 'warning.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Giảm giá
                                            </Typography>
                                          </Box>
                                          {(() => {
                                            const originalClass = (child as any)?.classes?.find((c: any) =>
                                              (c.id === classId || c.classId === classId)
                                            );
                                            const discountPercent = originalClass?.discountPercent;

                                            return (
                                              <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 600, pl: 3 }}
                                                color={discountPercent ? "warning.main" : "text.secondary"}
                                              >
                                                {discountPercent ? `${discountPercent}%` : 'Không có'}
                                              </Typography>
                                            );
                                          })()}
                                        </Box>
                                      </Grid>

                                      {/* Teacher */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Giáo viên
                                            </Typography>
                                          </Box>
                                          <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                            {classData.teacher?.name || 'Chưa phân công'}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Paper>

                                  {/* Lịch học */}
                                  <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <ScheduleIcon sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Lịch học
                                      </Typography>
                                    </Box>
                                    {classData.schedule ? (
                                      <Grid container spacing={2}>
                                        {/* Days of week */}
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Ngày học trong tuần
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {(() => {
                                              const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                                              const daysArr = classData.schedule.days_of_week || classData.schedule.dayOfWeeks || [];
                                              return Array.isArray(daysArr)
                                                ? daysArr.map((d: any) => dayNames[d] || '').filter(Boolean).join(', ') || '-'
                                                : '-';
                                            })()}
                                          </Typography>
                                        </Grid>

                                        {/* Time slots */}
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Giờ học
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {(() => {
                                              const startTime = classData.schedule.time_slots?.start_time || classData.schedule.timeSlots?.startTime;
                                              const endTime = classData.schedule.time_slots?.end_time || classData.schedule.timeSlots?.endTime;
                                              return startTime && endTime ? `${startTime} - ${endTime}` : '-';
                                            })()}
                                          </Typography>
                                        </Grid>

                                        {/* Duration */}
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Thời gian học
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {(() => {
                                              const startDate = classData.schedule.start_date || classData.schedule.startDate;
                                              const endDate = classData.schedule.end_date || classData.schedule.endDate;
                                              return startDate && endDate
                                                ? `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
                                                : '-';
                                            })()}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        Chưa có lịch học
                                      </Typography>
                                    )}
                                  </Paper>

                                  {/* Description */}
                                  {classData.description && (
                                    <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                        <DescriptionIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                          Mô tả lớp học
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                                        {classData.description}
                                      </Typography>
                                    </Paper>
                                  )}

                                  {/* Thông tin điểm danh cho lớp này */}
                                  {attendanceData && attendanceData.sessions && (
                                    <>
                                      <Divider sx={{ my: 3 }} />
                                      <ChildClassAttendance
                                        classId={classId}
                                        attendanceData={attendanceData}
                                      />
                                    </>
                                  )}
                                </Collapse>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  );
                })()}
              </Box>
            )}

            {/* Tab 3: Lớp đã học (đã hoàn thành & đã nghỉ) */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                  Lớp đã học
                </Typography>
                {(() => {
                  const pastClasses = getPastClassesForChild(child, classDetails);

                  if (pastClasses.length === 0) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có lớp nào đã học.
                      </Typography>
                    );
                  }

                  return (
                    <Grid container spacing={2}>
                      {pastClasses.map((classDetail: any) => {
                        const classData = classDetail.classData;
                        const classId = classDetail.classId;
                        const expanded = expandedClasses[classId] || false;

                        return (
                          <Grid item xs={12} key={classId}>
                            <Card sx={{ mb: 2 }}>
                              <CardContent>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => setExpandedClasses(prev => ({
                                    ...prev,
                                    [classId]: !prev[classId]
                                  }))}
                                >
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                      Lớp {classData.name || 'Không xác định'}
                                    </Typography>
                                    {(() => {
                                      const enrollment = (child as any)?.classes?.find((c: any) =>
                                        (c.id === classId || c.classId === classId)
                                      );
                                      const statusConfig = getStudentStatus(
                                        classData.status,
                                        enrollment?.isActive === true
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
                                    <Chip
                                      label={`Khối ${classData.grade || 'N/A'}`}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Box>
                                  <IconButton size="small">
                                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                </Box>

                                <Collapse in={expanded}>
                                  <Divider sx={{ my: 2 }} />

                                  {/* Thông tin cơ bản */}
                                  <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                      Thông tin cơ bản
                                    </Typography>
                                    <Grid container spacing={3}>
                                      {/* Room */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <RoomIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Phòng học
                                            </Typography>
                                          </Box>
                                          <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                            {classData.room || 'Chưa xác định'}
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      {/* Fee */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <AttachMoneyIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Học phí / buổi
                                            </Typography>
                                          </Box>
                                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main', pl: 3 }}>
                                            {classData.feePerLesson
                                              ? `${classData.feePerLesson.toLocaleString('vi-VN')} ₫`
                                              : 'Chưa xác định'}
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      {/* Discount */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <PercentIcon sx={{ fontSize: 18, mr: 0.5, color: 'warning.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Giảm giá
                                            </Typography>
                                          </Box>
                                          {(() => {
                                            const originalClass = (child as any)?.classes?.find((c: any) =>
                                              (c.id === classId || c.classId === classId)
                                            );
                                            const discountPercent = originalClass?.discountPercent;

                                            return (
                                              <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 600, pl: 3 }}
                                                color={discountPercent ? "warning.main" : "text.secondary"}
                                              >
                                                {discountPercent ? `${discountPercent}%` : 'Không có'}
                                              </Typography>
                                            );
                                          })()}
                                        </Box>
                                      </Grid>

                                      {/* Teacher */}
                                      <Grid item xs={12} sm={6} md={3}>
                                        <Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              Giáo viên
                                            </Typography>
                                          </Box>
                                          <Typography variant="body1" sx={{ fontWeight: 600, pl: 3 }}>
                                            {classData.teacher?.name || 'Chưa phân công'}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Paper>

                                  {/* Lịch học */}
                                  <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <ScheduleIcon sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Lịch học
                                      </Typography>
                                    </Box>
                                    {classData.schedule ? (
                                      <Grid container spacing={2}>
                                        {/* Days of week */}
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Ngày học trong tuần
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {(() => {
                                              const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                                              const daysArr = classData.schedule.days_of_week || classData.schedule.dayOfWeeks || [];
                                              return Array.isArray(daysArr)
                                                ? daysArr.map((d: any) => dayNames[d] || '').filter(Boolean).join(', ') || '-'
                                                : '-';
                                            })()}
                                          </Typography>
                                        </Grid>

                                        {/* Time slots */}
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Giờ học
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {(() => {
                                              const startTime = classData.schedule.time_slots?.start_time || classData.schedule.timeSlots?.startTime;
                                              const endTime = classData.schedule.time_slots?.end_time || classData.schedule.timeSlots?.endTime;
                                              return startTime && endTime ? `${startTime} - ${endTime}` : '-';
                                            })()}
                                          </Typography>
                                        </Grid>

                                        {/* Duration */}
                                        <Grid item xs={12} md={4}>
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            Thời gian học
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {(() => {
                                              const startDate = classData.schedule.start_date || classData.schedule.startDate;
                                              const endDate = classData.schedule.end_date || classData.schedule.endDate;
                                              return startDate && endDate
                                                ? `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
                                                : '-';
                                            })()}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        Chưa có lịch học
                                      </Typography>
                                    )}
                                  </Paper>

                                  {/* Description */}
                                  {classData.description && (
                                    <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                        <DescriptionIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                          Mô tả lớp học
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                                        {classData.description}
                                      </Typography>
                                    </Paper>
                                  )}

                                  {/* Thông tin điểm danh cho lớp này */}
                                  {attendanceData && attendanceData.sessions && (
                                    <>
                                      <Divider sx={{ my: 3 }} />
                                      <ChildClassAttendance
                                        classId={classId}
                                        attendanceData={attendanceData}
                                      />
                                    </>
                                  )}
                                </Collapse>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  );
                })()}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default ChildDetailsDialog;