import { useState, useEffect, useMemo, useCallback } from 'react';
import { getParentByIdAPI } from '@features/parents';
import { getPaymentsByStudentAPI, getQRCodeAPI } from '@features/payments';

export interface PaymentTransaction {
  id: string;
  paymentId?: string;
  childName: string;
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
}

interface PaymentData {
  invoices: PaymentTransaction[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface PaymentsSummary {
  totalPaid: number;
  totalUnpaid: number;
  totalDiscount: number;
  totalAmount: number;
  unpaidInvoices: number;
  paidInvoices: number;
  partialInvoices: number;
  totalInvoices: number;
}

interface UseParentPaymentsReturn {
  loading: boolean;
  error: string;
  allInvoices: PaymentTransaction[];
  summary: PaymentsSummary;
  filteredInvoices: PaymentTransaction[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedTab: number;
  handleTabChange: (_e: any, newVal: number) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => 'success' | 'warning' | 'error' | 'default';
  getStatusLabel: (status: string) => string;
  // Payment dialog
  paymentDialogOpen: boolean;
  selectedInvoice: PaymentTransaction | null;
  paymentAmount: string;
  setPaymentAmount: (value: string) => void;
  paymentError: string;
  qrCodeUrl: string;
  qrCodeLoading: boolean;
  qrDialogOpen: boolean;
  handlePayment: (invoice: PaymentTransaction) => void;
  handleClosePaymentDialog: () => void;
  handleRegenerateQRCode: () => void;
  handleCloseQRDialog: () => void;
  // History modal
  paymentHistoryModalOpen: boolean;
  selectedPaymentForHistory: PaymentTransaction | null;
  handleOpenPaymentHistory: (payment: PaymentTransaction) => void;
  handleClosePaymentHistory: () => void;
  // Snackbar
  snackbar: SnackbarState;
  handleCloseSnackbar: () => void;
}

export const useParentPayments = (user: any | null): UseParentPaymentsReturn => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [paymentData, setPaymentData] = useState<PaymentData>({ invoices: [] });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<number>(0);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransaction | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');

  // QR Code states
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(false);
  const [qrDialogOpen, setQrDialogOpen] = useState<boolean>(false);

  // History modal
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState<boolean>(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState<PaymentTransaction | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (user) {
      void fetchPaymentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPaymentData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // 1) Lấy danh sách con của phụ huynh
      const parentId =
        (user as any)?.parentId ||
        localStorage.getItem('parent_id') ||
        user?.id ||
        '';
      const parentRes = await getParentByIdAPI(String(parentId));
      const parentPayload: any =
        (parentRes as any)?.data?.data ??
        (parentRes as any)?.data ??
        {};
      const students: Array<{ id: string; name: string }> = Array.isArray(
        parentPayload?.students
      )
        ? parentPayload.students
        : [];

      // 2) Gọi API thanh toán theo từng học sinh song song
      const paymentsArrays = await Promise.all(
        students.map(async (stu) => {
          try {
            const resp = await getPaymentsByStudentAPI(String(stu.id), {
              page: 1,
              limit: 2,
            });
            const data: any =
              (resp as any)?.data?.data ?? (resp as any)?.data ?? {};
            const list: any[] = Array.isArray(data?.result)
              ? data.result
              : Array.isArray(data)
              ? data
              : [];
            return list.map((item: any) => ({ item, student: stu }));
          } catch {
            return [] as Array<{
              item: any;
              student: { id: string; name: string };
            }>;
          }
        })
      );

      const flat = paymentsArrays.flat();

      // 3) Map dữ liệu về dạng invoice chi tiết cho UI
      const invoices: PaymentTransaction[] = flat.map(
        ({ item, student }) => {
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
            id:
              paymentId ||
              `${student.id}-${year}-${monthNum}-${item?.class?.id || 'unknown'}`,
            paymentId,
            childName: student?.name || item?.student?.name || '-',
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
            paymentHistory: Array.isArray(item?.histories)
              ? item.histories
              : [],
            // giữ thêm thông tin gốc nếu cần
            ...(item || {}),
          } as any;
        }
      );

      setPaymentData({ invoices });
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Có lỗi xảy ra khi tải thông tin thanh toán'
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
      case 'overdue':
      case 'quá hạn':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'đã thanh toán':
        return 'Đã thanh toán';
      case 'partial':
      case 'thanh toán một phần':
        return 'Thanh toán một phần';
      case 'pending':
      case 'chờ thanh toán':
        return 'Chờ thanh toán';
      case 'overdue':
      case 'quá hạn':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  const allInvoices = paymentData.invoices;

  const summary = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalDiscount = 0;
    let totalAmount = 0;
    let unpaidInvoices = 0;
    let paidInvoices = 0;
    let partialInvoices = 0;

    allInvoices.forEach((inv) => {
      totalPaid += inv.paidAmount || 0;
      totalUnpaid += inv.remainingAmount || 0;
      totalDiscount += inv.discountAmount || 0;
      totalAmount += inv.finalAmount || 0;
      const st = String(inv.status || '').toLowerCase();
      if (st === 'paid') paidInvoices++;
      else if (st === 'partial') partialInvoices++;
      else unpaidInvoices++;
    });

    return {
      totalPaid,
      totalUnpaid,
      totalDiscount,
      totalAmount,
      unpaidInvoices,
      paidInvoices,
      partialInvoices,
      totalInvoices: allInvoices.length,
    };
  }, [allInvoices]);

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === '' ||
        invoice.childName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        invoice.className
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      if (selectedTab === 0) return matchesSearch;
      if (selectedTab === 1)
        return (
          matchesSearch &&
          invoice.status.toLowerCase() !== 'paid' &&
          invoice.status.toLowerCase() !== 'partial'
        );
      if (selectedTab === 2)
        return (
          matchesSearch && invoice.status.toLowerCase() === 'partial'
        );
      if (selectedTab === 3)
        return (
          matchesSearch && invoice.status.toLowerCase() === 'paid'
        );
      return matchesSearch;
    });
  }, [allInvoices, searchQuery, selectedTab]);

  const handleTabChange = (_e: any, newVal: number) => setSelectedTab(newVal);

  const handlePayment = (invoice: PaymentTransaction) => {
    setSelectedInvoice(invoice);
    setPaymentAmount('');
    setPaymentError('');
    setQrCodeUrl('');
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentError('');
    setQrCodeUrl('');
  };

  const handleGenerateQRCode = async (
    paymentId: string,
    amount: number
  ) => {
    if (!paymentId || !amount || amount <= 0) {
      setPaymentError('Số tiền thanh toán không hợp lệ');
      return;
    }

    try {
      setQrCodeLoading(true);
      setPaymentError('');

      const response = await getQRCodeAPI(amount, paymentId);

      const qrUrl = response.data?.data?.qrUrl;
      if (qrUrl) {
        setQrCodeUrl(qrUrl);
        setQrDialogOpen(true);
        setSnackbar({
          open: true,
          message: 'Đã tạo mã QR. Vui lòng quét để thanh toán.',
          severity: 'success',
        });
      } else {
        setPaymentError('Không thể tạo mã QR');
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Có lỗi xảy ra khi tạo mã QR';
      setPaymentError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleCloseQRDialog = () => {
    setQrDialogOpen(false);
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentError('');
    setQrCodeUrl('');
    void fetchPaymentData();
  };

  const handleOpenPaymentHistory = (payment: PaymentTransaction) => {
    setSelectedPaymentForHistory(payment);
    setPaymentHistoryModalOpen(true);
  };

  const handleClosePaymentHistory = () => {
    setSelectedPaymentForHistory(null);
    setPaymentHistoryModalOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleRegenerateQRCode = () => {
    if (!selectedInvoice) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Số tiền thanh toán không hợp lệ');
      return;
    }
    const maxAmount = selectedInvoice.remainingAmount;
    if (amount > maxAmount) {
      setPaymentError(
        'Số tiền thanh toán không được vượt quá số tiền còn lại'
      );
      return;
    }

    const paymentId = selectedInvoice.paymentId || selectedInvoice.id;
    if (!paymentId) {
      setPaymentError('Không tìm thấy mã thanh toán');
      return;
    }

    void handleGenerateQRCode(paymentId, amount);
  };

  return {
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
  };
};