import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Alert,
  InputAdornment,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { Payment as PaymentIcon, AttachMoney as AttachMoneyIcon, Paid as PaidIcon, AccountBalanceWallet as WalletIcon, Download as DownloadIcon, Search as SearchIcon } from '@mui/icons-material';
import { TeacherPaymentsTable, useTeacherPaymentsPage } from '@features/payments';
import { PaymentHistoryModal, BaseDialog } from '@shared/components';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';

const TeacherPayments: React.FC = () => {
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
    searchTeacherName,
    setSearchTeacherName,

    // data
    payments,
    pagination,
    statistics,

    // history
    historyOpen,
    selectedPaymentForHistory,
    openHistory,
    closeHistory,

    // dialog
    dialogOpen,
    editingPayment,
    loading,
    error,
    dialogSummary,
    formData,
    amountError,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    setFormData,
    setAmountError,

    // actions
    onPageChange,
    exportToExcel,
  } = useTeacherPaymentsPage();

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>Thanh toán giáo viên</Typography>
          </Box>

          {/* Statistics Cards */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Tổng lương phải trả</Typography>
                    <Typography variant="h5" color="info.main" fontWeight="bold">{statistics.totalAmount.toLocaleString()} ₫</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Đã trả</Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">{statistics.paidAmount.toLocaleString()} ₫</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
                    <Typography variant="h5" color="warning.main" fontWeight="bold">{statistics.remainingAmount.toLocaleString()} ₫</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select label="Trạng thái" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="paid">Đã thanh toán</MenuItem>
              <MenuItem value="pending">Chờ thanh toán</MenuItem>
              <MenuItem value="partial">Nhận một phần</MenuItem>
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
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
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
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>Xuất Excel</Button>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <TextField
                label="Tìm kiếm theo tên giáo viên"
                value={searchTeacherName}
                onChange={(e) => setSearchTeacherName(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Nhập tên giáo viên..."
              />
            </Box>
          </Box>

          <TeacherPaymentsTable
            payments={payments}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onOpenDialog={handleOpenDialog}
            onOpenHistory={openHistory}
            onPageChange={(_, p) => onPageChange(p)}
          />

          {selectedPaymentForHistory && (
            <PaymentHistoryModal
              open={historyOpen}
              onClose={closeHistory}
              paymentData={selectedPaymentForHistory as any}
              title="Lịch sử thanh toán giáo viên"
              showPaymentDetails={true}
              teacherInfo={null as any}
            />
          )}

          {/* Payment Dialog */}
          <BaseDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            title="Thanh toán lương giáo viên"
            subtitle={editingPayment ? (editingPayment.teacher?.name || editingPayment.teacherId?.userId?.name || editingPayment.teacherId?.name || '') : undefined}
            icon={<PaymentIcon sx={{ fontSize: 28, color: 'white' }} />}
            maxWidth="sm"
            contentPadding={0}
            hideDefaultAction={true}
            actions={
              <>
                <Button
                  onClick={handleCloseDialog}
                  variant="outlined"
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
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
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
                  {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </Button>
              </>
            }
          >
            <Box sx={{ p: 4 }}>
              {/* Summary */}
              {dialogSummary && (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                          <AttachMoneyIcon fontSize="small" /> Tổng lương
                        </Box>
                        <Box sx={{ fontWeight: 700, fontSize: 18 }}>{dialogSummary.totalAmount.toLocaleString()} ₫</Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                          <PaidIcon fontSize="small" /> Đã thanh toán
                        </Box>
                        <Box sx={{ fontWeight: 700, fontSize: 18, color: 'success.main' }}>{dialogSummary.paidAmount.toLocaleString()} ₫</Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
                          <WalletIcon fontSize="small" /> Còn lại
                        </Box>
                        <Box sx={{ fontWeight: 700, fontSize: 18, color: 'error.main' }}>{dialogSummary.remainingAmount.toLocaleString()} ₫</Box>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 3 }} />
                </>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số tiền thanh toán"
                    type="number"
                    value={formData.paidAmount === 0 ? '' : formData.paidAmount}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const value = inputValue === '' ? 0 : Number(inputValue);
                      setFormData({ ...formData, paidAmount: value });
                      
                      // Validate real-time
                      if (inputValue === '') {
                        setAmountError('');
                      } else if (value <= 0) {
                        setAmountError('Số tiền phải lớn hơn 0');
                      } else if (dialogSummary && value > dialogSummary.remainingAmount) {
                        setAmountError(`Số tiền không được lớn hơn ${dialogSummary.remainingAmount.toLocaleString()} ₫`);
                      } else {
                        setAmountError('');
                      }
                    }}
                    inputProps={{ min: 0 }}
                    InputProps={{ startAdornment: <InputAdornment position="start">₫</InputAdornment> }}
                    error={!!amountError}
                    helperText={amountError || (dialogSummary ? `Tối đa: ${dialogSummary.remainingAmount.toLocaleString()} ₫` : undefined)}
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
                  <FormControl fullWidth>
                    <InputLabel>Phương thức thanh toán</InputLabel>
                    <Select
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      label="Phương thức thanh toán"
                      sx={{
                        borderRadius: 2,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        }
                      }}
                    >
                      <MenuItem value="banking">Chuyển khoản</MenuItem>
                      <MenuItem value="cash">Tiền mặt</MenuItem>
                      <MenuItem value="check">Séc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={3}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Nhập ghi chú về khoản thanh toán này..."
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

export default TeacherPayments;
