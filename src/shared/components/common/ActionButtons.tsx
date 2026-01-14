import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { ActionButtonsProps } from '@shared/types';

const ActionButtons: React.FC<ActionButtonsProps> = React.memo(({
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
  size = 'small',
  sx = {},
  ...props
}) => {
  return (
    <>
      {showView && onView && (
        <Tooltip title="Xem chi tiết">
          <IconButton
            size={size}
            onClick={onView}
            sx={{ color: '#1976d2', ...sx }}
            {...props}
          >
            <ViewIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {showEdit && onEdit && (
        <Tooltip title="Chỉnh sửa">
          <IconButton
            size={size}
            onClick={onEdit}
            sx={{ color: '#ed6c02', ...sx }}
            {...props}
          >
            <EditIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {showDelete && onDelete && (
        <Tooltip title="Xóa">
          <IconButton
            size={size}
            onClick={onDelete}
            sx={{ color: '#d32f2f', ...sx }}
            {...props}
          >
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
