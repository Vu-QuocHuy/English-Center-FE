import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { Feedback } from '@shared/types';

interface TestimonialTableProps {
  feedbacks: Feedback[];
  onEdit: (feedback: Feedback) => void;
  onDelete: (feedbackId: string) => void;
  loading?: boolean;
}

const TestimonialTable: React.FC<TestimonialTableProps> = ({
  feedbacks,
  onEdit,
  onDelete,
  loading = false
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={2}
      sx={{
        backgroundColor: 'white',
        '& .MuiTableBody-root .MuiTableCell-root': {
          color: 'black !important'
        },
        '& .MuiTableBody-root .MuiTypography-root': {
          color: 'inherit !important'
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Hình ảnh</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Họ tên</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Nội dung</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Ngày tạo</TableCell>
            <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbacks && Array.isArray(feedbacks) && feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <TableRow 
                key={feedback.id} 
                hover 
                sx={{
                  '& .MuiTableCell-root': { color: '#000000 !important' },
                  '& .MuiTypography-root': { color: '#000000 !important' },
                  '& .MuiTableCell-root .MuiTypography-root': { color: '#000000 !important' },
                  '& .MuiTableCell-root > *:not(.MuiSvgIcon-root):not(.MuiIconButton-root):not(.MuiChip-root)': {
                    color: '#000000 !important'
                  }
                }}
              >
                <TableCell>
                  <Avatar
                    src={feedback.imageUrl}
                    sx={{ width: 50, height: 50 }}
                  >
                    {feedback.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {feedback.name}
                  </Typography>
                  {feedback.socialUrl && (
                    <Chip
                      label="Có link mạng xã hội"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {feedback.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {feedback.createdAt
                      ? new Date(feedback.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(feedback)}
                      sx={{ color: 'grey.600' }}
                      title="Chỉnh sửa"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(feedback.id)}
                      sx={{ color: '#f44336' }}
                      title="Xóa"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.primary' }}>
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu đánh giá
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TestimonialTable;

