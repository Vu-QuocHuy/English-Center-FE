import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPaymentsByStudentAPI } from '@features/payments';

export interface TuitionTransaction {
  id: string;
  paymentId?: string;
  className: string;
  month: string | number;
  year?: number;
  attendedLessons: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  dueDate?: string;
  paymentDate?: string;
  paymentMethod?: string;
  description?: string;
  paymentHistory?: any[];
  histories?: any[];
  student?: any;
  studentId?: any;
  class?: any;
  classId?: any;
  totalAmount?: number;
}

interface TuitionData {
  invoices: TuitionTransaction[];
}

interface TuitionSummary {
  totalPaid: number;
  totalUnpaid: number;
  totalDiscount: number;
  totalAmount: number;
  unpaidInvoices: number;
  paidInvoices: number;
  partialInvoices: number;
  totalInvoices: number;
}

interface UseStudentTuitionReturn {
  loading: boolean;
  error: string;
  allInvoices: TuitionTransaction[];
  summary: TuitionSummary;
  filteredInvoices: TuitionTransaction[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedTab: number;
  handleTabChange: (_e: any, newVal: number) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => 'success' | 'warning' | 'error' | 'default';
  getStatusLabel: (status: string) => string;
}

export const useStudentTuition = (user: any | null): UseStudentTuitionReturn => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tuitionData, setTuitionData] = useState<TuitionData>({ invoices: [] });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<number>(0);

  useEffect(() => {
    if (user) {
      void fetchTuitionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTuitionData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const studentId = (user as any)?.studentId || user?.id || '';
      
      if (!studentId) {
        setError('Không tìm thấy thông tin học sinh');
        setLoading(false);
        return;
      }

      const resp = await getPaymentsByStudentAPI(String(studentId), {
        page: 1,
        limit: 1000, // Lấy tất cả để hiển thị
      });
      
      const data: any = (resp as any)?.data?.data ?? (resp as any)?.data ?? {};
      const list: any[] = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];

      // Map dữ liệu về dạng invoice chi tiết cho UI
      const invoices: TuitionTransaction[] = list.map((item: any) => {
        const monthNum = Number(item?.month) || 0;
        const year = Number(item?.year) || new Date().getFullYear();
        const attendedLessons = Number(item?.totalLessons) || 0;
        const originalAmount = Number(item?.totalAmount) || 0;
        const discountAmount = Number(item?.discountAmount) || 0;
        const paidAmount = Number(item?.paidAmount) || 0;
        const finalAmount = Math.max(0, originalAmount - discountAmount);
        const remainingAmount = Math.max(0, finalAmount - paidAmount);

        const paymentId = String(item?.id || '');

        return {
          id: paymentId || `${studentId}-${year}-${monthNum}-${item?.class?.id || 'unknown'}`,
          paymentId,
          className: item?.class?.name || '-',
          month: `${monthNum}/${year}`,
          year,
          attendedLessons,
          originalAmount,
          discountAmount,
          finalAmount,
          paidAmount,
          remainingAmount,
          status: String(item?.status || 'pending'),
          paymentHistory: Array.isArray(item?.histories) ? item.histories : [],
          histories: Array.isArray(item?.histories) ? item.histories : [],
          dueDate: item?.dueDate,
          paymentDate: item?.paymentDate,
          paymentMethod: item?.paymentMethod,
          description: item?.description,
          // Giữ lại thông tin gốc để PaymentHistoryModal có thể sử dụng
          student: item?.student,
          studentId: item?.studentId || item?.student,
          class: item?.class,
          classId: item?.classId || item?.class,
          totalAmount: originalAmount,
        } as TuitionTransaction;
      });

      setTuitionData({ invoices });
    } catch (error: any) {
      setError(
        error?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin học phí'
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'đã thanh toán':
        return 'success';
      case 'partial':
      case 'thanh toán một phần':
        return 'warning';
      case 'pending':
      case 'chờ thanh toán':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Đã thanh toán';
      case 'partial':
        return 'Thanh toán một phần';
      case 'pending':
        return 'Chờ thanh toán';
      default:
        return status;
    }
  };

  const summary: TuitionSummary = useMemo(() => {
    const invoices = tuitionData.invoices;
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalUnpaid = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const totalDiscount = invoices.reduce((sum, inv) => sum + inv.discountAmount, 0);
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    
    // Đếm invoices theo status (giống logic trong filteredInvoices)
    let unpaidInvoices = 0;
    let paidInvoices = 0;
    let partialInvoices = 0;
    
    invoices.forEach((inv) => {
      const status = String(inv.status || '').toLowerCase();
      if (status === 'paid') {
        paidInvoices++;
      } else if (status === 'partial') {
        partialInvoices++;
      } else {
        // pending hoặc các status khác (chưa thanh toán)
        unpaidInvoices++;
      }
    });

    return {
      totalPaid,
      totalUnpaid,
      totalDiscount,
      totalAmount,
      unpaidInvoices,
      paidInvoices,
      partialInvoices,
      totalInvoices: invoices.length,
    };
  }, [tuitionData.invoices]);

  const filteredInvoices = useMemo(() => {
    return tuitionData.invoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === '' ||
        invoice.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.month.toString().toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Filter by tab (giống logic trong useParentPayments)
      if (selectedTab === 0) return true; // Tất cả
      
      const status = invoice.status.toLowerCase();
      
      if (selectedTab === 1) {
        // Chưa thanh toán: không phải paid và không phải partial
        return status !== 'paid' && status !== 'partial';
      }
      
      if (selectedTab === 2) {
        // Thanh toán một phần: chỉ lấy partial
        return status === 'partial';
      }
      
      if (selectedTab === 3) {
        // Đã thanh toán: chỉ lấy paid
        return status === 'paid';
      }
      
      return true;
    });
  }, [tuitionData.invoices, selectedTab, searchQuery]);

  const handleTabChange = (_e: any, newVal: number) => {
    setSelectedTab(newVal);
  };

  return {
    loading,
    error,
    allInvoices: tuitionData.invoices,
    summary,
    filteredInvoices,
    searchQuery,
    setSearchQuery,
    selectedTab,
    handleTabChange,
    formatCurrency,
    getStatusColor,
    getStatusLabel,
  };
};
