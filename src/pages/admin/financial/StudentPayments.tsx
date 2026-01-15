import React from 'react';
import { Box, TextField, MenuItem, Button, CircularProgress, Grid, Paper, Divider, Typography, Card, CardContent, InputAdornment } from '@mui/material';
import { Download as DownloadIcon, Payment as PaymentIcon, Cancel as CancelIcon, Save as SaveIcon, AttachMoney as AttachMoneyIcon, Paid as PaidIcon, AccountBalanceWallet as WalletIcon, Search as SearchIcon } from '@mui/icons-material';
import { PaymentHistoryModal } from '@shared/components';
import {
  StudentPaymentsTable,
  useStudentPaymentsPage,
} from '@features/payments';
import { BaseDialog } from '@shared/components';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
const StudentPayments: React.FC = () => {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const {
    // filters
    periodType,
    setPeriodType,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedQuarter,
    setSelectedQuarter,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    paymentStatus,
    setPaymentStatus,
    searchStudentName,
    setSearchStudentName,

    // data
    payments,
    pagination,
    totalStatistics,

    // loading
    exportLoading,
    studentPaymentLoading,

    // history dialog
    historyOpen,
    selectedPaymentForHistory,
    onOpenHistory,
    onCloseHistory,

    // payment dialog
    openPayDialog,
    selectedPayment,
    studentPaymentForm,
    amountError,
    setAmountError,
    onOpenPayDialog,
    onClosePayDialog,
    getPaymentSummary,
    handleChangeStudentPaymentField,
    handleSubmitStudentPayment,

    // actions
    onPageChange,
    exportToExcel,
  } = useStudentPaymentsPage();

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>Thanh toán học sinh</Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Tổng học phí</Typography>
                    <Typography variant="h5" color="info.main" fontWeight="bold">{totalStatistics.totalStudentFees.toLocaleString()} ₫</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Đã thu</Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">{totalStatistics.totalPaidAmount.toLocaleString()} ₫</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
                    <Typography variant="h5" color="warning.main" fontWeight="bold">{totalStatistics.totalRemainingAmount.toLocaleString()} ₫</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select label="Trạng thái" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="paid">Đã thanh toán</MenuItem>
              <MenuItem value="pending">Chờ thanh toán</MenuItem>
              <MenuItem value="partial">Đóng một phần</MenuItem>
            </TextField>
            <TextField select label="Thời gian" value={periodType} onChange={(e) => setPeriodType(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="year">Năm</MenuItem>
              <MenuItem value="month">Tháng</MenuItem>
              <MenuItem value="quarter">Quý</MenuItem>
              <MenuItem value="custom">Tùy chọn</MenuItem>
            </TextField>
            {periodType === 'year' && (
              <TextField select label="Năm" value={selectedYear || 'all'} onChange={(e) => setSelectedYear(e.target.value === 'all' ? null : Number(e.target.value))} sx={{ minWidth: 120 }}>
                <MenuItem value="all">Tất cả</MenuItem>
                {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
              </TextField>
            )}
            {periodType === 'month' && (
              <>
                <TextField select label="Năm" value={selectedYear || 'all'} onChange={(e) => setSelectedYear(e.target.value === 'all' ? null : Number(e.target.value))} sx={{ minWidth: 120 }}>
                  <MenuItem value="all">Tất cả</MenuItem>
                  {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
                </TextField>
                <TextField select label="Tháng" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} sx={{ minWidth: 120 }}>
                  {months.map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
                </TextField>
              </>
            )}
            {periodType === 'quarter' && (
              <>
                <TextField select label="Năm" value={selectedYear || 'all'} onChange={(e) => setSelectedYear(e.target.value === 'all' ? null : Number(e.target.value))} sx={{ minWidth: 120 }}>
                  <MenuItem value="all">Tất cả</MenuItem>
                  {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
                </TextField>
                <TextField select label="Quý" value={selectedQuarter} onChange={(e) => setSelectedQuarter(Number(e.target.value))} sx={{ minWidth: 120 }}>
                  {quarters.map((q) => (<MenuItem key={q} value={q}>Quý {q}</MenuItem>))}
                </TextField>
              </>
            )}
            {periodType === 'custom' && (
              <>
                <TextField label="Từ ngày" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} sx={{ minWidth: 150 }} InputLabelProps={{ shrink: true }} />
                <TextField label="Đến ngày" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} sx={{ minWidth: 150 }} InputLabelProps={{ shrink: true }} />
              </>
            )}
              </Box>
              <Box>
              <Button
                variant="outlined"
                startIcon={exportLoading ? <CircularProgress size={16} /> : <DownloadIcon />}
                onClick={exportToExcel}
                disabled={exportLoading}
              >
                {exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
              </Button>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <TextField
                label="Tìm kiếm theo tên học sinh"
                value={searchStudentName}
                onChange={(e) => setSearchStudentName(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Nhập tên học sinh..."
              />
            </Box>
          </Box>

          <StudentPaymentsTable
            payments={payments}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onOpenHistory={onOpenHistory}
            onOpenPayDialog={onOpenPayDialog}
            onPageChange={(_, p) => onPageChange(p)}
          />

          {/* Payment History Modal */}
          {selectedPaymentForHistory && (
            <PaymentHistoryModal
              open={historyOpen}
              onClose={onCloseHistory}
              paymentData={selectedPaymentForHistory as any}
              title="Lịch sử thanh toán học phí"
              showPaymentDetails={true}
              teacherInfo={null as any}
            />
          )}

          {/* Student Payment Dialog */}
          <BaseDialog
            open={openPayDialog}
            onClose={onClosePayDialog}
            title="Thanh toán học phí"
            subtitle={selectedPayment ? `${selectedPayment.student?.name} - ${selectedPayment.class?.name}` : undefined}
            icon={<PaymentIcon sx={{ fontSize: 28, color: 'white' }} />}
            maxWidth="sm"
            contentPadding={0}
            hideDefaultAction={true}
            actions={
              <>
                <Button
                  onClick={onClosePayDialog}
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      bgcolor: 'rgba(102, 126, 234, 0.04)'
                    }
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitStudentPayment}
                  variant="contained"
                  startIcon={studentPaymentLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={studentPaymentLoading || !studentPaymentForm.amount}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    bgcolor: '#667eea',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      bgcolor: '#5a6fd8',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      bgcolor: '#ccc'
                    }
                  }}
                >
                  {studentPaymentLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </Button>
              </>
            }
          >
            <Box sx={{ p: 4 }}>
              {/* Summary */}
              {getPaymentSummary() && (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                          <AttachMoneyIcon fontSize="small" /> Tổng số tiền
                        </Box>
                        <Box sx={{ fontWeight: 700, fontSize: 18 }}>
                          {getPaymentSummary()!.totalAmount.toLocaleString()} ₫
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                          <PaidIcon fontSize="small" /> Đã thanh toán
                        </Box>
                        <Box sx={{ fontWeight: 700, fontSize: 18, color: 'success.main' }}>
                          {getPaymentSummary()!.paidAmount.toLocaleString()} ₫
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                          <WalletIcon fontSize="small" /> Còn lại
                        </Box>
                        <Box sx={{ fontWeight: 700, fontSize: 18, color: 'error.main' }}>
                          {getPaymentSummary()!.remainingAmount.toLocaleString()} ₫
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 3 }} />
                </>
              )}

              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Số tiền thanh toán"
                      type="number"
                      fullWidth
                      value={studentPaymentForm.amount}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        handleChangeStudentPaymentField('amount', inputValue);

                        const summary = getPaymentSummary();
                        const remainingAmount = summary?.remainingAmount ?? 0;
                        const numericValue = inputValue === '' ? 0 : Number(inputValue);

                        if (inputValue === '') {
                          setAmountError('');
                        } else if (Number.isNaN(numericValue) || numericValue <= 0) {
                          setAmountError('Số tiền phải lớn hơn 0');
                        } else if (remainingAmount > 0 && numericValue > remainingAmount) {
                          setAmountError(`Số tiền không được lớn hơn ${remainingAmount.toLocaleString()} ₫`);
                        } else {
                          setAmountError('');
                        }
                      }}
                      inputProps={{ min: 0 }}
                      error={!!amountError}
                      helperText={
                        amountError ||
                        (getPaymentSummary()
                          ? `Tối đa: ${getPaymentSummary()!.remainingAmount.toLocaleString()} ₫`
                          : undefined)
                      }
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Phương thức thanh toán"
                      value={studentPaymentForm.method}
                      onChange={(e) => handleChangeStudentPaymentField('method', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          }
                        }
                      }}
                    >
                      <MenuItem value="cash">Tiền mặt</MenuItem>
                      <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                      <MenuItem value="card">Thẻ</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Ghi chú"
                      fullWidth
                      multiline
                      rows={3}
                      value={studentPaymentForm.note}
                      onChange={(e) => handleChangeStudentPaymentField('note', e.target.value)}
                      placeholder="Nhập ghi chú (nếu có)"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </BaseDialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default StudentPayments;