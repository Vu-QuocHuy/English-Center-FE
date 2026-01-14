import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import BaseDialog from './BaseDialog';
import {
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';



interface PaymentTransaction {
  id?: string;
  date: string;
  amount: number;
  method?: string;
  status?: string;
  note?: string;
}

interface PaymentDetails {
  paymentCode: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  finalAmount: number;
  discountAmount: number;
  status: string;
  month: number;
  year: number;
  className: string;
  studentName: string;
}

interface TeacherInfo {
  userId?: {
    email?: string;
    phone?: string;
  };
  email?: string;
  phone?: string;
}

interface PaymentData {
  id?: string;
  month?: number;
  year?: number;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  finalAmount?: number;
  discountAmount?: number;
  status?: string;
  paymentHistory?: PaymentTransaction[];
  // New API structure
  histories?: Array<{
    id?: string;
    date: string;
    amount: number;
    method: string;
    note: string;
  }>;
  paymentDetails?: {
    month: number;
    year: number;
    totalAmount: number;
    paidAmount: number;
    status: string;
    paymentDate?: string;
    paymentMethod?: string;
    description?: string;
  };
  transactions?: Array<{
    id: string;
    className: string;
    sessions: number;
    amount: number;
    date: string;
  }>;
  classId?: {
    name: string;
  };
  studentId?: {
    userId?: {
      name: string;
    };
  };
  teacherId?: {
    userId?: {
      name: string;
      email?: string;
      phone?: string;
    };
    name?: string;
    email?: string;
    phone?: string;
  };
  teacherInfo?: {
    id: string;
    name: string;
    email: string;
  };
  // New API structure for teacher
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    salaryPerLesson: number;
  };
  classes?: Array<{
    totalLessons?: number;
    id?: string;
    name?: string;
    grade?: number;
    section?: number;
    year?: number;
  }>;
  totalLessons?: number;
  salaryPerLesson?: number;
}

interface PaymentHistoryModalProps {
  open: boolean;
  onClose: () => void;
  paymentData: PaymentData;
  title?: string;
  showPaymentDetails?: boolean;
  teacherInfo?: TeacherInfo;
}

interface StatusInfo {
  color: 'success' | 'warning' | 'error' | 'info' | 'default';
  icon: React.ReactNode;
  label: string;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Helper function to get status color and icon
const getStatusInfo = (status?: string): StatusInfo => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return {
        color: 'success',
        icon: <CheckCircleIcon />,
        label: 'Thành công'
      };
    case 'pending':
    case 'processing':
      return {
        color: 'warning',
        icon: <PendingIcon />,
        label: 'Đang xử lý'
      };
    case 'failed':
    case 'cancelled':
      return {
        color: 'error',
        icon: <CancelIcon />,
        label: 'Thất bại'
      };
    case 'partial':
      return {
        color: 'info',
        icon: <PaymentIcon />,
        label: 'Thanh toán một phần'
      };
    default:
      return {
        color: 'default',
        icon: <ScheduleIcon />,
        label: status || 'Không xác định'
      };
  }
};

// Helper function to get payment method label
const getPaymentMethodLabel = (method?: string): string => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return 'Tiền mặt';
    case 'bank_transfer':
      return 'Chuyển khoản';
    default:
      return method || 'Không xác định';
  }
};

