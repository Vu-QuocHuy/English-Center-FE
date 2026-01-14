import React, { useState, useEffect } from 'react';
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  LinearProgress,
  TextField,
  Paper,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { getTodaySessionAPI as getTodayAttendanceAPI, updateSessionAttendanceAPI } from '@shared/services';
import { NotificationSnackbar, BaseDialog } from '@shared/components';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
} as const;

type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

interface Student {
  id: string;
  name: string;
  status: AttendanceStatus;
  note: string;
}

interface Schedule {
  dayOfWeeks: number[];
}

interface ClassData {
  id: string;
  name: string;
  schedule?: Schedule;
}

interface AttendanceModalProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData | null;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface AttendanceRecord {
  [studentId: string]: AttendanceStatus;
}

interface AttendanceNotes {
  [studentId: string]: string;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  open,
  onClose,
  classData,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [attendanceNote, setAttendanceNote] = useState<AttendanceNotes>({});
  const [originalAttendance, setOriginalAttendance] = useState<AttendanceRecord>({});
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open && classData) {
      handleOpenAttendance();
    }
  }, [open, classData]);

  const handleOpenAttendance = async (): Promise<void> => {
    if (!classData?.id) return;

    // Kiểm tra xem lớp có lịch học hôm nay không
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

    if (!classData.schedule || !classData.schedule.dayOfWeeks) {
      setNotification({
        open: true,
        message: 'Lớp này chưa có lịch học được thiết lập',
        severity: 'warning'
      });
      onClose();
      return;
    }

    // Kiểm tra xem hôm nay có phải là ngày học của lớp không
    const hasClassToday = classData.schedule.dayOfWeeks.includes(dayOfWeek);

    if (!hasClassToday) {
      setNotification({
        open: true,
        message: `Lớp ${classData.name} không có lịch học vào ${['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dayOfWeek]}`,
        severity: 'warning'
      });
      onClose();
      return;
    }

    setLoading(true);
    try {
      console.log('Calling getTodayAttendanceAPI with classId:', classData.id);
      console.log('Class data:', classData);
      const res = await getTodayAttendanceAPI(classData.id);

      // Parse the API response structure
      const responseData = (res as any)?.data?.data || (res as any)?.data || {};
      const sessionData = responseData;

      setAttendanceId(sessionData?.id);

      const studentsList: Student[] = (sessionData?.attendances || []).map((att: any) => ({
        id: att.student?.id || '',
        name: att.student?.name || '',
        status: att.status || 'absent',
        note: att.note || ''
      }));

      // Sắp xếp theo tên riêng (từ cuối cùng)
      studentsList.sort((a, b) => {
        const lastA = a.name.trim().split(' ').pop() || '';
        const lastB = b.name.trim().split(' ').pop() || '';
        return lastA.localeCompare(lastB, 'vi');
      });
      setStudents(studentsList);

      // Khởi tạo trạng thái điểm danh
      const att: AttendanceRecord = {};
      const notes: AttendanceNotes = {};
      studentsList.forEach(s => {
        att[s.id] = s.status || ATTENDANCE_STATUS.ABSENT;
        notes[s.id] = s.note || '';
      });
      setAttendance(att);
      setOriginalAttendance(att); // Store original status for comparison
      setAttendanceNote(notes);
      setIsChanged(false);
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải dữ liệu điểm danh', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus): void => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setIsChanged(true);
  };

  const handleNoteChange = (studentId: string, note: string): void => {
    setAttendanceNote(prev => ({
      ...prev,
      [studentId]: note
    }));
    setIsChanged(true);
  };

  const handleSaveAttendance = async (): Promise<void> => {
    if (!isChanged) return;
    if (!attendanceId) {
      setNotification({ open: true, message: 'Không tìm thấy attendanceId', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const studentsBody = students.map(student => {
        const currentStatus = attendance[student.id] || ATTENDANCE_STATUS.ABSENT;
        const originalStatus = originalAttendance[student.id] || ATTENDANCE_STATUS.ABSENT;
        const isModified = currentStatus !== originalStatus;

        return {
          // Use string id from API (UUID). Avoid Number() which becomes NaN → null in JSON.
          studentId: student.id,
          status: currentStatus,
          isModified: isModified,
          note: attendanceNote[student.id] || undefined
        };
      });

      await updateSessionAttendanceAPI(attendanceId, studentsBody);
      setNotification({ open: true, message: 'Lưu điểm danh thành công', severity: 'success' });
      setIsChanged(false);
      onClose();
    } catch (err) {
      setNotification({ open: true, message: 'Không thể lưu điểm danh', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = () => {
    const present = Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.ABSENT).length;
    const late = Object.values(attendance).filter(status => status === ATTENDANCE_STATUS.LATE).length;
    const total = students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, rate };
  };

  const summary = getAttendanceSummary();

  return (
    <>
      <BaseDialog
        open={open}
        onClose={onClose}
        title="Điểm danh lớp học"
        subtitle={classData?.name}
        icon={<AssignmentIcon sx={{ fontSize: 28, color: 'white' }} />}
        maxWidth="md"
        loading={loading}
        contentPadding={0}
        hideDefaultAction={true}
        actions={
          <>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  bgcolor: 'rgba(102, 126, 234, 0.04)'
                },
                px: 3,
                py: 1,
                borderRadius: 2
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveAttendance}
              disabled={!isChanged || loading}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5a6fd8' },
                '&:disabled': { bgcolor: '#ccc' },
                px: 3,
                py: 1,
                borderRadius: 2
              }}
            >
              Lưu điểm danh
            </Button>
          </>
        }
      >
          {loading ? (
            <Box sx={{ py: 4, px: 4 }}>
              <LinearProgress />
              <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu...</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 4 }}>
              {/* Summary */}
              <Paper sx={{
                mb: 3,
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
                  Tổng quan điểm danh
                </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                      <strong style={{ color: '#27ae60' }}>Có mặt:</strong> {summary.present} ({summary.rate}%)
                  </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                      <strong style={{ color: '#e74c3c' }}>Vắng:</strong> {summary.absent}
                  </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                      <strong style={{ color: '#f39c12' }}>Đi muộn:</strong> {summary.late}
                  </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                    <strong>Tổng:</strong> {summary.total}
                  </Typography>
                </Box>
              </Box>
              </Paper>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Họ và Tên</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Có mặt</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đi muộn</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Vắng</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {student.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <input
                            type="radio"
                            id={`present-${student.id}`}
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === ATTENDANCE_STATUS.PRESENT}
                            onChange={() => handleStatusChange(student.id, ATTENDANCE_STATUS.PRESENT)}
                            style={{
                              transform: 'scale(1.3)',
                              accentColor: '#2e7d32'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <input
                            type="radio"
                            id={`late-${student.id}`}
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === ATTENDANCE_STATUS.LATE}
                            onChange={() => handleStatusChange(student.id, ATTENDANCE_STATUS.LATE)}
                            style={{
                              transform: 'scale(1.3)',
                              accentColor: '#ed6c02'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <input
                            type="radio"
                            id={`absent-${student.id}`}
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === ATTENDANCE_STATUS.ABSENT}
                            onChange={() => handleStatusChange(student.id, ATTENDANCE_STATUS.ABSENT)}
                            style={{
                              transform: 'scale(1.3)',
                              accentColor: '#d32f2f'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Ghi chú..."
                            value={attendanceNote[student.id] || ''}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
      </BaseDialog>

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default AttendanceModal;
