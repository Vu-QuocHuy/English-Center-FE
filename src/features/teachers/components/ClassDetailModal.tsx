import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { getClassByIdAPI, updateStudentStatusAPI } from '@features/classes';
import AttendanceModal from './AttendanceModal';
import { BaseDialog } from '@shared/components';

interface Schedule {
  dayOfWeeks: number[];
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
}

interface Teacher {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface ClassData {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  status?: string;
  teacherId?: Teacher;
  schedule?: Schedule;
  capacity?: number;
  currentStudents?: number;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  isActive?: boolean;
}

interface ClassDetailModalProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`class-detail-tabpanel-${index}`}
      aria-labelledby={`class-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `class-detail-tab-${index}`,
    'aria-controls': `class-detail-tabpanel-${index}`,
  };
}

const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  open,
  onClose,
  classData
}) => {
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassData | null>(null);
  const [studentsDetail, setStudentsDetail] = useState<Student[]>([]);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [detailTabValue, setDetailTabValue] = useState<number>(0);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<{ [studentId: string]: boolean }>({});

  useEffect(() => {
    if (open && classData) {
      handleOpenDetail();
    }
  }, [open, classData]);

  const handleOpenDetail = async (): Promise<void> => {
    if (!classData?.id) return;

    setLoadingDetail(true);
    try {
      // Lấy thông tin chi tiết lớp học
      const classRes = await getClassByIdAPI(classData.id);
      const payload = (classRes as any)?.data?.data || (classRes as any)?.data || {};

      const normalizedSchedule = payload?.schedule ? {
        dayOfWeeks: (payload.schedule.days_of_week || []).map((d: any) => Number(d)),
        startTime: payload.schedule.time_slots?.start_time || payload.schedule.start_time,
        endTime: payload.schedule.time_slots?.end_time || payload.schedule.end_time,
        startDate: payload.schedule.start_date,
        endDate: payload.schedule.end_date,
      } : undefined;

      const normalizedClass = {
        id: payload.id,
        name: payload.name,
        grade: payload.grade,
        section: payload.section,
        status: payload.status,
        teacherId: payload.teacher ? {
          id: payload.teacher.id,
          name: payload.teacher.name,
          email: payload.teacher.email
        } : undefined,
        schedule: normalizedSchedule,
        capacity: payload.max_student,
        currentStudents: Array.isArray(payload.students) ? payload.students.length : undefined,
        description: payload.description,
      } as any;

      setSelectedClassDetail(normalizedClass);

      // Lấy danh sách học sinh từ response data.students
      setLoadingStudents(true);
      const mappedStudents: Student[] = Array.isArray(payload?.students)
        ? payload.students.map((s: any) => ({
            id: s?.student?.id,
            name: s?.student?.name,
            email: s?.student?.email,
            phone: s?.student?.phone,
            // Map trạng thái từ API: isActive (boolean) -> 'active' | 'inactive'
            status: s?.isActive ? 'active' : 'inactive',
            isActive: s?.isActive ?? true,
          }))
        : [];
      setStudentsDetail(mappedStudents);
    } catch (err) {
      console.error('Error loading class details:', err);
    } finally {
      setLoadingDetail(false);
      setLoadingStudents(false);
    }
  };

  const handleDetailTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setDetailTabValue(newValue);
  };

  const handleCloseAttendance = (): void => {
    setAttendanceModalOpen(false);
  };

  const handleToggleStudentStatus = async (studentId: string, currentStatus: boolean): Promise<void> => {
    if (!selectedClassDetail?.id) return;
    
    setUpdatingStatus(prev => ({ ...prev, [studentId]: true }));
    try {
      await updateStudentStatusAPI(selectedClassDetail.id, studentId, !currentStatus);
      
      // Cập nhật lại danh sách học sinh
      setStudentsDetail(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, isActive: !currentStatus, status: !currentStatus ? 'active' : 'inactive' }
          : student
      ));
    } catch (error) {
      console.error('Error updating student status:', error);
      // Có thể thêm thông báo lỗi ở đây
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const formatDate = (iso?: string): string => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  };

  const getStatusColor = (status: string | undefined): 'success' | 'warning' | 'error' | 'default' | 'primary' => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'upcoming': return 'warning';
      case 'closed': return 'error';
      case 'completed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string | undefined): string => {
    switch (status) {
      case 'active': return 'Đang dạy';
      case 'inactive': return 'Tạm dừng';
      case 'upcoming': return 'Sắp diễn ra';
      case 'closed': return 'Đã kết thúc';
      case 'completed': return 'Đã hoàn thành';
      default: return 'Không xác định';
    }
  };

  return (
    <>
      <BaseDialog
        open={open}
        onClose={onClose}
        title="Chi tiết lớp học"
        subtitle={selectedClassDetail?.name || classData?.name}
        icon={<SchoolIcon sx={{ fontSize: 28, color: 'white' }} />}
        maxWidth="md"
        loading={loadingDetail}
        contentPadding={0}
        hideDefaultAction={false}
        defaultActionText="Đóng"
      >
          {loadingDetail ? (
            <Box sx={{ py: 4, px: 4 }}>
              <LinearProgress />
              <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải chi tiết lớp học...</Typography>
            </Box>
          ) : (
            <Box>
              <Tabs
                value={detailTabValue}
                onChange={handleDetailTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab
                  label="Thông tin chung"
                  icon={<SchoolIcon />}
                  iconPosition="start"
                  {...a11yProps(0)}
                />
                <Tab
                  label="Danh sách học sinh"
                  icon={<PeopleIcon />}
                  iconPosition="start"
                  {...a11yProps(1)}
                />
                {/* Removed Lịch học tab; schedule moved into Thông tin chung */}
              </Tabs>

              <TabPanel value={detailTabValue} index={0}>
                {selectedClassDetail && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                          Thông tin cơ bản
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Tên lớp:</Typography>
                            <Typography variant="body1" fontWeight="medium">{selectedClassDetail.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Khối - Phần:</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              Khối {selectedClassDetail.grade} - Phần {selectedClassDetail.section}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Trạng thái:</Typography>
                            <Chip
                              label={getStatusLabel(selectedClassDetail.status)}
                              color={getStatusColor(selectedClassDetail.status)}
                              size="small"
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Số lượng học sinh:</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedClassDetail.currentStudents || 0} học sinh
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {selectedClassDetail.schedule && (
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                            Lịch học
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Ngày học trong tuần:</Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedClassDetail.schedule.dayOfWeeks?.map(day => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day]).join(', ') || 'Chưa có lịch'}
                              </Typography>
                            </Box>
                            {selectedClassDetail.schedule.startTime && selectedClassDetail.schedule.endTime && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Giờ học:</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {selectedClassDetail.schedule.startTime} - {selectedClassDetail.schedule.endTime}
                                </Typography>
                              </Box>
                            )}
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Thời gian học</Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedClassDetail.schedule.startDate && selectedClassDetail.schedule.endDate
                                  ? `${formatDate(selectedClassDetail.schedule.startDate)} - ${formatDate(selectedClassDetail.schedule.endDate)}`
                                  : 'Chưa có thông tin'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {selectedClassDetail.description && (
                      <Grid item xs={12} md={12}>
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                            Mô tả
                          </Typography>
                          <Typography variant="body1">{selectedClassDetail.description}</Typography>
                        </Paper>
                      </Grid>
                    )}



                  </Grid>
                )}
              </TabPanel>

              <TabPanel value={detailTabValue} index={1}>
                {loadingStudents ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LinearProgress />
                    <Typography sx={{ mt: 2 }}>Đang tải danh sách học sinh...</Typography>
                  </Box>
                ) : studentsDetail.length > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                        Danh sách học sinh ({studentsDetail.length})
                      </Typography>
                    </Box>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>STT</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Họ và tên</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Số điện thoại</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50', width: '200px' }}>Trạng thái học tập</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentsDetail.map((student, index) => (
                            <TableRow key={student.id} hover>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight="medium">
                                  {student.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{student.email || 'Không có'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{student.phone || 'Không có'}</Typography>
                              </TableCell>
                              <TableCell sx={{ width: '200px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: selectedClassDetail?.status === 'closed' || selectedClassDetail?.status === 'completed' ? 'flex-start' : 'space-between' }}>
                                <Chip
                                    label={student.isActive ? 'Đang học' : 'Nghỉ giữa chừng'}
                                    color={student.isActive ? 'success' : 'default'}
                                    size="small"
                                    sx={{ minWidth: 100 }}
                                  />
                                  {(selectedClassDetail?.status !== 'closed' && selectedClassDetail?.status !== 'completed') && (
                                  <Tooltip title={student.isActive ? 'Đang học - Click để đánh dấu nghỉ giữa chừng' : 'Nghỉ giữa chừng - Click để đánh dấu đang học'}>
                                    <Switch
                                      checked={student.isActive ?? true}
                                      onChange={() => handleToggleStudentStatus(student.id, student.isActive ?? true)}
                                      disabled={updatingStatus[student.id]}
                                      color="primary"
                                  size="small"
                                />
                                  </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Chưa có học sinh
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lớp học này chưa có học sinh nào được ghi danh.
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              {/* Removed Lịch học tab; schedule moved into Thông tin chung */}
            </Box>
          )}
      </BaseDialog>

      {/* Attendance Modal */}
      <AttendanceModal
        open={attendanceModalOpen}
        onClose={handleCloseAttendance}
        classData={selectedClassDetail || classData}
      />
    </>
  );
};

export default ClassDetailModal;
