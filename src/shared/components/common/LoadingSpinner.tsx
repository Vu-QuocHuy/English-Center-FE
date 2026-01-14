import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { LoadingSpinnerProps } from '@shared/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  loading = false,
  message = 'Đang tải...',
  size = 'medium',
  variant = 'spinner',
  sx = {},
  ...props
}) => {
  if (!loading) return null;

  const getSize = (): number => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 60;
      default: return 40;
    }
  };

  const getMessageVariant = (): "body1" | "body2" | "h6" => {
    switch (size) {
      case 'small': return 'body2';
      case 'large': return 'h6';
      default: return 'body1';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 2,
        ...sx,
      }}
      {...props}
    >
      {(variant === 'spinner' || variant === 'both') && (
        <CircularProgress size={getSize()} />
      )}

      {(variant === 'text' || variant === 'both') && (
        <Typography
          variant={getMessageVariant()}
          color="text.secondary"
          textAlign="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
