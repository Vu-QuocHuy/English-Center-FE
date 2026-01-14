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
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  History as HistoryIcon
} from '@mui/icons-material';
import { commonStyles } from '@shared/utils';

interface PaymentTransaction {
  id: string;
  paymentId?: string;
  childName: string;
  className: string;
  month: string | number;
  year?: number;
  attendedLessons: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  paymentHistory?: any[];
}

interface ParentPaymentsTableProps {
  invoices: PaymentTransaction[];
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => 'success' | 'warning' | 'error' | 'default';
  getStatusLabel: (status: string) => string;
  onPayment: (invoice: PaymentTransaction) => void;
  onViewHistory: (invoice: PaymentTransaction) => void;
}

const ParentPaymentsTable: React.FC<ParentPaymentsTableProps> = ({
  invoices,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  onPayment,
  onViewHistory
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tên con</TableCell>
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
                  {invoice.childName}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{invoice.className}</Typography>
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
              <TableCell align="left">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'left' }}>
                  {invoice.status.toLowerCase() !== 'paid' && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onPayment(invoice)}
                    >
                      Thanh toán
                    </Button>
                  )}
                  {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                    <Tooltip title="Xem lịch sử thanh toán">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onViewHistory(invoice)}
                      >
                        <HistoryIcon />
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
  );
};

export default ParentPaymentsTable;