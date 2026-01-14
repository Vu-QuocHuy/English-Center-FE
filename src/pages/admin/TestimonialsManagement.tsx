import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid,
  Button, TextField
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { NotificationSnackbar, ConfirmDialog, BaseDialog } from '@shared/components';
import { TestimonialTable } from '@features/feedback';
import { commonStyles } from '@shared/utils';
import { createFeedbackAPI, getFeedbacksAPI, updateFeedbackAPI, deleteFeedbackAPI } from '@features/feedback';
import { uploadFileAPI, deleteFileAPI } from '@shared/services';
import { Feedback, CreateFeedbackRequest } from '@shared/types';

const TestimonialsManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<CreateFeedbackRequest & { image?: File }>({
    name: '',
    description: '',
    imageUrl: '',
    publicId: '',
    socialUrl: ''
  });

  // Image upload state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedPublicId, setUploadedPublicId] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [originalPublicId, setOriginalPublicId] = useState<string>('');

  // Fetch feedbacks
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await getFeedbacksAPI({ page: 1, limit: 100 });
      if (response.data?.data?.result) {
        setFeedbacks(response.data.data.result);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setNotification({
        open: true,
        message: 'Không thể tải danh sách đánh giá',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (feedback?: Feedback) => {
    if (feedback) {
      setEditingFeedback(feedback);
      setFormData({
        name: feedback.name,
        description: feedback.description,
        imageUrl: feedback.imageUrl || '',
        publicId: feedback.publicId || '',
        socialUrl: feedback.socialUrl || ''
      });
      setUploadedImageUrl(feedback.imageUrl || '');
      setUploadedPublicId(feedback.publicId || '');
      setOriginalPublicId(feedback.publicId || '');
    } else {
      setEditingFeedback(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        publicId: '',
        socialUrl: ''
      });
      setUploadedImageUrl('');
      setUploadedPublicId('');
      setOriginalPublicId('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setEditingFeedback(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        publicId: '',
        socialUrl: ''
      });
      setUploadedImageUrl('');
      setUploadedPublicId('');
      setOriginalPublicId('');
    }, 100);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      setNotification({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error'
      });
      return;
    }

    try {
            // Nếu đã upload khi chọn ảnh thì dùng luôn; nếu chưa, và có file mới, upload tại đây
      let imageUrl: string | undefined = uploadedImageUrl || editingFeedback?.imageUrl;
      let publicId: string | undefined = uploadedPublicId || editingFeedback?.publicId;

      if (!uploadedImageUrl && formData.image) {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(formData.image);
        imageUrl = uploadRes.data.data.url;
        publicId = uploadRes.data.data.public_id;
        setImageUploading(false);
      }

      // Đảm bảo nếu có imageUrl thì phải có publicId
      if (imageUrl && !publicId) {
        setNotification({
          open: true,
          message: 'Lỗi: Thiếu publicId cho ảnh',
          severity: 'error'
        });
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        imageUrl: imageUrl || undefined,
        publicId: publicId || undefined,
        socialUrl: formData.socialUrl || undefined
      };

      // Debug log để kiểm tra payload
      console.log('Submit Data:', submitData);

      if (editingFeedback) {
        // Update existing feedback
        await updateFeedbackAPI(editingFeedback.id, submitData);

        // If a new image was uploaded in this session, delete old file when it changes
        if (
          (uploadedPublicId && originalPublicId && uploadedPublicId !== originalPublicId) ||
          (uploadedImageUrl && editingFeedback.imageUrl && uploadedImageUrl !== editingFeedback.imageUrl && originalPublicId)
        ) {
          try {
            await deleteFileAPI(originalPublicId);
          } catch (_e) {
            // swallow error - not critical for UX
          }
        }

        setNotification({
          open: true,
          message: 'Cập nhật đánh giá thành công!',
          severity: 'success'
        });
      } else {
        // Create new feedback
        await createFeedbackAPI(submitData);
        setNotification({
          open: true,
          message: 'Thêm đánh giá thành công!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchFeedbacks();
    } catch (error) {
      console.error('Error saving feedback:', error);
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra khi lưu đánh giá',
        severity: 'error'
      });
    }
  };

  const handleDeleteFeedback = (id: string) => {
    setFeedbackToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFeedbackConfirm = async () => {
    if (!feedbackToDelete) return;

    setDeleteLoading(true);
    try {
      // Find the feedback to get its publicId before deleting
      const feedback = feedbacks.find(f => f.id === feedbackToDelete);

      // Delete the feedback first
      await deleteFeedbackAPI(feedbackToDelete);

      // If feedback had an image, delete the file
      if (feedback?.publicId) {
        try {
          await deleteFileAPI(feedback.publicId);
        } catch (_e) {
          // swallow error - not critical for UX
        }
      }

      setNotification({
        open: true,
        message: 'Xóa đánh giá thành công!',
        severity: 'success'
      });
      fetchFeedbacks();
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra khi xóa đánh giá',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteFeedbackCancel = () => {
    setDeleteDialogOpen(false);
    setFeedbackToDelete(null);
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Image upload handler (like AdvertisementManagement)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0] || undefined;
    setFormData({ ...formData, image: file });
    if (file) {
      try {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(file);
        console.log('Upload Response:', uploadRes.data);
        setUploadedImageUrl(uploadRes.data.data.url);
        setUploadedPublicId(uploadRes.data.data.public_id);
      } catch (_err) {
        setNotification({
          open: true,
          message: 'Tải ảnh thất bại, vui lòng thử lại',
          severity: 'error'
        });
        setUploadedImageUrl('');
        setUploadedPublicId('');
      } finally {
        setImageUploading(false);
      }
    } else {
      setUploadedImageUrl('');
      setUploadedPublicId('');
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {/* Header */}
          <Box sx={{ ...commonStyles.pageHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý Đánh giá học viên
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Thêm đánh giá mới
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Quản lý feedback và đánh giá từ học viên
          </Typography>

          {/* Feedbacks List */}
          <TestimonialTable
            feedbacks={feedbacks}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteFeedback}
            loading={loading}
          />

          {/* Dialog for adding/editing feedback */}
          <BaseDialog
            open={openDialog}
            onClose={handleCloseDialog}
            title={editingFeedback ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
            maxWidth="md"
            fullWidth
            contentPadding={0}
            actions={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleCloseDialog} variant="outlined">
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={!formData.name || !formData.description || imageUploading}
                >
                  {imageUploading ? 'Đang tải...' : editingFeedback ? 'Cập nhật' : 'Thêm'}
                </Button>
              </Box>
            }
          >
            <Box sx={{ p: 4 }}>
              <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên học viên *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nội dung đánh giá *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '2px dashed #667eea',
                    borderRadius: 2,
                    minHeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f2fd 100%)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#764ba2',
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 100%)'
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/webp"
                    hidden
                    onChange={handleFileChange}
                  />
                  {formData.image ? (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '360px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: 8
                      }}
                    />
                  ) : editingFeedback && editingFeedback.imageUrl ? (
                    <img
                      src={editingFeedback.imageUrl}
                      alt="current"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '360px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: 8
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#667eea' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body2" color="inherit" sx={{ fontWeight: 600 }}>
                        Tải ảnh đại diện
                      </Typography>
                      <Typography variant="caption" color="inherit">
                        (PNG, JPG, JPEG, WEBP)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link mạng xã hội"
                  value={formData.socialUrl}
                  onChange={(e) => setFormData({ ...formData, socialUrl: e.target.value })}
                  margin="normal"
                  placeholder="https://facebook.com/username"
                />
              </Grid>
            </Grid>
            </Box>
          </BaseDialog>

          <NotificationSnackbar
            open={notification.open}
            message={notification.message}
            severity={notification.severity}
            onClose={handleNotificationClose}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onClose={handleDeleteFeedbackCancel}
            onConfirm={handleDeleteFeedbackConfirm}
            title="Xác nhận xóa đánh giá"
            message="Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
            confirmText="Xóa"
            confirmColor="error"
            loading={deleteLoading}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default TestimonialsManagement;