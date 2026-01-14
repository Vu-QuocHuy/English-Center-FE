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
import { Payment as PaymentIcon, AttachMoney as AttachMoneyIcon, Paid as PaidIcon, AccountBalanceWallet as WalletIcon, Download as DownloadIcon } from '@mui/icons-material';
import { TeacherPaymentsTable, getAllTeacherPaymentsAPI, updateTeacherPaymentAPI, getTeacherPaymentByIdAPI, exportTeacherPaymentsReportAPI, type TeacherPayment } from '@features/payments';
// @ts-ignore: Allow using xlsx without local type resolution
import * as XLSX from 'xlsx';
import { PaymentHistoryModal, BaseDialog } from '@shared/components';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';

const TeacherPayments: React.FC = () => {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const [payments, setPayments] = React.useState<TeacherPayment[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [statistics, setStatistics] = React.useState<{ totalAmount: number; paidAmount: number; remainingAmount: number }>({
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0
  });
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = React.useState<string>('all');

  const [historyOpen, setHistoryOpen] = React.useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = React.useState<TeacherPayment | null>(null);

  // Edit states
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [editingPayment, setEditingPayment] = React.useState<TeacherPayment | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogSummary, setDialogSummary] = React.useState<{ totalAmount: number; paidAmount: number; remainingAmount: number } | null>(null);

  // Form data
  const [formData, setFormData] = React.useState({
    method: 'banking',
    paidAmount: 0,
    note: ''
  });
  const [amountError, setAmountError] = React.useState<string>('');

  const fetchPayments = React.useCallback(async (page: number = 1) => {
    let params: any = { page, limit: 10 };
    if (paymentStatus !== 'all') params = { ...params, status: paymentStatus };
    if (periodType === 'month') {
      if (selectedYear) params = { ...params, year: selectedYear, month: selectedMonth };
      else params = { ...params, month: selectedMonth };
    }
    else if (periodType === 'quarter') {
      const getQuarterMonths = (q: number) => q === 1 ? { startMonth: 1, endMonth: 3 } : q === 2 ? { startMonth: 4, endMonth: 6 } : q === 3 ? { startMonth: 7, endMonth: 9 } : { startMonth: 10, endMonth: 12 };
      const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
      if (selectedYear) params = { ...params, year: selectedYear, startMonth, endMonth };
      else params = { ...params, startMonth, endMonth };
    } else if (periodType === 'year') {
      if (selectedYear) params = { ...params, year: selectedYear };
    }
    else if (periodType === 'custom') {
      const year = new Date(customStart).getFullYear();
      const startMonth = new Date(customStart).getMonth() + 1;
      const endMonth = new Date(customEnd).getMonth() + 1;
      params = { ...params, year, startMonth, endMonth };
    }
    const res = await getAllTeacherPaymentsAPI(params);
    const responseData = (res as any)?.data?.data || (res as any)?.data || {};
    const data = responseData.result || responseData || [];
    const meta = responseData.meta || { page, totalPages: 1 };
    const stats = responseData.statistics || { totalAmount: 0, paidAmount: 0, remainingAmount: 0 };
    
    setPayments(Array.isArray(data) ? data : []);
    setPagination({ page: meta.page || page, totalPages: meta.totalPages || 1 });
    setStatistics(stats);
  }, [paymentStatus, periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd]);

  React.useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const onPageChange = (page: number) => fetchPayments(page);
  const exportToExcel = async () => {
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

      const res = await exportTeacherPaymentsReportAPI(filters);
      const payload = (res as any)?.data?.data || (res as any)?.data || {};
      const list = Array.isArray(payload.result) ? payload.result as TeacherPayment[] : payments;

      const rows = list.map((p) => ({
        'Giáo viên': p.teacher?.name || p.teacherId?.userId?.name || p.teacherId?.name || '',
        'Tháng/Năm': `${p.month || ''}/${p.year || ''}`,
        'Lương/buổi (₫)': p.teacher?.salaryPerLesson ?? p.salaryPerLesson ?? 0,
        'Số buổi dạy': p.classes && Array.isArray(p.classes) ? p.classes.reduce((s, c) => s + (c.totalLessons || 0), 0) : 0,
        'Tổng lương (₫)': p.totalAmount ?? 0,
        'Đã trả (₫)': p.paidAmount ?? 0,
        'Trạng thái': p.status === 'paid' ? 'Đã thanh toán' : p.status === 'partial' ? 'Nhận một phần' : p.status === 'pending' ? 'Chờ thanh toán' : 'Chưa thanh toán',
      }));

      const totalLessons = rows.reduce((s, r) => s + Number((r as any)['Số buổi dạy'] || 0), 0);
      const totalAmount = rows.reduce((s, r) => s + Number((r as any)['Tổng lương (₫)'] || 0), 0);
      const totalPaid = rows.reduce((s, r) => s + Number((r as any)['Đã trả (₫)'] || 0), 0);
      rows.push({
        'Giáo viên': 'Tổng',
        'Tháng/Năm': '',
        'Lương/buổi (₫)': '',
        'Số buổi dạy': totalLessons,
        'Tổng lương (₫)': totalAmount,
        'Đã trả (₫)': totalPaid,
        'Trạng thái': '',
      } as any);

      const ws = XLSX.utils.json_to_sheet(rows);
      const colWidths = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(k.length, ...rows.map(r => String((r as any)[k] ?? '').length)) + 2 }));
      (ws as any)['!cols'] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ChiTietGiaoVien');
      const now = new Date();
      XLSX.writeFile(wb, `BaoCao_GiaoVien_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.xlsx`);
    } catch (e) {
      console.error('Export teacher payments error:', e);
    }
  };

  // Edit functions
  const handleOpenDialog = async (payment: TeacherPayment) => {
    setError(null);
    setLoading(true);
    try {
      // Fetch latest summary for the selected payment
      const res = await getTeacherPaymentByIdAPI(payment.id);
      const data: any = (res as any)?.data?.data || (res as any)?.data || {};
      const totalAmount = Number(data.totalAmount || payment.totalAmount || 0);
      const paidAmount = Number(data.paidAmount || payment.paidAmount || 0);
      const remainingAmount = Math.max(totalAmount - paidAmount, 0);

      setEditingPayment({ ...payment, totalAmount, paidAmount } as any);
      setDialogSummary({ totalAmount, paidAmount, remainingAmount });

      setFormData({
        method: 'banking',
        paidAmount: 0,
        note: ''
      });
      setAmountError('');
      setDialogOpen(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPayment(null);
    setError(null);
    setDialogSummary(null);
    setAmountError('');
  };

  const handleSubmit = async () => {
    if (!editingPayment) return;

    // Validate amount
    if (!formData.paidAmount || formData.paidAmount <= 0) {
      setAmountError('Vui lòng nhập số tiền thanh toán');
      return;
    }
    if (dialogSummary && formData.paidAmount > dialogSummary.remainingAmount) {
      setAmountError(`Số tiền không được lớn hơn ${dialogSummary.remainingAmount.toLocaleString()} ₫`);
      return;
    }

    setLoading(true);
    setError(null);
    setAmountError('');

    try {
      await updateTeacherPaymentAPI(editingPayment.id, {
        method: formData.method,
        paidAmount: formData.paidAmount,
        note: formData.note
      });

      handleCloseDialog();
      fetchPayments(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (payment: TeacherPayment) => {
    try {
      // Fetch latest payment details by ID
      const res = await getTeacherPaymentByIdAPI(payment.id);
      const payload: any = (res as any)?.data?.data || (res as any)?.data || {};

      // Map API response to the structure expected by PaymentHistoryModal
      const mapped: any = {
        id: payload.id,
        month: payload.month,
        year: payload.year,
        totalAmount: payload.totalAmount,
        paidAmount: payload.paidAmount,
        status: payload.status,
        salaryPerLesson: payload?.teacher?.salaryPerLesson,
        classes: Array.isArray(payload.classes)
          ? payload.classes.map((c: any) => ({ totalLessons: c.totalLessons }))
          : [],
        teacherId: payload.teacher
          ? {
              id: payload.teacher.id,
              name: payload.teacher.name,
              email: payload.teacher.email,
              phone: payload.teacher.phone,
              userId: {
                id: payload.teacher.id,
                name: payload.teacher.name,
                email: payload.teacher.email,
                phone: payload.teacher.phone,
              },
            }
          : undefined,
        // PaymentHistoryModal reads paymentData.paymentHistory
        paymentHistory: Array.isArray(payload.histories)
          ? payload.histories.map((h: any, idx: number) => ({
              id: String(idx),
              amount: h.amount,
              method: h.method,
              note: h.note,
              date: h.date,
              status: 'completed',
            }))
          : [],
      };

      setSelectedPaymentForHistory(mapped as any);
      setHistoryOpen(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải lịch sử thanh toán');
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedPaymentForHistory(null);
  };

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

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