// Helper function to get payment status (different from transaction status)
const getPaymentStatusInfo = (paymentData: PaymentData): StatusInfo => {
  const totalAmount = paymentData.finalAmount || paymentData.totalAmount || 0;
  const paidAmount = paymentData.paidAmount || 0;


  if (paidAmount >= totalAmount) {
    return {
      color: 'success',
      icon: <CheckCircleIcon />,
      label: 'Đã thanh toán'
    };
  } else if (paidAmount > 0) {
    return {
      color: 'warning',
      icon: <PaymentIcon />,
      label: 'Thanh toán một phần'
    };
  } else {
    return {
      color: 'error',
      icon: <CancelIcon />,
      label: 'Chưa thanh toán'
    };
  }
};

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  open,
  onClose,
  paymentData,
  title = "Lịch sử thanh toán",
  showPaymentDetails = true,
  teacherInfo
}) => {
  const [loading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
          if (open && paymentData) {
        // Extract data from paymentData - handle both old and new API structure
        let history: PaymentTransaction[] = [];

        // Check for new API structure (histories)
        if (paymentData.histories && Array.isArray(paymentData.histories)) {
          history = paymentData.histories.map((item: any) => ({
            id: item.id,
            date: item.date,
            amount: item.amount,
            method: item.method,
            note: item.note,
            status: 'completed' // Assume completed for history items
          }));
        }
        // Fallback to old API structure (paymentHistory)
        else if (paymentData.paymentHistory) {
          history = Array.isArray(paymentData.paymentHistory) ? paymentData.paymentHistory : [paymentData.paymentHistory];
        }

        setPaymentHistory(history);

        // Extract payment requests
        const requests = (paymentData as any).paymentRequests || [];
        setPaymentRequests(Array.isArray(requests) ? requests : []);

      if (showPaymentDetails) {
        // Extract student and class info from API response
        const studentInfo = (paymentData as any).student || (paymentData as any).studentId;
        const classInfo = (paymentData as any).class || (paymentData as any).classId || paymentData.classes?.[0];

        // Check if data is from parent Payments.tsx (has mapped fields) or admin StudentPaymentsTab (raw API)
        // Priority: mapped fields from Payments.tsx > raw API fields
        const totalAmount = (paymentData as any).originalAmount || (paymentData as any).totalAmount || 0;
        const discountAmount = (paymentData as any).discountAmount || 0;

        // Calculate finalAmount: if not pre-calculated, compute from totalAmount - discountAmount
        const finalAmount = (paymentData as any).finalAmount || (totalAmount - discountAmount);

        const paidAmount = (paymentData as any).paidAmount || 0;

        // Calculate remainingAmount: if not pre-calculated, compute from finalAmount - paidAmount
        const remainingAmount = (paymentData as any).remainingAmount || (finalAmount - paidAmount);

        // Get month and year correctly
        let monthValue: number = typeof paymentData.month === 'number' ? paymentData.month : 1;
        let yearValue: number = typeof paymentData.year === 'number' ? paymentData.year : new Date().getFullYear();

        // If month is a string like "11/2025", parse it
        if (typeof paymentData.month === 'string' && (paymentData.month as string).includes('/')) {
          const parts = (paymentData.month as string).split('/');
          monthValue = parseInt(parts[0]) || 1;
          yearValue = parseInt(parts[1]) || new Date().getFullYear();
        }

        setPaymentDetails({
          paymentCode: `INV-${monthValue}/${yearValue}-${paymentData.id?.slice(-6)}`,
          totalAmount: totalAmount,
          paidAmount: paidAmount,
          remainingAmount: remainingAmount,
          finalAmount: finalAmount,
          discountAmount: discountAmount,
          status: paymentData.status || 'pending',
          month: typeof monthValue === 'number' ? monthValue : parseInt(String(monthValue)) || 1,
          year: typeof yearValue === 'number' ? yearValue : parseInt(String(yearValue)) || new Date().getFullYear(),
          className: classInfo?.name || 'N/A',
          studentName: studentInfo?.name || studentInfo?.userId?.name || 'N/A'
        });
      }
    }
  }, [open, paymentData, showPaymentDetails, teacherInfo]);

  const handleClose = (): void => {
    setPaymentHistory([]);
    setPaymentRequests([]);
    setPaymentDetails(null);
    setError('');
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={title}
      subtitle="Chi tiết lịch sử thanh toán"
      maxWidth="md"
      loading={loading}
      error={error || null}
      contentPadding={4}
      PaperProps={{
        sx: {
          minHeight: '60vh'
        }
      }}
    >
      {!loading && !error && (
        <Box>
            {/* Payment Details Section */}
            {showPaymentDetails && paymentDetails && (
              <Accordion sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: '1px solid #e0e6ed',
                    px: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.05)'
                    }
                  }}
                >
                  <Typography variant="h6" sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2
                    }} />
                    Thông tin thanh toán
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Grid container spacing={3}>
                    {(paymentData.teacherId || paymentData.teacher) ? (
                      <>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Giáo viên
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {paymentData.teacher?.name ||
                                  paymentData.teacherId?.userId?.name ||
                                  paymentData.teacherId?.name ||
                                  '-'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Email
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {paymentData.teacher?.email ||
                                  paymentData.teacherId?.userId?.email ||
                                  paymentData.teacherId?.email ||
                                  '-'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Số điện thoại
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {paymentData.teacher?.phone ||
                                  paymentData.teacherId?.userId?.phone ||
                                  paymentData.teacherId?.phone ||
                                  '-'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Tháng/Năm
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {paymentData.month}/{paymentData.year}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Trạng thái thanh toán
                              </Typography>
                              <Chip
                                label={getPaymentStatusInfo(paymentData).label}
                                color={getPaymentStatusInfo(paymentData).color}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Số buổi
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {paymentData.classes && Array.isArray(paymentData.classes)
                                  ? paymentData.classes.reduce((sum, cls) => sum + (cls.totalLessons || 0), 0)
                                  : paymentData.totalLessons || '-'}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Lương/buổi
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {formatCurrency(
                                  paymentData.teacher?.salaryPerLesson ||
                                    paymentData.salaryPerLesson ||
                                    0
                                )}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Tổng lương
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {formatCurrency(paymentData.totalAmount || 0)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Đã thanh toán
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {formatCurrency(paymentData.paidAmount || 0)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                               Học sinh: {paymentDetails?.studentName || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                               Lớp học: {paymentDetails?.className || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Tháng/Năm: {paymentDetails.month}/{paymentDetails.year}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                           <Box>
                             <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                               Số buổi học: {(paymentData as any).totalLessons || 0} buổi
                             </Typography>
                           </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Số tiền gốc: {formatCurrency(paymentDetails.totalAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Giảm giá: {formatCurrency(paymentDetails.discountAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Số tiền cuối: {formatCurrency(paymentDetails.finalAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Đã thanh toán: {formatCurrency(paymentDetails.paidAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Còn lại: {formatCurrency(paymentDetails.remainingAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              Trạng thái:
                              <Chip
                                label={getPaymentStatusInfo(paymentData).label}
                                color={getPaymentStatusInfo(paymentData).color}
                                size="small"
                                variant="outlined"
                              />
                            </Typography>
                          </Box>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Payment History Table */}
            <Accordion sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  px: 3,
                  py: 2,
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.05)'
                  }
                }}
              >
                <Typography variant="h6" sx={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    bgcolor: '#667eea',
                    borderRadius: 2
                  }} />
                  Lịch sử giao dịch
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
              <Box sx={{
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}>
                {paymentHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                      Chưa có lịch sử thanh toán
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Thời gian
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Số tiền
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Phương thức
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Trạng thái
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Ghi chú
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentHistory.map((transaction, index) => {
                          const statusInfo = getStatusInfo(transaction.status || 'completed');
                          return (
                            <TableRow key={transaction.id || index} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                  {formatDate(transaction.date)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: transaction.amount > 0 ? 'success.main' : 'error.main'
                                  }}
                                >
                                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                                  {getPaymentMethodLabel(transaction.method)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={statusInfo.label}
                                  color={statusInfo.color}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {transaction.note || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
              </AccordionDetails>
            </Accordion>

            {/* Payment Requests Section */}
            {paymentRequests.length > 0 && (
              <Paper sx={{
                mt: 3,
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fff5e6 0%, #ffe0b2 100%)',
                border: '1px solid #ffb74d',
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{
                  color: '#e65100',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2
                }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    bgcolor: '#ff9800',
                    borderRadius: 2
                  }} />
                  Lịch sử yêu cầu thanh toán
                </Typography>
                <Box sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#fff8f0' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>
                            Thời gian yêu cầu
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>
                            Số tiền
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>
                            Trạng thái
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>
                            Ảnh bằng chứng
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>
                            Ghi chú
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                         {paymentRequests.map((request, index) => (
                           <TableRow key={request.id || index} hover>
                             <TableCell>
                               <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                 {formatDate(request.requestedAt || request.createdAt)}
                               </Typography>
                               {request.processedAt && (
                                 <>
                                   <Typography variant="caption" color="text.secondary" display="block">
                                     Xử lý: {formatDate(request.processedAt)}
                                   </Typography>
                                   {request.processedBy && (
                                     <Typography variant="caption" color="text.secondary" display="block">
                                       Bởi: {request.processedBy.name || request.processedBy.email || 'Admin'}
                                     </Typography>
                                   )}
                                 </>
                               )}
                             </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: 'warning.main'
                                }}
                              >
                                {formatCurrency(request.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={
                                  request.status === 'pending' ? <PendingIcon /> :
                                  request.status === 'approved' ? <CheckCircleIcon /> :
                                  <CancelIcon />
                                }
                                label={
                                  request.status === 'pending' ? 'Chờ duyệt' :
                                  request.status === 'approved' ? 'Đã duyệt' :
                                  'Bị từ chối'
                                }
                                color={
                                  request.status === 'pending' ? 'warning' :
                                  request.status === 'approved' ? 'success' :
                                  'error'
                                }
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {request.imageProof ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => window.open(request.imageProof, '_blank')}
                                  sx={{ fontSize: '0.75rem' }}
                                >
                                  Xem ảnh
                                </Button>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {request.status === 'rejected' && request.rejectionReason
                                  ? `Lý do từ chối: ${request.rejectionReason}`
                                  : request.note || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            )}

            {/* Summary Section */}
            {paymentHistory.length > 0 && (
              <Paper sx={{
                mt: 3,
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
                  Tổng kết
                </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Tổng giao dịch: <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                            {paymentHistory.length}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Tổng đã thanh toán: <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                            {formatCurrency(
                              paymentHistory.reduce((sum, t) => sum + Number(t.amount || 0), 0)
                            )}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Giao dịch thành công: <Typography variant="body1" component="span" sx={{ fontWeight: 600}}>
                            {paymentHistory.length}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            )}
        </Box>
      )}
    </BaseDialog>
  );
};

export default PaymentHistoryModal;
