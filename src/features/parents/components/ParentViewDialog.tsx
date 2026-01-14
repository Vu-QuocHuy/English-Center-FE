import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { getParentByIdAPI } from '../services/parents.api';
import type { Parent } from '@shared/types';
import { BaseDialog } from '@shared/components';

const formatGender = (gender?: string) => {
  return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Không xác định';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

interface ParentViewDialogProps {
  open: boolean;
  onClose: () => void;
  selectedParent: Parent | null;
}

const ParentViewDialog: React.FC<ParentViewDialogProps> = ({ open, onClose, selectedParent }) => {
  const [parentData, setParentData] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParent = async () => {
      if (!open || !selectedParent?.id) {
        setParentData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getParentByIdAPI(selectedParent.id);
        const payload = (response as any)?.data?.data ?? (response as any)?.data ?? response;
        if (payload) {
          const normalized: any = {
            ...payload,
            students: Array.isArray(payload.students) ? payload.students : [],
          };
          setParentData(normalized as Parent);
        } else {
          setError('Không thể tải thông tin phụ huynh');
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error fetching parent details:', err);
        setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin phụ huynh');
      } finally {
        setLoading(false);
      }
    };

    fetchParent();
  }, [open, selectedParent?.id]);

  const handleClose = () => {
    setParentData(null);
    setError(null);
    onClose();
  };

  if (!selectedParent) return null;

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title="Chi tiết phụ huynh"
      subtitle="Thông tin chi tiết phụ huynh và danh sách con"
      icon={<ViewIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      loading={loading}
      error={error}
      minHeight="50vh"
      contentPadding={0}
    >
      {parentData && (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed', height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                    Thông tin cá nhân
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#667eea' }}>
                          {parentData.name || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {parentData.email || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {parentData.phone || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate((parentData as any).dayOfBirth) || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Giới tính
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatGender((parentData as any).gender) || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {parentData.address || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed', height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                    Danh sách con
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {parentData.students && parentData.students.length > 0 ? (
                      <Grid container spacing={1}>
                        {parentData.students.map((student: any, idx: number) => (
                          <Grid item xs={12} key={student?.id || `child-${idx}`}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {student?.name || 'Không rõ tên'}
                            </Typography>
                            {student?.email && (
                              <Typography variant="caption" color="text.secondary">
                                {student.email}
                              </Typography>
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có con
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
      )}
    </BaseDialog>
  );
};

export default ParentViewDialog;