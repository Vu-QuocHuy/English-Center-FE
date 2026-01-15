import React, { useState } from 'react';
import {
  getAllPaymentsAPI,
  payStudentAPI,
  exportPaymentsReportAPI,
  type StudentPayment,
} from '@features/payments';
import { useDebounce } from '@shared/hooks';
import * as XLSX from 'xlsx';

interface PaymentHistory {
  id: string;
  amount: number;
  method: string;
  note: string | null;
  createdAt: string;
  createdBy: any;
}

export interface StudentPaymentWithHistory extends StudentPayment {
  histories?: PaymentHistory[];
}

export interface TotalStatistics {
  totalStudentFees: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
}

export const useStudentPaymentsPage = () => {
  const [payments, setPayments] = React.useState<StudentPaymentWithHistory[]>([]);
  const [pagination, setPagination] = React.useState<{ page: number; totalPages: number }>({ page: 1, totalPages: 1 });
  const [periodType, setPeriodType] = React.useState<string>('year');
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = React.useState<number>(1);
  const [customStart, setCustomStart] = React.useState<string>(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = React.useState<string>('all');
  const [searchStudentName, setSearchStudentName] = React.useState<string>('');
  const debouncedSearchStudentName = useDebounce(searchStudentName, 500);

  const [historyOpen, setHistoryOpen] = React.useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = React.useState<StudentPaymentWithHistory | null>(null);

  const [openPayDialog, setOpenPayDialog] = React.useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = React.useState<StudentPaymentWithHistory | null>(null);
  const [studentPaymentForm, setStudentPaymentForm] = React.useState<{ amount: string; method: string; note: string }>({
    amount: '',
    method: 'cash',
    note: '',
  });
  const [studentPaymentLoading, setStudentPaymentLoading] = React.useState<boolean>(false);
  const [exportLoading, setExportLoading] = React.useState<boolean>(false);
  const [amountError, setAmountError] = React.useState<string>('');

  const [totalStatistics, setTotalStatistics] = useState<TotalStatistics>({
    totalStudentFees: 0,
    totalPaidAmount: 0,
    totalRemainingAmount: 0,
  });

  const fetchPayments = React.useCallback(
    async (page: number = 1) => {
      let params: any = { page, limit: 10 };
      const filters: any = {};
      if (paymentStatus !== 'all') filters.status = paymentStatus;
      if (debouncedSearchStudentName && debouncedSearchStudentName.trim()) {
        filters.studentName = debouncedSearchStudentName.trim();
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
      if (Object.keys(filters).length > 0) params.filters = JSON.stringify(filters);
      const res = await getAllPaymentsAPI(params);
      const responseData = (res as any)?.data?.data || (res as any)?.data || {};
      const data = responseData;
      if (data && data.result) {
        setPayments(data.result);
        const meta = data.meta;
        setPagination({ page: meta?.page || page, totalPages: meta?.totalPages || 1 });
        if (data.statistics) {
          setTotalStatistics({
            totalStudentFees: data.statistics.totalStudentFees || 0,
            totalPaidAmount: data.statistics.totalPaidAmount || 0,
            totalRemainingAmount: data.statistics.totalRemainingAmount || 0,
          });
        } else {
          setTotalStatistics({ totalStudentFees: 0, totalPaidAmount: 0, totalRemainingAmount: 0 });
        }
      } else {
        setPayments([]);
        setPagination({ page, totalPages: 1 });
        setTotalStatistics({ totalStudentFees: 0, totalPaidAmount: 0, totalRemainingAmount: 0 });
      }
    },
    [paymentStatus, periodType, selectedMonth, selectedYear, selectedQuarter, customStart, customEnd, debouncedSearchStudentName],
  );

  React.useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const onPageChange = (page: number) => fetchPayments(page);

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const filters: any = {};
      if (paymentStatus !== 'all') filters.status = paymentStatus;
      if (debouncedSearchStudentName && debouncedSearchStudentName.trim()) {
        filters.studentName = debouncedSearchStudentName.trim();
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
      const colWidths = Object.keys(rows[0] || {}).map((k) => ({
        wch: Math.max(k.length, ...rows.map((r) => String((r as any)[k] ?? '').length)) + 2,
      }));
      (ws as any)['!cols'] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ChiTietHocSinh');
      const now = new Date();
      XLSX.writeFile(wb, `BaoCao_HocSinh_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.xlsx`);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      throw error;
    } finally {
      setExportLoading(false);
    }
  };

  const onOpenHistory = (payment: StudentPaymentWithHistory) => {
    setSelectedPaymentForHistory(payment);
    setHistoryOpen(true);
  };

  const onCloseHistory = () => {
    setHistoryOpen(false);
    setSelectedPaymentForHistory(null);
  };

  const onOpenPayDialog = (payment: StudentPaymentWithHistory) => {
    const remainingAmount = (payment.totalAmount || 0) - (payment.discountAmount || 0) - (payment.paidAmount || 0);
    setSelectedPayment(payment);
    setStudentPaymentForm({
      amount: remainingAmount > 0 ? remainingAmount.toString() : '',
      method: 'cash',
      note: '',
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

  const getPaymentSummary = () => {
    if (!selectedPayment) return null;
    const totalAmount = (selectedPayment.totalAmount || 0) - (selectedPayment.discountAmount || 0);
    const paidAmount = selectedPayment.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;
    return { totalAmount, paidAmount, remainingAmount };
  };

  const handleChangeStudentPaymentField = (key: 'amount' | 'method' | 'note', value: string) => {
    if (key === 'amount') {
      setStudentPaymentForm((prev) => ({ ...prev, amount: value }));
      if (amountError) {
        setAmountError('');
      }
      return;
    }
    setStudentPaymentForm((prev) => ({ ...prev, [key]: value }));
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
        note: studentPaymentForm.note,
      });
      onClosePayDialog();
      await fetchPayments(pagination.page);
    } finally {
      setStudentPaymentLoading(false);
    }
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
  };
};

