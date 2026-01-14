import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, CircularProgress, Grid, Paper, Divider, Typography, Card, CardContent } from '@mui/material';
import { Download as DownloadIcon, Payment as PaymentIcon, Cancel as CancelIcon, Save as SaveIcon, AttachMoney as AttachMoneyIcon, Paid as PaidIcon, AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { PaymentHistoryModal } from '@shared/components';
import { StudentPaymentsTable, getAllPaymentsAPI, payStudentAPI, exportPaymentsReportAPI, type StudentPayment } from '@features/payments';
import * as XLSX from 'xlsx';
import { BaseDialog } from '@shared/components';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';

interface PaymentHistory {
  id: string;
  amount: number;
  method: string;
  note: string | null;
  createdAt: string;
  createdBy: any;
}

interface StudentPaymentWithHistory extends StudentPayment {
  histories?: PaymentHistory[];
}

interface TotalStatistics {
  totalStudentFees: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
}

const StudentPayments: React.FC = () => {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const [payments, setPayments] = React.useState<StudentPaymentWithHistory[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = React.useState<string>('all');

  const [historyOpen, setHistoryOpen] = React.useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = React.useState<StudentPaymentWithHistory | null>(null);

  const [openPayDialog, setOpenPayDialog] = React.useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = React.useState<StudentPaymentWithHistory | null>(null);
  const [studentPaymentForm, setStudentPaymentForm] = React.useState<{ amount: string; method: string; note: string }>({ amount: '', method: 'cash', note: '' });
  const [studentPaymentLoading, setStudentPaymentLoading] = React.useState<boolean>(false);
  const [exportLoading, setExportLoading] = React.useState<boolean>(false);
  const [amountError, setAmountError] = React.useState<string>('');

  const [totalStatistics, setTotalStatistics] = useState<TotalStatistics>({
    totalStudentFees: 0,
    totalPaidAmount: 0,
    totalRemainingAmount: 0
  });

  const fetchPayments = React.useCallback(async (page: number = 1) => {
    let params: any = { page, limit: 10 };
    const filters: any = {};
    if (paymentStatus !== 'all') filters.status = paymentStatus;
    if (periodType === 'month') {
      filters.month = selectedMonth;
      if (selectedYear) filters.year = selectedYear;
    } else if (periodType === 'quarter') {
      const getQuarterMonths = (q: number) => q === 1 ? { startMonth: 1, endMonth: 3 } : q === 2 ? { startMonth: 4, endMonth: 6 } : q === 3 ? { startMonth: 7, endMonth: 9 } : { startMonth: 10, endMonth: 12 };
      const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
      filters.startMonth = startMonth;
      filters.endMonth = endMonth;
      if (selectedYear) filters.year = selectedYear;
    } else if (periodType === 'year') {
      if (selectedYear) filters.year = selectedYear;
    } else if (periodType === 'custom') {
      const year = new Date(customStart).getFullYear();
      const startMonth = new Date(customStart).getMonth() + 1;
      const endMonth = new Date(customEnd).getMonth() + 1;
      filters.startMonth = startMonth;
      filters.endMonth = endMonth;
      filters.year = year;
    }
    if (Object.keys(filters).length > 0) params.filters = JSON.stringify(filters);
    const res = await getAllPaymentsAPI(params);
    const responseData = (res as any)?.data?.data || (res as any)?.data || {};
    const data = responseData;
    if (data && data.result) {
      setPayments(data.result);
      const meta = data.meta;
      setPagination({ page: meta?.page || page, totalPages: meta?.totalPages || 1 });
      // Use statistics from backend
      if (data.statistics) {
        setTotalStatistics({
          totalStudentFees: data.statistics.totalStudentFees || 0,
          totalPaidAmount: data.statistics.totalPaidAmount || 0,
          totalRemainingAmount: data.statistics.totalRemainingAmount || 0,
        });
      } else {
        // Default to 0 if statistics not available
        setTotalStatistics({ totalStudentFees: 0, totalPaidAmount: 0, totalRemainingAmount: 0 });
      }
    } else {
      setPayments([]);
      setPagination({ page, totalPages: 1 });
      setTotalStatistics({ totalStudentFees: 0, totalPaidAmount: 0, totalRemainingAmount: 0 });
    }
  }, [paymentStatus, periodType, selectedMonth, selectedYear, selectedQuarter, customStart, customEnd]);

  React.useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  const onPageChange = (page: number) => fetchPayments(page);
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const filters: any = {};
      if (paymentStatus !== 'all') filters.status = paymentStatus;
      if (periodType === 'month') {
        filters.month = selectedMonth;
        if (selectedYear) filters.year = selectedYear;
      } else if (periodType === 'quarter') {
        const getQuarterMonths = (q: number) => q === 1 ? { startMonth: 1, endMonth: 3 } : q === 2 ? { startMonth: 4, endMonth: 6 } : q === 3 ? { startMonth: 7, endMonth: 9 } : { startMonth: 10, endMonth: 12 };
        const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
        filters.startMonth = startMonth;
        filters.endMonth = endMonth;
        if (selectedYear) filters.year = selectedYear;
      } else if (periodType === 'year') {
        if (selectedYear) filters.year = selectedYear;
      } else if (periodType === 'custom') {
        const year = new Date(customStart).getFullYear();
        const startMonth = new Date(customStart).getMonth() + 1;
        const endMonth = new Date(customEnd).getMonth() + 1;
        filters.startMonth = startMonth;
        filters.endMonth = endMonth;
        filters.year = year;
      }

      // Backend returns JSON: { statusCode, message, data: { meta, result } }
      const res = await exportPaymentsReportAPI(filters);
      const data = (res as any)?.data?.data || (res as any)?.data || {};
      const list = Array.isArray(data.result) ? (data.result as StudentPaymentWithHistory[]) : [];

      const rows = list.map((p) => ({
        'Học sinh': p.student?.name || '',
        'Lớp': p.class?.name || '',
        'Tháng/Năm': `${p.month}/${p.year}`,
        'Số buổi học': p.totalLessons || 0,
        'Số tiền gốc (₫)': p.totalAmount || 0,
        'Giảm giá (₫)': p.discountAmount || 0,
        'Số tiền cuối (₫)': (p.totalAmount || 0) - (p.discountAmount || 0),
        'Đã đóng (₫)': p.paidAmount || 0,
        'Còn thiếu (₫)': ((p.totalAmount || 0) - (p.discountAmount || 0)) - (p.paidAmount || 0),
        'Trạng thái': p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng',
      }));
      const totalLessons = rows.reduce((s, r) => s + Number((r as any)['Số buổi học'] || 0), 0);
      const totalOriginal = rows.reduce((s, r) => s + Number((r as any)['Số tiền gốc (₫)'] || 0), 0);
      const totalDiscount = rows.reduce((s, r) => s + Number((r as any)['Giảm giá (₫)'] || 0), 0);
      const totalFinal = rows.reduce((s, r) => s + Number((r as any)['Số tiền cuối (₫)'] || 0), 0);
      const totalPaid = rows.reduce((s, r) => s + Number((r as any)['Đã đóng (₫)'] || 0), 0);
      const totalRemaining = rows.reduce((s, r) => s + Number((r as any)['Còn thiếu (₫)'] || 0), 0);
      rows.push({
        'Học sinh': 'Tổng',
        'Lớp': '',
        'Tháng/Năm': '',
        'Số buổi học': totalLessons,
        'Số tiền gốc (₫)': totalOriginal,
        'Giảm giá (₫)': totalDiscount,
        'Số tiền cuối (₫)': totalFinal,
        'Đã đóng (₫)': totalPaid,
        'Còn thiếu (₫)': totalRemaining,
        'Trạng thái': '',
      } as any);

      const ws = XLSX.utils.json_to_sheet(rows);
      const colWidths = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(k.length, ...rows.map(r => String((r as any)[k] ?? '').length)) + 2 }));
      (ws as any)['!cols'] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ChiTietHocSinh');
      const now = new Date();
      XLSX.writeFile(wb, `BaoCao_HocSinh_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.xlsx`);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      alert('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.');
    } finally {
      setExportLoading(false);
    }
  };

  const onOpenHistory = (payment: any) => {
    setSelectedPaymentForHistory(payment);
    setHistoryOpen(true);
  };
  const onCloseHistory = () => { setHistoryOpen(false); setSelectedPaymentForHistory(null); };

  const onOpenPayDialog = (payment: any) => {
    const remainingAmount = (payment.totalAmount || 0) - (payment.discountAmount || 0) - (payment.paidAmount || 0);
    setSelectedPayment(payment);
    setStudentPaymentForm({
      amount: remainingAmount > 0 ? remainingAmount.toString() : '',
      method: 'cash',
      note: ''
    });
    setAmountError('');
    setOpenPayDialog(true);
  };
  const onClosePayDialog = () => {
    setOpenPayDialog(false);
    setSelectedPayment(null);
    setStudentPaymentForm({ amount: '', method: 'cash', note: '' });
    setAmountError('');
  };

  // Calculate summary for student payment
  const getPaymentSummary = () => {
    if (!selectedPayment) return null;
    const totalAmount = (selectedPayment.totalAmount || 0) - (selectedPayment.discountAmount || 0);
    const paidAmount = selectedPayment.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;
    return { totalAmount, paidAmount, remainingAmount };
  };

  const handleChangeStudentPaymentField = (key: 'amount' | 'method' | 'note', value: string) => {
    if (key === 'amount') {
      setStudentPaymentForm(prev => ({ ...prev, amount: value }));
      // Xóa lỗi khi người dùng nhập lại, validation chi tiết xử lý tại onChange TextField
      if (amountError) {
        setAmountError('');
      }
      return;
    }
    setStudentPaymentForm(prev => ({ ...prev, [key]: value }));
  };
  const handleSubmitStudentPayment = async (): Promise<void> => {
    if (!selectedPayment) return;

    const summary = getPaymentSummary();
    const remainingAmount = summary?.remainingAmount ?? 0;
    const amountNum = Number(studentPaymentForm.amount);

    if (!studentPaymentForm.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      setAmountError('Vui lòng nhập số tiền thanh toán lớn hơn 0');
      return;
    }

    if (remainingAmount > 0 && amountNum > remainingAmount) {
      setAmountError(`Số tiền không được lớn hơn ${remainingAmount.toLocaleString()} ₫`);
      return;
    }

    setStudentPaymentLoading(true);
    try {
      await payStudentAPI((selectedPayment as any).id, {
        amount: amountNum,
        method: studentPaymentForm.method,
        note: studentPaymentForm.note
      });
      onClosePayDialog();
      await fetchPayments(pagination.page);
    } finally {
      setStudentPaymentLoading(false);
    }
  };

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

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
