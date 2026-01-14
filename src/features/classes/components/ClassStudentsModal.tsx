import React from 'react';
import { Box, Typography } from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import { Class } from '@shared/types';
import { BaseDialog } from '@shared/components';

interface ClassStudentsModalProps {
  classItem: Class | null;
  open: boolean;
  onClose: () => void;
}

const ClassStudentsModal: React.FC<ClassStudentsModalProps> = ({
  classItem,
  open,
  onClose
}) => {
  if (!classItem) return null;

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={`Học sinh lớp ${classItem.name}`}
      icon={<GroupIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="lg"
    >
      <Box mt={2}>
        <Typography variant="body1" color="text.secondary">
          Danh sách học sinh trong lớp này sẽ được hiển thị ở đây.
        </Typography>
      </Box>
    </BaseDialog>
  );
};

export default ClassStudentsModal;
