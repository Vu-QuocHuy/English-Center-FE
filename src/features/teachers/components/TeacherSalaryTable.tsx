import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Typography
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { commonStyles } from '@shared/utils';

interface TeacherPayment {
  id: string;
  month?: number;
  year?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  teacher?: {
    salaryPerLesson?: number;
  };
  classes?: Array<{ totalLessons?: number }>;
}

interface TeacherSalaryTableProps {
  payments: TeacherPayment[];
  onViewDetail: (payment: TeacherPayment) => void;
  onViewHistory: (payment: TeacherPayment) => void;
}

const TeacherSalaryTable: React.FC<TeacherSalaryTableProps> = ({
  payments,
  onViewDetail,
  onViewHistory
}) => {
  return (
    <TableContainer sx={commonStyles.tableContainer}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Tháng/Năm</TableCell>
            <TableCell align="right">Số buổi</TableCell>
            <TableCell align="right">Lương/buổi</TableCell>
            <TableCell align="right">Tổng lương</TableCell>
            <TableCell align="right">Đã nhận</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography>Không có dữ liệu lương</Typography>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} hover sx={commonStyles.tableRow}>
                <TableCell align="center">{payment.month}/{payment.year}</TableCell>
                <TableCell align="right">
                  {payment.classes && Array.isArray(payment.classes)
                    ? payment.classes.reduce((sum: number, classItem: any) => sum + (classItem.totalLessons || 0), 0)
                    : 0
                  }
                </TableCell>
                <TableCell align="right">{(payment.teacher?.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="right">{(payment.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="right">{(payment.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      payment.status === 'paid' ? 'Đã nhận' :
                      payment.status === 'partial' ? 'Nhận một phần' :
                      payment.status === 'pending' ? 'Chờ nhận' :
                      'Chưa nhận'
                    }
                    color={
                      payment.status === 'paid' ? 'success' :
                      payment.status === 'partial' ? 'warning' :
                      payment.status === 'pending' ? 'info' :
                      'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Xem chi tiết">
                    <IconButton size="small" color="primary" onClick={() => onViewDetail(payment)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Lịch sử thanh toán">
                    <IconButton size="small" color="info" onClick={() => onViewHistory(payment)}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeacherSalaryTable;

