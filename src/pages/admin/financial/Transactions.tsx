import React from 'react';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Typography, IconButton, Tooltip, Grid, MenuItem, Card, CardContent } from '@mui/material';
import { BaseDialog, ConfirmDialog } from '@shared/components';
import { getAllTransactionsAPI, createTransactionAPI, updateTransactionAPI, deleteTransactionAPI, getAllTransactionCategoriesAPI, exportTransactionsReportAPI } from '@shared/services';
import { Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon, Add as AddIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: { id: number; name: string; type: 'revenue' | 'expense' };
  transaction_at?: string;
  transactionAt?: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [statistics, setStatistics] = React.useState<{ totalRevenue: number; totalExpense: number; netProfit: number; totalTransactions: number }>({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    totalTransactions: 0
  });
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'revenue' | 'expense'>('all');

  const [openTransactionDialog, setOpenTransactionDialog] = React.useState<boolean>(false);
  const [transactionForm, setTransactionForm] = React.useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [transactionLoading, setTransactionLoading] = React.useState<boolean>(false);
  const [openEditTransactionDialog, setOpenEditTransactionDialog] = React.useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = React.useState<Transaction | null>(null);
  const [editTransactionForm, setEditTransactionForm] = React.useState<{ amount: string; category_id: string; description: string }>({ amount: '', category_id: '', description: '' });
  const [editTransactionLoading, setEditTransactionLoading] = React.useState<boolean>(false);
  const [openDeleteTransactionDialog, setOpenDeleteTransactionDialog] = React.useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);
  const [deleteTransactionLoading, setDeleteTransactionLoading] = React.useState<boolean>(false);

  const [categories, setCategories] = React.useState<any[]>([]);

  const fetchOtherTransactions = React.useCallback(async (pageNum = 1) => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    const toMDY = (y: number, m: number, d: number) => {
      const mm = m < 10 ? `0${m}` : `${m}`;
      const dd = d < 10 ? `0${d}` : `${d}`;
      return `${mm}/${dd}/${y}`;
    };

    if (periodType === 'year') {
      if (selectedYear) {
        startDate = toMDY(selectedYear, 1, 1);
        endDate = toMDY(selectedYear, 12, 31);
      }
    } else if (periodType === 'month') {
      if (selectedYear) {
        const year = selectedYear;
        const month = selectedMonth;
        const lastDay = new Date(year, month, 0).getDate();
        startDate = toMDY(year, month, 1);
        endDate = toMDY(year, month, lastDay);
      }
    } else if (periodType === 'quarter') {
      if (selectedYear) {
        const q = selectedQuarter;
        const year = selectedYear;
        const startMonth = q === 1 ? 1 : q === 2 ? 4 : q === 3 ? 7 : 10;
        const endMonth = q === 1 ? 3 : q === 2 ? 6 : q === 3 ? 9 : 12;
        const lastDay = new Date(year, endMonth, 0).getDate();
        startDate = toMDY(year, startMonth, 1);
        endDate = toMDY(year, endMonth, lastDay);
      }
    } else if (periodType === 'custom') {
      if (customStart) {
        const [y, m, d] = customStart.split('-').map(Number);
        startDate = toMDY(y, m, d);
      }
      if (customEnd) {
        const [y, m, d] = customEnd.split('-').map(Number);
        endDate = toMDY(y, m, d);
      }
    }

    const params: any = { page: pageNum, limit: 10 };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (typeFilter !== 'all') params.type = typeFilter;

    const res = await getAllTransactionsAPI(params);
    const data = (res as any)?.data?.data || (res as any)?.data || {};
    if (data?.result && Array.isArray(data.result)) {
      setTransactions(data.result);
      const meta = data.meta || {};
      setPagination({ page: meta?.page || pageNum, totalPages: meta?.totalPages || 1 });
      // Set statistics from backend
      if (data.statistics) {
        setStatistics({
          totalRevenue: data.statistics.totalRevenue || 0,
          totalExpense: data.statistics.totalExpense || 0,
          netProfit: data.statistics.netProfit || 0,
          totalTransactions: data.statistics.totalTransactions || 0,
        });
      } else {
        setStatistics({ totalRevenue: 0, totalExpense: 0, netProfit: 0, totalTransactions: 0 });
      }
    } else {
      setTransactions([]);
      setPagination({ page: 1, totalPages: 1 });
      setStatistics({ totalRevenue: 0, totalExpense: 0, netProfit: 0, totalTransactions: 0 });
    }
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, typeFilter]);

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await getAllTransactionCategoriesAPI({ page: 1, limit: 1000 });
      let data: any[] = [];
      if ((res as any)?.data?.data && Array.isArray((res as any).data.data)) data = (res as any).data.data;
      else if ((res as any)?.data && Array.isArray((res as any).data)) data = (res as any).data;
      else if ((res as any)?.data?.data?.result && Array.isArray((res as any).data.data.result)) data = (res as any).data.data.result;
      else if ((res as any)?.data?.result && Array.isArray((res as any).data.result)) data = (res as any).data.result;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchOtherTransactions(1);
    fetchCategories();
  }, [fetchOtherTransactions, fetchCategories]);

  React.useEffect(() => {
    fetchOtherTransactions(1);
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, typeFilter, fetchOtherTransactions]);

  const exportToExcel = async () => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    const toMDY = (y: number, m: number, d: number) => {
      const mm = m < 10 ? `0${m}` : `${m}`;
      const dd = d < 10 ? `0${d}` : `${d}`;
      return `${mm}/${dd}/${y}`;
    };
    if (periodType === 'year') {
      if (selectedYear) {
        startDate = toMDY(selectedYear, 1, 1);
        endDate = toMDY(selectedYear, 12, 31);
      }
    } else if (periodType === 'month') {
      if (selectedYear) {
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        startDate = toMDY(selectedYear, selectedMonth, 1);
        endDate = toMDY(selectedYear, selectedMonth, lastDay);
      }
    } else if (periodType === 'quarter') {
      if (selectedYear) {
        const startMonth = selectedQuarter === 1 ? 1 : selectedQuarter === 2 ? 4 : selectedQuarter === 3 ? 7 : 10;
        const endMonth = selectedQuarter === 1 ? 3 : selectedQuarter === 2 ? 6 : selectedQuarter === 3 ? 9 : 12;
        const lastDay = new Date(selectedYear, endMonth, 0).getDate();
        startDate = toMDY(selectedYear, startMonth, 1);
        endDate = toMDY(selectedYear, endMonth, lastDay);
      }
    } else if (periodType === 'custom') {
      if (customStart) {
        const [y, m, d] = customStart.split('-').map(Number);
        startDate = toMDY(y, m, d);
      }
      if (customEnd) {
        const [y, m, d] = customEnd.split('-').map(Number);
        endDate = toMDY(y, m, d);
      }
    }

    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (typeFilter !== 'all') params.type = typeFilter;

    const res = await exportTransactionsReportAPI(params);
    const payload = (res as any)?.data?.data || (res as any)?.data || {};
    const list = Array.isArray(payload.result) ? payload.result as Transaction[] : transactions;

    const rows = list.map((t) => ({
      'Mô tả': t.description || '-',
      'Loại': t.category?.type === 'revenue' ? 'Thu' : 'Chi',
      'Danh mục': t.category?.name || '-',
      'Số tiền (₫)': t.amount || 0,
      'Ngày thực hiện': (t.transactionAt || t.transaction_at) ? new Date(t.transactionAt || (t.transaction_at as string)).toLocaleDateString('vi-VN') : '-',
    }));
    const totalAmount = rows.reduce((s, r) => s + Number((r as any)['Số tiền (₫)'] || 0), 0);
    rows.push({
      'Mô tả': 'Tổng',
      'Loại': '',
      'Danh mục': '',
      'Số tiền (₫)': totalAmount,
      'Ngày thực hiện': '',
    } as any);
    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] || {}).map((k) => ({ wch: Math.max(k.length, ...rows.map(r => String((r as any)[k] ?? '').length)) + 2 }));
    (ws as any)['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ThuChiKhac');
    const now = new Date();
    XLSX.writeFile(wb, `BaoCao_ThuChiKhac_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.xlsx`);
  };

  const onPageChange = (p: number) => fetchOtherTransactions(p);
  const handleOpenTransactionDialog = async () => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setOpenTransactionDialog(true);
  };
  const handleCloseTransactionDialog = () => setOpenTransactionDialog(false);
  const handleChangeTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => setTransactionForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category_id) return;
    setTransactionLoading(true);
    try {
      await createTransactionAPI({ amount: Number(transactionForm.amount), category_id: transactionForm.category_id, description: transactionForm.description });
      setOpenTransactionDialog(false);
      setTransactionForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setTransactionToEdit(transaction);
    setEditTransactionForm({
      amount: transaction.amount.toString(),
      category_id: transaction.category.id.toString(),
      description: transaction.description || ''
    });
    setOpenEditTransactionDialog(true);
  };
  const handleCloseEditTransactionDialog = () => setOpenEditTransactionDialog(false);
  const handleChangeEditTransactionField = (key: 'amount' | 'category_id' | 'description', value: string) => setEditTransactionForm(prev => ({ ...prev, [key]: value }));
  const handleSubmitEditTransaction = async () => {
    if (!transactionToEdit || !editTransactionForm.amount || !editTransactionForm.category_id) return;
    setEditTransactionLoading(true);
    try {
      await updateTransactionAPI(transactionToEdit.id, { amount: Number(editTransactionForm.amount), category_id: editTransactionForm.category_id, description: editTransactionForm.description });
      setOpenEditTransactionDialog(false);
      setTransactionToEdit(null);
      setEditTransactionForm({ amount: '', category_id: '', description: '' });
      await fetchOtherTransactions(1);
    } finally {
      setEditTransactionLoading(false);
    }
  };
  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setOpenDeleteTransactionDialog(true);
  };
  const handleCloseDeleteTransactionDialog = () => setOpenDeleteTransactionDialog(false);
  const handleConfirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    setDeleteTransactionLoading(true);
    try {
      await deleteTransactionAPI(transactionToDelete.id);
      setOpenDeleteTransactionDialog(false);
      setTransactionToDelete(null);
      await fetchOtherTransactions(1);
    } finally {
      setDeleteTransactionLoading(false);
    }
  };

  return (
    <>
      {/* Statistics Cards */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Tổng thu</Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">{statistics.totalRevenue.toLocaleString()} ₫</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Tổng chi</Typography>
                <Typography variant="h5" color="error.main" fontWeight="bold">{statistics.totalExpense.toLocaleString()} ₫</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Lợi nhuận ròng</Typography>
                <Typography variant="h5" color={statistics.netProfit >= 0 ? "success.main" : "error.main"} fontWeight="bold">{statistics.netProfit.toLocaleString()} ₫</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Số lượng giao dịch</Typography>
                <Typography variant="h5" color="info.main" fontWeight="bold">{statistics.totalTransactions}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField select label="Loại" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="revenue">Thu</MenuItem>
            <MenuItem value="expense">Chi</MenuItem>
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
              <TextField label="Từ ngày" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} sx={{ minWidth: 160 }} InputLabelProps={{ shrink: true }} />
              <TextField label="Đến ngày" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} sx={{ minWidth: 160 }} InputLabelProps={{ shrink: true }} />
            </>
          )}
        </Box>
        <Box>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>Xuất Excel</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenTransactionDialog}
        >
          Thêm hóa đơn
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Danh mục</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Số tiền</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ngày thực hiện</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t, idx) => (
              <TableRow key={t.id || idx} hover>
                <TableCell><Typography variant="body2">{t.description || '-'}</Typography></TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: t.category?.type === 'revenue' ? '#2e7d32' : '#c62828',
                      border: `1px solid ${t.category?.type === 'revenue' ? '#2e7d32' : '#c62828'}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {t.category?.type === 'revenue' ? 'Thu' : 'Chi'}
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2" fontWeight={500}>{t.category?.name || '-'}</Typography></TableCell>
                <TableCell align="right"><Typography variant="body2" color="text.primary">{t.amount ? t.amount.toLocaleString() : '0'} ₫</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{(t.transactionAt || t.transaction_at) ? new Date(t.transactionAt || (t.transaction_at as string)).toLocaleDateString('vi-VN') : '-'}</Typography></TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Chỉnh sửa"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => handleEditTransaction(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeleteTransaction(t)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={pagination.totalPages} page={pagination.page} onChange={(_, p) => onPageChange(p)} />
      </Box>

      {/* Dialog tạo thu chi khác */}
      <BaseDialog
        open={openTransactionDialog}
        onClose={handleCloseTransactionDialog}
        title="Thêm thu/chi khác"
        subtitle="Nhập thông tin khoản thu/chi (tiền điện, nước, dịch vụ,...)"
        maxWidth="sm"
        fullWidth
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleCloseTransactionDialog} variant="outlined">
              Hủy
            </Button>
            <Button
              onClick={handleSubmitTransaction}
              variant="contained"
              disabled={transactionLoading}
            >
              {transactionLoading ? 'Đang xử lý...' : 'Lưu'}
            </Button>
          </Box>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Số tiền" type="number" fullWidth value={transactionForm.amount} onChange={(e) => handleChangeTransactionField('amount', e.target.value)} inputProps={{ min: 0 }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Danh mục" value={transactionForm.category_id} onChange={(e) => handleChangeTransactionField('category_id', e.target.value)}>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline minRows={2} value={transactionForm.description} onChange={(e) => handleChangeTransactionField('description', e.target.value)} />
          </Grid>
        </Grid>
      </BaseDialog>

      {/* Dialog chỉnh sửa thu chi khác */}
      <BaseDialog
        open={openEditTransactionDialog}
        onClose={handleCloseEditTransactionDialog}
        title="Chỉnh sửa thu/chi khác"
        subtitle="Cập nhật thông tin khoản thu/chi"
        maxWidth="sm"
        fullWidth
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleCloseEditTransactionDialog} variant="outlined">
              Hủy
            </Button>
            <Button
              onClick={handleSubmitEditTransaction}
              variant="contained"
              disabled={editTransactionLoading}
            >
              {editTransactionLoading ? 'Đang xử lý...' : 'Cập nhật'}
            </Button>
          </Box>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Số tiền" type="number" fullWidth value={editTransactionForm.amount} onChange={(e) => handleChangeEditTransactionField('amount', e.target.value)} inputProps={{ min: 0 }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Danh mục" value={editTransactionForm.category_id} onChange={(e) => handleChangeEditTransactionField('category_id', e.target.value)}>
              {Array.isArray(categories) && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.type === 'revenue' ? 'Thu' : 'Chi'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Mô tả" fullWidth multiline minRows={2} value={editTransactionForm.description} onChange={(e) => handleChangeEditTransactionField('description', e.target.value)} />
          </Grid>
        </Grid>
      </BaseDialog>

      {/* Dialog xác nhận xóa hóa đơn */}
      <ConfirmDialog
        open={openDeleteTransactionDialog}
        onClose={handleCloseDeleteTransactionDialog}
        onConfirm={handleConfirmDeleteTransaction}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa hóa đơn "${transactionToDelete?.description || 'Không có mô tả'}" với số tiền ${transactionToDelete?.amount ? transactionToDelete.amount.toLocaleString() : '0'} ₫? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmColor="error"
        loading={deleteTransactionLoading}
      />
    </>
  );
};

export default Transactions;

