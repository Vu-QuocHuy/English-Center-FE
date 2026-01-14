import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
  Pagination
} from '@mui/material';
import {
  History as HistoryIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import type { TeacherPayment } from '../types';

interface TeacherPaymentsTableProps {
  payments: TeacherPayment[];
  page?: number;
  totalPages?: number;
  onOpenDialog: (payment: TeacherPayment) => void;
  onOpenHistory: (payment: TeacherPayment) => void;
  onPageChange?: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const TeacherPaymentsTable: React.FC<TeacherPaymentsTableProps> = ({
  payments,
  page = 1,
  totalPages = 1,
  onOpenDialog,
  onOpenHistory,
  onPageChange
}) => {
  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Giáo viên</TableCell>
              <TableCell align="center">Tháng/Năm</TableCell>
              <TableCell align="right">Lương/buổi</TableCell>
              <TableCell align="right">Số buổi dạy</TableCell>
              <TableCell align="right">Tổng lương</TableCell>
              <TableCell align="right">Đã trả</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <span>{p.teacher?.name || p.teacherId?.userId?.name || p.teacherId?.name || 'Chưa có tên'}</span>
                </TableCell>
                <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                <TableCell align="right">{(p.teacher?.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="right">
                  {p.classes && Array.isArray(p.classes) ? p.classes.reduce((sum, c) => sum + (c.totalLessons || 0), 0) : 0}
                </TableCell>
                <TableCell align="right">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="right">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: p.status === 'paid' ? '#2e7d32' : p.status === 'partial' ? '#f9a825' : '#c62828',
                      border: `1px solid ${p.status === 'paid' ? '#2e7d32' : p.status === 'partial' ? '#f9a825' : '#c62828'}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {p.status === 'paid' ? 'Đã thanh toán' : p.status === 'partial' ? 'Nhận một phần' : p.status === 'pending' ? 'Chờ thanh toán' : 'Chưa thanh toán'}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton size="small" onClick={() => onOpenDialog(p)} color="primary">
                      <PaymentIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => onOpenHistory(p)} color="info">
                      <HistoryIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={onPageChange} />
        </Box>
      )}
    </>
  );
};

export default TeacherPaymentsTable;
