import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Divider,
  Grid,
  TextField,
  Paper,
  Chip
} from '@mui/material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { BaseDialog } from '@shared/components';
import { getAuditLogsAPI, type AuditLogItem } from '@features/audit';
import { commonStyles } from '@shared/utils';
import { AuditLogTable } from '@features/audit';
import axiosInstance from '@shared/utils/axios.customize';

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    userEmail: '',
    entityName: '',
    entityId: '',
    startTime: '',
    endTime: '',
  });

  // Detail dialog state
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);


  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'info';
      case 'POST': return 'success';
      case 'PUT':
      case 'PATCH': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const fetchLogs = async (pageNum = page, pageLimit = limit) => {
    setLoading(true);
    setError(null);
    try {
      // Build filter object
      const filter: any = {};

      if (filters.userEmail) filter.userEmail = filters.userEmail;
      if (filters.entityName) filter.entityName = filters.entityName;
      if (filters.entityId) filter.entityId = filters.entityId;
      if (filters.startTime) filter.startTime = new Date(filters.startTime);
      if (filters.endTime) filter.endTime = new Date(filters.endTime);

      const res = await getAuditLogsAPI({
        page: pageNum,
        limit: pageLimit,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      });
      const data = res.data?.data;
      setLogs(data?.result || []);
      setTotalPages(data?.meta?.totalPages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Không thể tải audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogDetail = async (logId: string) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(`/audit-log/${logId}`);
      setDetailData(response.data?.data || null);
    } catch (e: any) {
      console.error('Error fetching log detail:', e);
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (log: AuditLogItem) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
    fetchLogDetail(log.id);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedLog(null);
    setDetailData(null);
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchLogs(1, limit);
  };

  const handleClearFilters = () => {
    setFilters({
      userEmail: '',
      entityName: '',
      entityId: '',
      startTime: '',
      endTime: '',
    });
    setPage(1);
    fetchLogs(1, limit);
  };

  const renderDetailContent = () => {
    if (detailLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!detailData || !selectedLog) {
      return <Typography color="text.secondary">Không có dữ liệu chi tiết</Typography>;
    }

    return (
      <Box>
        <Grid container spacing={2}>
          {/* Row 1: Entity Name and Action */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Tài nguyên ảnh hưởng</Typography>
            <Typography variant="body1" fontWeight={600}>{selectedLog.entityName}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Hành động</Typography>
            <Chip label={selectedLog.action} color="primary" size="small" />
          </Grid>

          {/* Row 2: Entity ID and Method */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">ID Thực thể</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {selectedLog.entityId || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Method</Typography>
            <Chip
              label={selectedLog.method}
              color={getMethodColor(selectedLog.method) as any}
              size="small"
            />
          </Grid>

          {/* Row 3: User and Path */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Người thực hiện</Typography>
            <Typography variant="body1">
              {selectedLog.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLog.user.email}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Path</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
              {selectedLog.path}
            </Typography>
          </Grid>

          {/* Changed Fields */}
          {selectedLog.changedFields && selectedLog.changedFields.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Các trường đã thay đổi ({selectedLog.changedFields.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedLog.changedFields.map((field) => (
                  <Chip key={field} label={field} size="small" variant="outlined" />
                ))}
              </Box>
            </Grid>
          )}

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Mô tả
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                '& strong': { fontWeight: 600 },
                '& ul': { pl: 3, my: 1 },
                '& li': { mb: 0.5 }
              }}
              dangerouslySetInnerHTML={{ __html: selectedLog.description || 'Không có mô tả' }}
            />
          </Grid>

          {/* Full API Response */}
          {detailData && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Chi tiết đầy đủ
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    maxHeight: 400,
                    overflow: 'auto'
                  }}
                >
                  <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(detailData, null, 2)}
                  </pre>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    );
  };

  useEffect(() => {
    fetchLogs(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Box>
              <Typography sx={commonStyles.pageTitle}>
                Nhật ký Hệ thống
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Theo dõi các hoạt động và thay đổi trong hệ thống
              </Typography>
            </Box>
          </Box>

          {/* Filter Section */}
          <Paper variant="outlined" sx={{ mb: 3, p: 3, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Email người dùng"
                value={filters.userEmail}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Tên tài nguyên"
                value={filters.entityName}
                onChange={(e) => handleFilterChange('entityName', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Entity ID"
                value={filters.entityId}
                onChange={(e) => handleFilterChange('entityId', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                label="Từ ngày"
                value={filters.startTime}
                onChange={(e) => handleFilterChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                type="datetime-local"
                label="Đến ngày"
                value={filters.endTime}
                onChange={(e) => handleFilterChange('endTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={loading}
              sx={commonStyles.primaryButton}
            >
              Áp dụng
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              disabled={loading}
              sx={commonStyles.secondaryButton}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ color: 'error.main', p: 2 }}>{error}</Box>
        ) : logs.length === 0 ? (
          <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>
            Không có log nào
          </Box>
        ) : (
          <AuditLogTable
            logs={logs}
                  page={page}
            totalPages={totalPages}
            onViewDetail={handleViewDetail}
            onPageChange={(_e, value) => {
                    setPage(value);
                    fetchLogs(value, limit);
                  }}
                />
        )}

          {/* Detail Dialog */}
          <BaseDialog
            open={detailDialogOpen}
            onClose={handleCloseDetail}
            title="Chi tiết Log"
            maxWidth="md"
            contentPadding={0}
          >
            <Box sx={{ p: 4 }}>
              {renderDetailContent()}
            </Box>
          </BaseDialog>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AuditLog;