import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  SxProps,
  Theme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
  error?: string | null;
  contentPadding?: number | string;
  minHeight?: string;
  defaultActionText?: string;
  onDefaultAction?: () => void;
  defaultActionVariant?: 'contained' | 'outlined' | 'text';
  defaultActionColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  hideDefaultAction?: boolean;
  PaperProps?: {
    sx?: SxProps<Theme>;
  };
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon: _icon, // Icon prop is kept for backward compatibility but not displayed
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true,
  showCloseButton = true,
  loading = false,
  error = null,
  contentPadding = 2,
  minHeight,
  PaperProps,
}) => {

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          ...(minHeight && { minHeight }),
          ...PaperProps?.sx,
        },
        ...PaperProps,
      }}
    >
      <DialogTitle
        sx={{
          background: '#0277bd',
          color: 'white',
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: subtitle ? 0.5 : 0, color: 'white' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            size="small"
            disabled={loading}
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              p: contentPadding,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Box sx={{ p: contentPadding }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        ) : (
          <Box sx={{ p: contentPadding }}>{children}</Box>
        )}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BaseDialog;

