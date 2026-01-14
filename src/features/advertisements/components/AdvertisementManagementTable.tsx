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
  Avatar,
  Box,
  Typography,
  Pagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'banner' | 'popup' | 'notification';
  priority: number;
  isActive?: boolean;
  class?: {
    id: string;
    name: string;
    grade: number;
    section: number;
    year: number;
    status: string;
  } | null;
}

interface AdvertisementManagementTableProps {
  advertisements: Advertisement[];
  onEdit: (advertisement: Advertisement) => void;
  onDelete: (id: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const AdvertisementManagementTable: React.FC<AdvertisementManagementTableProps> = ({
  advertisements,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange
}) => {
  const getDisplayTypeLabel = (displayType: string): string => {
    switch (displayType) {
      case 'banner': return 'Banner';
      case 'popup': return 'Popup';
      case 'notification': return 'Notification';
      default: return 'Banner';
    }
  };

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Hình ảnh</TableCell>
            <TableCell sx={{ minWidth: 150, maxWidth: 200 }}>Tiêu đề</TableCell>
            <TableCell sx={{ minWidth: 200, maxWidth: 300 }}>Mô tả</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Độ ưu tiên</TableCell>
            <TableCell>Lớp</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {advertisements.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell>
                <Avatar
                  src={ad.imageUrl}
                  alt={ad.title}
                  variant="rounded"
                  sx={{ width: 60, height: 40 }}
                />
              </TableCell>
              <TableCell sx={{ maxWidth: 200 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight="bold"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4
                  }}
                >
                  {ad.title}
                </Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 300 }}>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4
                  }}
                >
                  {ad.description}
                </Typography>
              </TableCell>
              <TableCell>
                {getDisplayTypeLabel(ad.type)}
              </TableCell>
              <TableCell>
                {ad.priority}
              </TableCell>
              <TableCell>
                {ad.class ? (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{ad.class.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Lớp: {ad.class.grade}.{ad.class.section} • Năm: {ad.class.year}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">—</Typography>
                )}
              </TableCell>
              <TableCell>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1.25,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: ad.isActive ? '#2e7d32' : '#c62828',
                    border: `1px solid ${ad.isActive ? '#2e7d32' : '#c62828'}`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {ad.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </Box>
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => onEdit(ad)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete(ad.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination count={totalPages} page={page} onChange={(_, p) => onPageChange(p)} />
      </Box>
    </TableContainer>
  );
};

export default AdvertisementManagementTable;