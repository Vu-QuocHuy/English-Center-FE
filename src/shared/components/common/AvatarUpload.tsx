import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { uploadAvatarAPI } from '@shared/services';
import { uploadFileAPI, deleteFileAPI } from '@shared/services';
import { useAuth } from '@contexts/AuthContext';
import { BaseDialog, NotificationSnackbar } from '@shared/components';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  size?: number;
  width?: number;
  height?: number;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  size = 120,
  width,
  height,
  onAvatarUpdate,
}) => {
  // Use width/height if provided, otherwise use size for both (square)
  const avatarWidth = width ?? size;
  const avatarHeight = height ?? size;
  const fontSize = Math.min(avatarWidth, avatarHeight) * 0.4;
  const { updateUser, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedPublicId, setUploadedPublicId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    // Click avatar -> mở chọn ảnh ngay
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      setPreviewUrl(e.target?.result as string);
      setIsDialogOpen(true);

      // Tải file lên ngay khi chọn (giống luồng quảng cáo): nhận imageUrl/publicId và lưu sẵn
      try {
        // Nếu trước đó đã có bản upload tạm (chưa cập nhật avatar), xóa nó trước để tránh rác
        if (uploadedPublicId) {
          try {
            await deleteFileAPI(uploadedPublicId);
          } catch (_) {
            // ignore cleanup error
          } finally {
            setUploadedImageUrl('');
            setUploadedPublicId('');
          }
        }
        // Xóa avatar hiện tại của user ngay khi chọn ảnh mới
        const currentAvatarPublicId = (user as any)?.avatarPublicId || (user as any)?.publicId || (user as any)?.avatar_public_id;
        if (currentAvatarPublicId) {
          try {
            await deleteFileAPI(currentAvatarPublicId);
          } catch (_) {
            // ignore cleanup error
          }
        }
        const fileRes = await uploadFileAPI(file);
        const fileData = fileRes.data?.data || fileRes.data || {};
        const imageUrl = fileData.url;
        const publicId = fileData.public_id;
        if (!imageUrl || !publicId) {
          throw new Error('Không nhận được imageUrl/publicId từ API Upload file');
        }
        setUploadedImageUrl(imageUrl);
        setUploadedPublicId(publicId);
      } catch (err: any) {
        setError(err.message || 'Tải file thất bại, vui lòng thử lại');
        setUploadedImageUrl('');
        setUploadedPublicId('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      // 2) Gọi Upload avatar bằng imageUrl/publicId đã có sẵn từ bước upload file
      const imageUrl = uploadedImageUrl;
      const publicId = uploadedPublicId;
      if (!imageUrl || !publicId) {
        throw new Error('Chưa sẵn sàng: vui lòng chờ tải file xong hoặc chọn lại ảnh');
      }

      // Keep old public id to delete later
      const oldPublicId = (user as any)?.avatarPublicId || (user as any)?.publicId || (user as any)?.avatar_public_id;

      const response = await uploadAvatarAPI({ imageUrl, publicId });

      if (response.data) {
        // Update user context with new avatar
        if (updateUser) {
          const avatarUpdateData = {
            avatar: imageUrl,
            avatarPublicId: publicId,
          };

          // Merge with response user data if available
          if (response.data.user) {
            updateUser({ ...response.data.user, ...avatarUpdateData });
          } else {
            updateUser(avatarUpdateData);
          }

          // Also update localStorage directly to ensure immediate sync
          const userData = localStorage.getItem('userData');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              parsedUser.avatar = imageUrl;
              parsedUser.avatarPublicId = publicId;
              localStorage.setItem('userData', JSON.stringify(parsedUser));
            } catch (err) {
              console.error('Error updating localStorage:', err);
            }
          }
        }

        // Call callback if provided
        if (onAvatarUpdate) {
          onAvatarUpdate(imageUrl);
        }

        // Remove old file if exists and different
        if (oldPublicId && oldPublicId !== publicId) {
          try {
            await deleteFileAPI(oldPublicId);
          } catch (_) {
            // ignore cleanup error
          }
        }

        // Close dialog
        setIsDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl('');
        setUploadedImageUrl('');
        setUploadedPublicId('');
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Có lỗi xảy ra khi tải ảnh lên');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    // Hủy bỏ upload tạm nếu chưa dùng để cập nhật avatar
    if (uploadedPublicId) {
      deleteFileAPI(uploadedPublicId).catch(() => {}).finally(() => {
        setUploadedImageUrl('');
        setUploadedPublicId('');
      });
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Box
          sx={{
            width: avatarWidth,
            height: avatarHeight,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          }}
          onClick={handleAvatarClick}
        >
          {currentAvatar ? (
            <Box
              component="img"
              src={currentAvatar}
              alt={userName}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Typography
              sx={{
                color: 'white',
                fontSize: `${fontSize}px`,
                fontWeight: 600,
              }}
            >
              {getInitials(userName)}
            </Typography>
          )}
        </Box>
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            bgcolor: 'primary.main',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
          onClick={handleAvatarClick}
        >
          <CameraIcon sx={{ color: 'white', fontSize: 20 }} />
        </IconButton>
      </Box>
      {/* Hidden file input should be mounted even when dialog is closed */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <BaseDialog
        open={isDialogOpen}
        onClose={handleClose}
        title="Cập nhật ảnh đại diện"
        subtitle="Chọn ảnh đại diện mới cho tài khoản của bạn"
        icon={<ImageIcon sx={{ fontSize: 28, color: 'white' }} />}
        maxWidth="sm"
        contentPadding={3}
        hideDefaultAction={true}
        actions={
          <>
            <Button onClick={handleClose} disabled={uploading} variant="outlined" sx={{ mr: 1.5 }}>
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {uploading ? 'Đang tải lên...' : 'Cập nhật'}
            </Button>
          </>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {previewUrl ? (
            <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 2, border: '1px solid #e5e7eb' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    maxHeight: 400,
                    borderRadius: 2,
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                    objectFit: 'cover',
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleFileInputClick}
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Chọn ảnh khác
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 2, border: '1px dashed #cbd5e1', background: '#f8fafc' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CloudUploadIcon sx={{ fontSize: 52, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Chọn ảnh đại diện
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hỗ trợ: JPG, PNG, GIF — Tối đa 5MB
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleFileInputClick}
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Chọn ảnh
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
        </BaseDialog>

      <NotificationSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
};

export default AvatarUpload;
