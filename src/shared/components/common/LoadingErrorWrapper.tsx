// Reusable wrapper for loading and error states
import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';

interface LoadingErrorWrapperProps {
  loading: boolean;
  error: string;
  children: React.ReactNode;
  loadingHeight?: string;
  centerLoading?: boolean;
}

const LoadingErrorWrapper: React.FC<LoadingErrorWrapperProps> = ({
  loading,
  error,
  children,
  loadingHeight = '50vh',
  centerLoading = true
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: centerLoading ? 'center' : 'flex-start',
          height: loadingHeight,
          pt: centerLoading ? 0 : 3
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default LoadingErrorWrapper;
