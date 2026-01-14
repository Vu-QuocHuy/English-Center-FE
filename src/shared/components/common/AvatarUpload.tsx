import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { uploadAvatarAPI } from '@shared/services';
import { uploadFileAPI, deleteFileAPI } from '@shared/services';
import { useAuth } from '@contexts/AuthContext';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  size?: number;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  size = 120,
  onAvatarUpdate,
}) => {
  const { updateUser, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedPublicId, setUploadedPublicId] = useState<string>('');
  const [error, setError] = useState<string>('');
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
        <Avatar
          sx={{
            width: size,
            height: size,
            bgcolor: 'primary.main',
            fontSize: `${size * 0.4}px`,
            border: '4px solid white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          src={currentAvatar}
          alt={userName}
          onClick={handleAvatarClick}
        >
          {getInitials(userName)}
        </Avatar>
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

      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Cập nhật ảnh đại diện
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {previewUrl ? (
              <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                    Xem trước ảnh đại diện
                  </Typography>
                  <Avatar
                    src={previewUrl}
                    sx={{
                      width: 180,
                      height: 180,
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
                    }}
                  >
                    {getInitials(userName)}
                  </Avatar>
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
              <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3, border: '1px dashed #cbd5e1', background: '#f8fafc' }}>
                <CardContent sx={{ textAlign: 'center' }}>
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

          {/* file input moved outside dialog */}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
            Mẹo: Dùng ảnh vuông (1:1) để hiển thị đẹp nhất.
          </Typography>
          <Box>
            <Button onClick={handleClose} disabled={uploading} sx={{ mr: 1.5 }}>
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={16} /> : null}
              sx={{ borderRadius: 2 }}
            >
              {uploading ? 'Đang tải lên...' : 'Cập nhật'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvatarUpload;
