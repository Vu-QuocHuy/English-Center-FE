import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  Button,
  Pagination,
  Stack
} from '@mui/material';
import { commonStyles } from '@shared/utils';
import type { AuditLogItem } from '../types';

interface AuditLogTableProps {
  logs: AuditLogItem[];
  page?: number;
  totalPages?: number;
  onViewDetail: (log: AuditLogItem) => void;
  onPageChange?: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const formatDateTime = (iso?: string): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return iso;
  }
};

const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  page = 1,
  totalPages = 1,
  onViewDetail,
  onPageChange
}) => {
  return (
    <Stack spacing={2}>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          ...commonStyles.tableContainer,
          overflowX: 'auto',
          overflowY: 'hidden',
          maxWidth: '100%',
          width: '100%',
          boxSizing: 'border-box',
          '&::-webkit-scrollbar': {
            height: 8
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: 4
          }
        }}
      >
        <Table sx={{ minWidth: 800, tableLayout: 'auto', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 150, maxWidth: 200, whiteSpace: 'nowrap' }}>
                Thời gian
              </TableCell>
              <TableCell sx={{ minWidth: 180, maxWidth: 250 }}>Người thực hiện</TableCell>
              <TableCell sx={{ minWidth: 170, maxWidth: 220 }}>Tài nguyên ảnh hưởng</TableCell>
              <TableCell sx={{ minWidth: 120, maxWidth: 150 }}>Hành động</TableCell>
              <TableCell>Mô tả</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatDateTime((log as any).createdAt)}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {log.user?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.user?.email || ''}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      {log.entityName || 'N/A'}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => onViewDetail(log)}
                      sx={{ fontSize: '0.75rem', py: 0.25, px: 1, display: 'block', ml: '-5px' }}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.action || 'N/A'}
                    color="default"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      '& strong': { fontWeight: 600 },
                      '& ul': { pl: 2, my: 0.5 },
                      '& li': { mb: 0.25, fontSize: '0.875rem' },
                      maxWidth: { xs: 200, sm: 300, md: 400 },
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      '& *': { maxWidth: '100%' }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: log.description || 'N/A'
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <Pagination count={totalPages} page={page} onChange={onPageChange} />
        </Box>
      )}
    </Stack>
  );
};

export default AuditLogTable;

