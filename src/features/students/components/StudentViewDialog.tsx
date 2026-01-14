import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { getStudentByIdAPI } from '../services/students.api';
import { Student } from '@shared/types';
import { BaseDialog } from '@shared/components';



const formatGender = (gender?: string) => {
  return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Không xác định';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
};

interface StudentViewDialogProps {
  open: boolean;
  onClose: () => void;
  selectedStudent: Student | null;
}

const StudentViewDialog: React.FC<StudentViewDialogProps> = ({
  open,
  onClose,
  selectedStudent,
}) => {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!open || !selectedStudent?.id) {
        setStudentData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getStudentByIdAPI(selectedStudent.id);
        // API may return shape { statusCode, message, data: {...} }
        const payload = (response as any)?.data?.data ?? (response as any)?.data ?? response;
        if (payload) {
          // Normalize minimal fields expected by UI
          const normalized: any = {
            ...payload,
            // Ensure classes is an array for mapping
            classes: Array.isArray(payload.classes) ? payload.classes : [],
          };
          setStudentData(normalized as Student);
        } else {
          setError('Không thể tải thông tin học sinh');
        }
      } catch (err: any) {
        console.error('Error fetching student details:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin học sinh');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [open, selectedStudent?.id]);

  const handleClose = () => {
    setStudentData(null);
    setError(null);
    onClose();
  };

  if (!selectedStudent) return null;

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title="Chi tiết học sinh"
      subtitle="Thông tin chi tiết về học sinh và lớp học"
      icon={<ViewIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      loading={loading}
      error={error}
      minHeight="60vh"
      contentPadding={0}
    >
      {studentData && (
        <Box sx={{ p: 4 }}>
          {/* Main Information Grid */}
          <Grid container spacing={3}>
            {/* Left Column - Personal Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid #e0e6ed',
                height: '100%'
              }}>
                <Typography variant="h6" gutterBottom sx={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2
                }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    bgcolor: '#667eea',
                    borderRadius: 2
                  }} />
                  Thông tin cá nhân
                </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Họ và tên
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#667eea' }}>
                          {studentData.userId?.name || studentData.name || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {studentData.userId?.email || studentData.email || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {studentData.userId?.phone || studentData.phone || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Ngày sinh
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(studentData.userId?.dayOfBirth || studentData.dayOfBirth) || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Giới tính
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatGender(studentData.userId?.gender || studentData.gender) || 'Chưa cập nhật'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {studentData.userId?.address || studentData.address || 'Chưa cập nhật'}
                      </Typography>
                      </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column - Family & Class Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid #e0e6ed',
                height: '100%'
              }}>
                <Typography variant="h6" gutterBottom sx={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2
                }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    bgcolor: '#667eea',
                    borderRadius: 2
                  }} />
                  Thông tin gia đình & học tập
                </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      border: '1px solid #2196f3'
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Phụ huynh
                      </Typography>
                      {studentData.parent ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1976d2' }}>
                            {studentData.parent.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                            Email: {studentData.parent.email}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                            SĐT: {studentData.parent.phone}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#1976d2' }}>
                          Chưa có thông tin phụ huynh
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                      border: '1px solid #9c27b0'
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Số lớp đang học
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                          {studentData.classes ? studentData.classes.length : 0}
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      border: '1px solid #4caf50'
                    }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Trạng thái học tập
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                          {studentData.classes && studentData.classes.length > 0 ? 'Đang học' : 'Chưa đăng ký lớp'}
                      </Typography>
                      </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Full Width - Class Details */}
              {studentData.classes && studentData.classes.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed'
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2
                    }} />
                    Danh sách lớp học
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <Grid container spacing={2}>
                        {studentData.classes.map((cls, index) => (
                        <Grid item xs={12} md={4} key={String(cls.class?.id || cls.classId?.id || cls.classId || `view-class-${index}`)}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: '#fff',
                              border: '1px solid #ff9800',
                              boxShadow: '0 1px 6px rgba(25,118,210,0.15)'
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                mb: 1,
                                color: '#333'
                              }}
                            >
                                {cls.class?.name || cls.classId?.name || cls.name || `${cls.class?.grade || cls.classId?.grade || ''}.${cls.class?.section || cls.classId?.section || ''}`}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: cls.status === 'active' ? 'success.main' : 'text.secondary',
                                mb: 1
                              }}
                            >
                              {cls.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                            </Typography>
                              {(cls.discountPercent || cls.discount) && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(0,0,0,0.04)',
                                  color: 'text.secondary',
                                  fontWeight: 500
                                }}
                              >
                                  Giảm {cls.discountPercent || cls.discount}%
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </BaseDialog>
  );
};

export default StudentViewDialog;
