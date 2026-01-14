import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { getTeacherPaymentsAPI, getTeacherPaymentByIdAPI } from '@features/payments';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { StatCard } from '@shared/components';
import { commonStyles } from '@shared/utils';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherSalaryTable } from '@features/teachers';
import { PaymentHistoryModal, BaseDialog } from '@shared/components';

const Salary = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      const teacherId = user?.id;
      if (!teacherId) return;
      setLoading(true);
      try {
        const res = await getTeacherPaymentsAPI({
          teacherId: teacherId,
        page: 1,
          limit: 50
        });
        console.log('API getTeacherPaymentsAPI response:', res);

        // Handle the response structure from Get All Teacher Payments API
        if (res && res.data && res.data.data && res.data.data.result) {
          setPayments(res.data.data.result);
      } else {
          setPayments([]);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        setPayments([]);
    } finally {
      setLoading(false);
    }
  };
    fetchPayments();
  }, [user]);

  // Tính toán số liệu thống kê
  const totalSalary = payments.reduce((sum, payment) => sum + (payment.totalAmount ?? 0), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + (payment.paidAmount ?? 0), 0);
  const totalUnpaid = totalSalary - totalPaid;

  // Log state payments để kiểm tra dữ liệu render
  console.log('Payments state:', payments);

  const handleViewDetail = async (payment: any) => {
    try {
      // Gọi API Get Teacher Payment by ID để lấy thông tin chi tiết
      const res = await getTeacherPaymentByIdAPI(payment.id);
      console.log('API getTeacherPaymentByIdAPI response for detail:', res);

      if (res && res.data && res.data.data) {
        // Cập nhật selectedPayment với thông tin chi tiết từ API
        setSelectedPayment(res.data.data);
        setDetailModalOpen(true);
      } else {
        console.error('Invalid response from getTeacherPaymentByIdAPI');
        // Fallback: sử dụng payment data hiện tại
        setSelectedPayment(payment);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      // Fallback: sử dụng payment data hiện tại
      setSelectedPayment(payment);
      setDetailModalOpen(true);
    }
  };

  const handleViewHistory = async (payment: any) => {
    try {
      // Gọi API Get Teacher Payment by ID để lấy thông tin chi tiết
      const res = await getTeacherPaymentByIdAPI(payment.id);
      console.log('API getTeacherPaymentByIdAPI response:', res);


      if (res && res.data && res.data.data) {
        // Cập nhật selectedPayment với thông tin chi tiết từ API
        setSelectedPayment(res.data.data);
        setHistoryModalOpen(true);
      } else {
        console.error('Invalid response from getTeacherPaymentByIdAPI');
        // Fallback: sử dụng payment data hiện tại
        setSelectedPayment(payment);
        setHistoryModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      // Fallback: sử dụng payment data hiện tại
      setSelectedPayment(payment);
      setHistoryModalOpen(true);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPayment(null);
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedPayment(null);
  };

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Lương của tôi
                    </Typography>
                  </Box>
        {/* Stat Cards */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Số tháng có lương"
                value={payments.length}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng lương"
                value={totalSalary.toLocaleString() + ' ₫'}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã nhận"
                value={totalPaid.toLocaleString() + ' ₫'}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="info"
              />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Còn lại"
                value={totalUnpaid.toLocaleString() + ' ₫'}
                icon={<MoneyOffIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
          </Grid>
        </Box>
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TeacherSalaryTable
              payments={payments}
              onViewDetail={handleViewDetail}
              onViewHistory={handleViewHistory}
            />
          )}
        </Paper>

        {/* Detail Modal */}
        {selectedPayment && (
          <BaseDialog
            open={detailModalOpen}
            onClose={handleCloseDetailModal}
            title={`Chi tiết lương tháng ${selectedPayment.month}/${selectedPayment.year}`}
            subtitle="Thông tin chi tiết về lương và các lớp đã dạy"
            maxWidth="md"
            contentPadding={0}
          >
              <Box sx={{ p: 4 }}>
                {/* Thông tin chung */}
                <Paper sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed'
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
                    Thông tin chung
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Thông tin giáo viên
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Tên:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.teacher?.name || '-'}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Email:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.teacher?.email || '-'}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>SĐT:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.teacher?.phone || '-'}
                          </span>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Thông tin lương
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Tháng/Năm:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.month}/{selectedPayment.year}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Lương/buổi:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {(selectedPayment.teacher?.salaryPerLesson ?? 0).toLocaleString()} ₫
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Tổng lương:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {(selectedPayment.totalAmount ?? 0).toLocaleString()} ₫
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Đã nhận:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {(selectedPayment.paidAmount ?? 0).toLocaleString()} ₫
                          </span>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Chi tiết từng lớp */}
                {selectedPayment.classes && Array.isArray(selectedPayment.classes) && (
                  <Paper sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
                        Chi tiết từng lớp
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                        Thông tin chi tiết về số buổi dạy và lương từng lớp
                      </Typography>
                    </Box>
                    <TableContainer sx={commonStyles.tableContainer}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Tên lớp</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Số buổi</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Lương/buổi</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Tổng lương</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedPayment.classes.map((classItem: any, index: number) => (
                            <TableRow
                              key={index}
                              hover
                              sx={commonStyles.tableRow}
                            >
                              <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                {classItem.name || 'N/A'}
                      </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                {classItem.totalLessons || 0}
                      </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '2c3e50' }}>
                                {(selectedPayment.teacher?.salaryPerLesson ?? 0).toLocaleString()} ₫
                      </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '2c3e50' }}>
                                {((classItem.totalLessons || 0) * (selectedPayment.teacher?.salaryPerLesson ?? 0)).toLocaleString()} ₫
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
                  </Paper>
                )}
              </Box>
          </BaseDialog>
        )}

        {/* Payment History Modal */}
          <PaymentHistoryModal
          open={historyModalOpen}
          onClose={handleCloseHistoryModal}
          paymentData={selectedPayment}
          title="Lịch sử thanh toán lương"
          showPaymentDetails={true}
        />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Salary;