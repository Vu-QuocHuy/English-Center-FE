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
  Tooltip,
  Pagination
} from '@mui/material';
import {
  History as HistoryIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import type { StudentPayment } from '../types';

interface StudentPaymentsTableProps {
  payments: StudentPayment[];
  page?: number;
  totalPages?: number;
  onOpenHistory: (payment: StudentPayment) => void;
  onOpenPayDialog: (payment: StudentPayment) => void;
  onPageChange?: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const StudentPaymentsTable: React.FC<StudentPaymentsTableProps> = ({
  payments,
  page = 1,
  totalPages = 1,
  onOpenHistory,
  onOpenPayDialog,
  onPageChange
}) => {
  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Học sinh</TableCell>
              <TableCell>Lớp</TableCell>
              <TableCell align="center">Tháng</TableCell>
              <TableCell align="center">Số buổi học</TableCell>
              <TableCell align="center">Số tiền gốc</TableCell>
              <TableCell align="center">Giảm giá</TableCell>
              <TableCell align="center">Số tiền cuối</TableCell>
              <TableCell align="center">Đã đóng</TableCell>
              <TableCell align="center">Còn thiếu</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.student?.name || 'Chưa có tên'}</TableCell>
                <TableCell>{p.class?.name || 'Chưa có tên lớp'}</TableCell>
                <TableCell align="center">{p.month}/{p.year}</TableCell>
                <TableCell align="center">{p.totalLessons || 0}</TableCell>
                <TableCell align="center">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{(p.discountAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{((p.totalAmount ?? 0) - (p.discountAmount ?? 0)).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                <TableCell align="center">{(((p.totalAmount ?? 0) - (p.discountAmount ?? 0)) - (p.paidAmount ?? 0)).toLocaleString()} ₫</TableCell>
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
                    {p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Tooltip title="Lịch sử thanh toán">
                      <IconButton onClick={() => onOpenHistory(p)}>
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    {p.status !== 'paid' && (
                      <Tooltip title="Thanh toán">
                        <IconButton color="primary" onClick={() => onOpenPayDialog(p)}>
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
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

export default StudentPaymentsTable;
