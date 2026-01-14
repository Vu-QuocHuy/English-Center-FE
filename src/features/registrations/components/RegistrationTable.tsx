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
  Tooltip,
  Chip,
  Typography,
  Box,
  Pagination
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

interface RegistrationItem {
  id: string;
  name: string;
  email?: string;
  phone: string;
  gender?: 'male' | 'female';
  address?: string;
  note?: string;
  processed?: boolean;
  createdAt?: string;
  classId?: string;
  class?: {
    id: string;
    name: string;
  };
}

interface RegistrationTableProps {
  rows: RegistrationItem[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAsProcessed: (id: string) => void;
  onPageChange?: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({
  rows,
  loading = false,
  page = 1,
  totalPages = 1,
  onView,
  onDelete,
  onMarkAsProcessed,
  onPageChange
}) => {
  return (
    <>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Lớp học</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell width={180}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography>Đang tải dữ liệu...</Typography>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography>Không có dữ liệu</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email || '-'}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>{r.class?.name || 'Tư vấn chung'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.processed ? 'Đã xử lý' : 'Chưa xử lý'}
                        color={r.processed ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" color="info" onClick={() => onView(r.id)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error" onClick={() => onDelete(r.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!r.processed && (
                        <Tooltip title="Xác nhận xử lý">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onMarkAsProcessed(r.id)}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && onPageChange && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={onPageChange}
              size="large"
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </>
  );
};

export default RegistrationTable;

