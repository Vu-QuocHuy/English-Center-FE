import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  TextField,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  MoneyOff as MoneyOffIcon,
  QrCode2 as QrCodeIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import { ParentPaymentsTable, useParentPayments, ParentPaymentDialog } from '@features/parents';
import { PaymentHistoryModal, NotificationSnackbar, BaseDialog } from '@shared/components';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const {
    loading,
    error,
    allInvoices,
    summary,
    filteredInvoices,
    searchQuery,
    setSearchQuery,
    selectedTab,
    handleTabChange,
    formatCurrency,
    getStatusColor,
    getStatusLabel,
    paymentDialogOpen,
    selectedInvoice,
    paymentAmount,
    setPaymentAmount,
    paymentError,
    qrCodeUrl,
    qrCodeLoading,
    qrDialogOpen,
    handlePayment,
    handleClosePaymentDialog,
    handleRegenerateQRCode,
    handleCloseQRDialog,
    paymentHistoryModalOpen,
    selectedPaymentForHistory,
    handleOpenPaymentHistory,
    handleClosePaymentHistory,
    snackbar,
    handleCloseSnackbar,
  } = useParentPayments(user);

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={{ ...commonStyles.pageContainer, paddingLeft: '2%', paddingRight: '2%' }}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý học phí
            </Typography>
          </Box>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xem và quản lý hóa đơn học phí của con bạn
          </Typography>

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ReceiptIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Tổng hóa đơn
                      </Typography>
                      <Typography variant="h4">
                        {summary.totalInvoices}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <AttachMoneyIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Tổng số tiền
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(summary.totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <PaymentIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Đã thanh toán
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(summary.totalPaid)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <MoneyOffIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Chưa thanh toán
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(summary.totalUnpaid)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={`Tất cả (${allInvoices.length})`} />
            <Tab label={`Chưa thanh toán (${summary.unpaidInvoices})`} />
            <Tab label={`Thanh toán một phần (${summary.partialInvoices})`} />
            <Tab label={`Đã thanh toán (${summary.paidInvoices})`} />
          </Tabs>

          {/* Search */}
          <Paper sx={commonStyles.searchContainer}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên con hoặc tên lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={commonStyles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* Payment Transactions Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách hóa đơn
              </Typography>
              {filteredInvoices.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="textSecondary">
                    Không tìm thấy giao dịch thanh toán
                  </Typography>
                </Box>
              ) : (
                <ParentPaymentsTable
                  invoices={filteredInvoices}
                  formatCurrency={formatCurrency}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  onPayment={handlePayment}
                  onViewHistory={handleOpenPaymentHistory}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Payment Dialog */}
      <ParentPaymentDialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        selectedInvoice={selectedInvoice}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        paymentError={paymentError}
        qrCodeLoading={qrCodeLoading}
        formatCurrency={formatCurrency}
        onSubmit={handleRegenerateQRCode}
      />

      {/* QR Code Dialog */}
      <BaseDialog
        open={qrDialogOpen}
        onClose={handleCloseQRDialog}
        title="Quét mã QR để thanh toán"
        subtitle="Mở app ngân hàng và quét mã dưới đây"
        icon={<QrCodeIcon sx={{ fontSize: 48, color: 'white' }} />}
        maxWidth="sm"
        contentPadding={0}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }
        }}
      >
        <Box sx={{ p: 4 }}>
          {qrCodeUrl ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3
              }}
            >
              {/* QR Code với animation */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  animation: 'fadeIn 0.5s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'scale(0.9)' },
                    to: { opacity: 1, transform: 'scale(1)' }
                  }
                }}
              >
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="QR Code Payment"
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={60} />
            </Box>
          )}
        </Box>
      </BaseDialog>

      {/* Payment History Modal */}
      {selectedPaymentForHistory && (
        <PaymentHistoryModal
          open={paymentHistoryModalOpen}
          onClose={handleClosePaymentHistory}
          paymentData={selectedPaymentForHistory as any}
          title="Lịch sử thanh toán học phí"
          showPaymentDetails={true}
        />
      )}

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </DashboardLayout>
  );
};

export default Payments;