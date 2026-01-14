import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';
import { EmptyStateProps } from '@shared/types';

const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  title = 'Không có dữ liệu',
  message = 'Chưa có dữ liệu nào được tìm thấy.',
  icon: Icon = InboxIcon,
  showIcon = true,
  variant = 'paper',
  sx = {},
  ...props
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
        textAlign: 'center',
        ...sx,
      }}
      {...props}
    >
      {showIcon && Icon && (
        <Icon
          sx={{
            fontSize: 64,
            color: 'text.disabled',
            mb: 1,
          }}
        />
      )}

      <Typography
        variant="h6"
        color="text.primary"
        fontWeight={600}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        maxWidth={400}
      >
        {message}
      </Typography>
    </Box>
  );

  if (variant === 'paper') {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        {content}
      </Paper>
    );
  }

  return content;
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
