import React from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  Paid as PaidIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { BaseDialog } from '@shared/components';
import type { PaymentTransaction } from '@features/parents';

interface ParentPaymentDialogProps {
  open: boolean;
  selectedInvoice: PaymentTransaction | null;
  paymentAmount: string;
  setPaymentAmount: (value: string) => void;
  paymentError: string;
  qrCodeLoading: boolean;
  formatCurrency: (amount: number) => string;
  onClose: () => void;
  onSubmit: () => void;
}

const ParentPaymentDialog: React.FC<ParentPaymentDialogProps> = ({
  open,
  selectedInvoice,
  paymentAmount,
  setPaymentAmount,
  paymentError,
  qrCodeLoading,
  formatCurrency,
  onClose,
  onSubmit,
}) => {
  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Thanh toán học phí"
      subtitle={
        selectedInvoice
          ? `${selectedInvoice.childName} - ${selectedInvoice.className} - Tháng ${selectedInvoice.month}`
          : undefined
      }
      icon={<QrCodeIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="sm"
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={onClose}
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
                bgcolor: 'rgba(102, 126, 234, 0.04)',
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={qrCodeLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
            startIcon={
              qrCodeLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <QrCodeIcon />
              )
            }
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
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                bgcolor: '#ccc',
              },
            }}
          >
            {qrCodeLoading ? 'Đang xử lý...' : 'Tạo mã QR thanh toán'}
          </Button>
        </>
      }
    >
      <Box sx={{ p: 4 }}>
        {/* Summary Cards */}
        {selectedInvoice && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      color: 'text.secondary',
                      fontSize: 12,
                    }}
                  >
                    <AttachMoneyIcon fontSize="small" /> Tổng số tiền
                  </Box>
                  <Box sx={{ fontWeight: 700, fontSize: 18 }}>
                    {formatCurrency(
                      (selectedInvoice.originalAmount || 0) -
                        (selectedInvoice.discountAmount || 0)
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      color: 'text.secondary',
                      fontSize: 12,
                    }}
                  >
                    <PaidIcon fontSize="small" /> Đã thanh toán
                  </Box>
                  <Box sx={{ fontWeight: 700, fontSize: 18 }}>
                    {formatCurrency(selectedInvoice.paidAmount || 0)}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      color: 'text.secondary',
                      fontSize: 12,
                    }}
                  >
                    <WalletIcon fontSize="small" /> Còn lại
                  </Box>
                  <Box sx={{ fontWeight: 700, fontSize: 18 }}>
                    {formatCurrency(selectedInvoice.remainingAmount || 0)}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Số tiền thanh toán"
                type="number"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                inputProps={{ min: 0, max: selectedInvoice?.remainingAmount }}
                required
                placeholder="Nhập số tiền bạn muốn thanh toán"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₫</InputAdornment>
                  ),
                }}
                helperText={
                  selectedInvoice
                    ? `Tối đa: ${formatCurrency(
                        selectedInvoice.remainingAmount || 0
                      )}`
                    : undefined
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>

            {paymentError && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {paymentError}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </BaseDialog>
  );
};

export default ParentPaymentDialog;

