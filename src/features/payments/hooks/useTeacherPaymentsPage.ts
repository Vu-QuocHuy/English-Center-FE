import React from 'react';
import {
  getAllTeacherPaymentsAPI,
  payTeacherAPI,
  getTeacherPaymentByIdAPI,
  exportTeacherPaymentsReportAPI,
  type TeacherPayment,
} from '@features/payments';
import { useDebounce } from '@shared/hooks';
import * as XLSX from 'xlsx';

export const useTeacherPaymentsPage = () => {
  const [payments, setPayments] = React.useState<TeacherPayment[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [statistics, setStatistics] = React.useState<{ totalAmount: number; paidAmount: number; remainingAmount: number }>({
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
  });
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = React.useState<string>('all');
  const [searchTeacherName, setSearchTeacherName] = React.useState<string>('');
  const debouncedSearchTeacherName = useDebounce(searchTeacherName, 500);

  const [historyOpen, setHistoryOpen] = React.useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = React.useState<TeacherPayment | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [editingPayment, setEditingPayment] = React.useState<TeacherPayment | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogSummary, setDialogSummary] = React.useState<{ totalAmount: number; paidAmount: number; remainingAmount: number } | null>(null);

  const [formData, setFormData] = React.useState({
    method: 'bank_transfer',
    paidAmount: 0,
    note: '',
  });
  const [amountError, setAmountError] = React.useState<string>('');

  const fetchPayments = React.useCallback(
    async (page: number = 1) => {
      let params: any = { page, limit: 10 };
      const filters: any = {};
      if (paymentStatus !== 'all') filters.status = paymentStatus;
      if (debouncedSearchTeacherName && debouncedSearchTeacherName.trim()) {
        filters.teacherName = debouncedSearchTeacherName.trim();
      }
      if (periodType === 'month') {
        filters.month = selectedMonth;
        if (selectedYear) filters.year = selectedYear;
      } else if (periodType === 'quarter') {
        const getQuarterMonths = (q: number) =>
          q === 1
            ? { startMonth: 1, endMonth: 3 }
            : q === 2
            ? { startMonth: 4, endMonth: 6 }
            : q === 3
            ? { startMonth: 7, endMonth: 9 }
            : { startMonth: 10, endMonth: 12 };
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
      if (Object.keys(filters).length > 0) {
        params.filters = JSON.stringify(filters);
      }
      const res = await getAllTeacherPaymentsAPI(params);
      const responseData = (res as any)?.data?.data || (res as any)?.data || {};
      const data = responseData.result || responseData || [];
      const meta = responseData.meta || { page, totalPages: 1 };
      const stats = responseData.statistics || { totalAmount: 0, paidAmount: 0, remainingAmount: 0 };

      setPayments(Array.isArray(data) ? data : []);
      setPagination({ page: meta.page || page, totalPages: meta.totalPages || 1 });
      setStatistics(stats);
    },
    [paymentStatus, periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, debouncedSearchTeacherName],
  );

  React.useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const onPageChange = (page: number) => fetchPayments(page);

  const exportToExcel = async () => {
    try {
      const filters: any = {};
      if (paymentStatus !== 'all') filters.status = paymentStatus;
      if (debouncedSearchTeacherName && debouncedSearchTeacherName.trim()) {
        filters.teacherName = debouncedSearchTeacherName.trim();
      }
      if (periodType === 'month') {
        filters.month = selectedMonth;
        if (selectedYear) filters.year = selectedYear;
      } else if (periodType === 'quarter') {
        const getQuarterMonths = (q: number) =>
          q === 1
            ? { startMonth: 1, endMonth: 3 }
            : q === 2
            ? { startMonth: 4, endMonth: 6 }
            : q === 3
            ? { startMonth: 7, endMonth: 9 }
            : { startMonth: 10, endMonth: 12 };
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
      const list = Array.isArray(payload.result) ? (payload.result as TeacherPayment[]) : payments;

      const rows = list.map((p) => ({
        'Giáo viên': p.teacher?.name || p.teacherId?.userId?.name || p.teacherId?.name || '',
        'Tháng/Năm': `${p.month || ''}/${p.year || ''}`,
        'Lương/buổi (₫)': p.teacher?.salaryPerLesson ?? p.salaryPerLesson ?? 0,
        'Số buổi dạy': p.classes && Array.isArray(p.classes) ? p.classes.reduce((s, c) => s + (c.totalLessons || 0), 0) : 0,
        'Tổng lương (₫)': p.totalAmount ?? 0,
        'Đã trả (₫)': p.paidAmount ?? 0,
        'Trạng thái':
          p.status === 'paid'
            ? 'Đã thanh toán'
            : p.status === 'partial'
            ? 'Nhận một phần'
            : p.status === 'pending'
            ? 'Chờ thanh toán'
            : 'Chưa thanh toán',
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
      const colWidths = Object.keys(rows[0] || {}).map((k) => ({
        wch: Math.max(k.length, ...rows.map((r) => String((r as any)[k] ?? '').length)) + 2,
      }));
      (ws as any)['!cols'] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ChiTietGiaoVien');
      const now = new Date();
      XLSX.writeFile(wb, `BaoCao_GiaoVien_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.xlsx`);
    } catch (e) {
      console.error('Export teacher payments error:', e);
      throw e;
    }
  };

  const handleOpenDialog = async (payment: TeacherPayment) => {
    setError(null);
    setLoading(true);
    try {
      const res = await getTeacherPaymentByIdAPI(payment.id);
      const data: any = (res as any)?.data?.data || (res as any)?.data || {};
      const totalAmount = Number(data.totalAmount || payment.totalAmount || 0);
      const paidAmount = Number(data.paidAmount || payment.paidAmount || 0);
      const remainingAmount = Math.max(totalAmount - paidAmount, 0);

      setEditingPayment({ ...payment, totalAmount, paidAmount } as any);
      setDialogSummary({ totalAmount, paidAmount, remainingAmount });

      setFormData({
        method: 'bank_transfer',
        paidAmount: 0,
        note: '',
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

  const handleSubmit = async (): Promise<boolean> => {
    if (!editingPayment) return false;

    if (!formData.paidAmount || formData.paidAmount <= 0) {
      setAmountError('Vui lòng nhập số tiền thanh toán');
      return false;
    }
    if (dialogSummary && formData.paidAmount > dialogSummary.remainingAmount) {
      setAmountError(`Số tiền không được lớn hơn ${dialogSummary.remainingAmount.toLocaleString()} ₫`);
      return false;
    }

    setLoading(true);
    setError(null);
    setAmountError('');

    try {
      // Gọi đúng endpoint thanh toán lương giáo viên: PATCH /teacher-payments/:id/pay
      await payTeacherAPI(editingPayment.id, {
        amount: formData.paidAmount,
        method: formData.method,
        note: formData.note,
      });

      handleCloseDialog();
      fetchPayments(1);
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const openHistory = async (payment: TeacherPayment) => {
    try {
      const res = await getTeacherPaymentByIdAPI(payment.id);
      const payload: any = (res as any)?.data?.data || (res as any)?.data || {};

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

  return {
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
  };
};

