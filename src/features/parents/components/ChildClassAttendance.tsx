import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AssignmentLate as AssignmentLateIcon,
} from '@mui/icons-material';
import { StatCard } from '@shared/components';

interface ChildClassAttendanceProps {
  classId: string;
  attendanceData: any;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const ChildClassAttendance: React.FC<ChildClassAttendanceProps> = ({
  classId,
  attendanceData,
}) => {
  if (!attendanceData || !attendanceData.sessions) {
    return null;
  }

  // Calculate stats for this specific class
  const classSessions = (attendanceData.sessions || []).filter((session: any) => {
    const sessionClassId = session?.class?.id || session?.classId;
    return sessionClassId === classId;
  });

  const totalSessions = classSessions.length;
  const presentSessions = classSessions.filter((s: any) =>
    String(s?.status || '').toLowerCase() === 'present'
  ).length;
  const absentSessions = classSessions.filter((s: any) =>
    String(s?.status || '').toLowerCase() === 'absent'
  ).length;
  const lateSessions = classSessions.filter((s: any) =>
    String(s?.status || '').toLowerCase() === 'late'
  ).length;

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return {
          label: 'Có mặt',
          color: 'success' as const,
          icon: <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />,
        };
      case 'absent':
        return {
          label: 'Vắng mặt',
          color: 'error' as const,
          icon: <CancelIcon sx={{ fontSize: 18, mr: 0.5 }} />,
        };
      case 'late':
        return {
          label: 'Đi muộn',
          color: 'warning' as const,
          icon: <AssignmentLateIcon sx={{ fontSize: 18, mr: 0.5 }} />,
        };
      default:
        return {
          label: 'Chưa xác định',
          color: 'default' as const,
          icon: <EventIcon sx={{ fontSize: 18, mr: 0.5 }} />,
        };
    }
  };

  const filteredSessions = (attendanceData.sessions || []).filter((session: any) => {
    const sessionClassId = session?.class?.id || session?.classId;
    return sessionClassId === classId;
  });

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 700 }}>
        Thông tin điểm danh
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Tổng số buổi"
            value={totalSessions}
            icon={<EventIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Có mặt"
            value={presentSessions}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Vắng"
            value={absentSessions}
            icon={<CancelIcon />}
            color="error"
          />
        </Grid>
        {lateSessions > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Đi muộn"
              value={lateSessions}
              icon={<AssignmentLateIcon />}
              color="warning"
            />
          </Grid>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Danh sách buổi học
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Buổi học</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSessions.map((session: any, index: number) => {
                  const statusConfig = getStatusConfig(session.status);

                  return (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          Buổi {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.date ? formatDate(session.date) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {session.note || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        Chưa có buổi học nào cho lớp này
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default ChildClassAttendance;