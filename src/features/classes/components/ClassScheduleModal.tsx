import React from 'react';
import { Box, Typography } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { Class } from '@shared/types';
import { BaseDialog } from '@shared/components';

interface ClassScheduleModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
}

const ClassScheduleModal: React.FC<ClassScheduleModalProps> = ({
  classItem,
  open,
  onClose
}) => {
  if (!classItem) return null;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={`Lịch học lớp ${classItem.name}`}
      icon={<ScheduleIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
    >
      <Box mt={2}>
        <Typography variant="body1" color="text.secondary">
          Lịch học chi tiết của lớp này sẽ được hiển thị ở đây.
        </Typography>
      </Box>
    </BaseDialog>
  );
};

export default ClassScheduleModal;