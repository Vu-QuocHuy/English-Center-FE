import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon
} from '@mui/icons-material';
import { commonStyles } from '@shared/utils';
import type { TuitionTransaction } from '../hooks/useStudentTuition';

interface StudentTuitionTableProps {
  invoices: TuitionTransaction[];
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => 'success' | 'warning' | 'error' | 'default';
  getStatusLabel: (status: string) => string;
  onViewHistory: (invoice: TuitionTransaction) => void;
}

const StudentTuitionTable: React.FC<StudentTuitionTableProps> = ({
  invoices,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  onViewHistory,
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tháng</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số buổi học</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tiền gốc</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Giảm giá</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tiền cuối</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đã thanh toán</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Còn lại</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} sx={commonStyles.tableRow}>
              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {invoice.className}
                </Typography>
              </TableCell>
              <TableCell align="center">{invoice.month}</TableCell>
              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{`${invoice.attendedLessons} buổi`}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.originalAmount)}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatCurrency(invoice.discountAmount > 0 ? invoice.discountAmount : 0)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.finalAmount)}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.paidAmount)}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.remainingAmount)}</Typography>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                  <Chip
                    label={getStatusLabel(invoice.status)}
                    color={getStatusColor(invoice.status)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Tooltip title="Xem lịch sử thanh toán">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onViewHistory(invoice)}
                    >
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentTuitionTable;
