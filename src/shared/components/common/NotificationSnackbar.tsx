import React from 'react';
import { Snackbar, Alert, AlertTitle, AlertColor } from '@mui/material';

interface NotificationSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertColor;
  title?: string;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

interface ColorScheme {
  color: string;
  borderColor: string;
  iconColor: string;
}

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  onClose,
  message,
  severity = 'info',
  title,
  autoHideDuration = 3000,
  anchorOrigin = { vertical: 'top', horizontal: 'right' }
}) => {
  // Define colors based on severity
  const getColors = (severity: AlertColor): ColorScheme => {
    switch (severity) {
      case 'success':
        return {
          color: '#2e7d32', // Green
          borderColor: '#2e7d32',
          iconColor: '#2e7d32'
        };
      case 'error':
        return {
          color: '#d32f2f', // Red
          borderColor: '#d32f2f',
          iconColor: '#d32f2f'
        };
      case 'warning':
        return {
          color: '#ed6c02', // Orange
          borderColor: '#ed6c02',
          iconColor: '#ed6c02'
        };
      default:
        return {
          color: '#1976d2', // Blue
          borderColor: '#1976d2',
          iconColor: '#1976d2'
        };
    }
  };

  const colors = getColors(severity);

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        zIndex: 9999, // Hiển thị trên tất cả các dialog và nội dung khác
        position: 'fixed',
        top: anchorOrigin.vertical === 'top' ? '24px' : undefined,
        bottom: anchorOrigin.vertical === 'bottom' ? '24px' : undefined,
        left: anchorOrigin.horizontal === 'left' ? '24px' : undefined,
        right: anchorOrigin.horizontal === 'right' ? '24px' : undefined,
        '& .MuiSnackbar-root': {
          zIndex: 9999,
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="outlined"
        sx={{
          width: '100%',
          backgroundColor: 'white',
          color: colors.color,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          '& .MuiAlert-icon': {
            color: colors.iconColor
          },
          '& .MuiAlert-message': {
            color: colors.color
          },
          '& .MuiAlertTitle-root': {
            color: colors.color
          },
          '& .MuiAlert-action .MuiIconButton-root': {
            color: colors.color
          }
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
