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
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  MoneyOff as MoneyOffIcon,
  AttachMoney as AttachMoneyIcon,
  Payment as PaymentIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import { useStudentTuition, TuitionTransaction } from '@features/students/hooks/useStudentTuition';
import StudentTuitionTable from '@features/students/components/StudentTuitionTable';
import { PaymentHistoryModal } from '@shared/components';

const Tuition: React.FC = () => {
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
  } = useStudentTuition(user);

  const [historyModalOpen, setHistoryModalOpen] = React.useState<boolean>(false);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = React.useState<TuitionTransaction | null>(null);

  const handleOpenHistory = (invoice: TuitionTransaction) => {
    setSelectedInvoiceForHistory(invoice);
    setHistoryModalOpen(true);
  };

  const handleCloseHistory = () => {
    setHistoryModalOpen(false);
    setSelectedInvoiceForHistory(null);
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="student">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Box sx={{ ...commonStyles.pageContainer, paddingLeft: '2%', paddingRight: '2%' }}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Học phí
            </Typography>
          </Box>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xem thông tin học phí của bạn
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
              placeholder="Tìm kiếm theo tên lớp hoặc tháng..."
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

          {/* Tuition Transactions Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách hóa đơn
              </Typography>
              {filteredInvoices.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="textSecondary">
                    Không tìm thấy hóa đơn học phí
                  </Typography>
                </Box>
              ) : (
                <StudentTuitionTable
                  invoices={filteredInvoices}
                  formatCurrency={formatCurrency}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  onViewHistory={handleOpenHistory}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Payment History Modal */}
      {selectedInvoiceForHistory && (
        <PaymentHistoryModal
          open={historyModalOpen}
          onClose={handleCloseHistory}
          paymentData={selectedInvoiceForHistory as any}
          title="Lịch sử thanh toán học phí"
          showPaymentDetails={true}
        />
      )}
    </DashboardLayout>
  );
};

export default Tuition;
