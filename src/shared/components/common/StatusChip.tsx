import React from 'react';
import { Chip } from '@mui/material';
import { StatusChipProps } from '@shared/types';

const StatusChip: React.FC<StatusChipProps> = React.memo(({
  label,
  color = 'default',
  size = 'small',
  variant = 'filled',
  sx = {},
  ...props
}) => {
  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    />
  );
});

StatusChip.displayName = 'StatusChip';

export default StatusChip;
