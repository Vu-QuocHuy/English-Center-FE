import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Paper,
} from '@mui/material';
import {
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { getAttendanceListAPI } from '@shared/services';
import { BaseDialog } from '@shared/components';

interface StudentAttendance {
  name: string;
  status: 'present' | 'absent' | 'late';
}

interface AttendanceRecord {
  date: string;
  students: StudentAttendance[];
}

interface ClassData {
  id: string;
  name: string;
  grade?: string;
  section?: string;
}

interface AttendanceHistoryModalProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData | null;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

interface ExpandedRows {
  [index: number]: boolean;
}

const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({
  open,
  onClose,
  classData
}) => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

  useEffect(() => {
    if (open && classData) {
      handleOpenHistory();
    }
  }, [open, classData]);

  const handleOpenHistory = async (): Promise<void> => {
    if (!classData?.id) return;

    setLoading(true);
    try {
      const res = await getAttendanceListAPI({
        classId: classData.id,
        limit: 50,
        page: 1
      });

      // Parse the API response structure
      const responseData = (res as any)?.data?.data || (res as any)?.data || {};
      const attendanceRecords = responseData?.result || [];

      // Transform to match the expected interface
      const transformedHistory: AttendanceRecord[] = attendanceRecords.map((record: any) => ({
        date: record.date,
        students: record.attendances?.map((att: any) => ({
          name: att.student?.name || '',
          status: att.status || 'absent'
        })) || []
      }));

      setAttendanceHistory(transformedHistory);
    } catch (err) {
      console.error('Error loading attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = (attendance: AttendanceRecord): AttendanceSummary => {
    if (!attendance?.students) return { present: 0, absent: 0, late: 0, total: 0, rate: 0 };

    const present = attendance.students.filter(s => s.status === 'present').length;
    const absent = attendance.students.filter(s => s.status === 'absent').length;
    const late = attendance.students.filter(s => s.status === 'late').length;
    const total = attendance.students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, rate };
  };

  const handleToggleRow = (index: number): void => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'absent': return 'Vắng';
      case 'late': return 'Đi muộn';
      default: return 'Không xác định';
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Lịch sử điểm danh"
      subtitle={`${classData?.name} - Khối ${classData?.grade} - Phần ${classData?.section}`}
      icon={<HistoryIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      loading={loading}
      contentPadding={0}
    >
        {loading ? (
          <Box sx={{ py: 4, px: 4 }}>
            <LinearProgress />
            <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải lịch sử điểm danh...</Typography>
          </Box>
        ) : attendanceHistory.length > 0 ? (
          <Box sx={{ p: 4 }}>
            <Paper sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              
          <TableContainer>
            <Table>
              <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ngày</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Có mặt</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Vắng</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Đi muộn</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Tỷ lệ tham gia</TableCell>
                      <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceHistory.map((attendance, index) => {
                  const summary = getAttendanceSummary(attendance);
                  const isExpanded = expandedRows[index];

                  return (
                    <React.Fragment key={index}>
                          <TableRow
                            hover
                            onClick={() => handleToggleRow(index)}
                            sx={{ cursor: 'pointer' }}
                          >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(attendance.date).toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={summary.present}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={summary.absent}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={summary.late}
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${summary.rate}%`}
                            color={summary.rate >= 80 ? 'success' : summary.rate >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={isExpanded ? "Đóng chi tiết" : "Xem chi tiết"}>
                            <IconButton
                              size="small"
                              onClick={e => { e.stopPropagation(); handleToggleRow(index); }}
                            >
                                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Chi tiết điểm danh ngày {new Date(attendance.date).toLocaleDateString('vi-VN')}
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
                                  {attendance.students?.map((student, studentIndex) => (
                                    <Box key={studentIndex} sx={{
                                      p: 1,
                                      border: '1px solid #e0e0e0',
                                      borderRadius: 1,
                                      bgcolor: 'white'
                                    }}>
                                      <Typography variant="body2" fontWeight="medium">
                                        {student.name}
                                      </Typography>
                                      <Chip
                                        label={getStatusLabel(student.status)}
                                        color={getStatusColor(student.status)}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              </Paper>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có lịch sử điểm danh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lớp học này chưa có bản ghi điểm danh nào.
            </Typography>
          </Box>
        )}
    </BaseDialog>
  );
};

export default AttendanceHistoryModal;
