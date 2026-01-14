import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  Grid,
  Paper,
  Autocomplete,
  CircularProgress,
  Button
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { BaseDialog } from '@shared/components';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useLazySearch } from '@shared/hooks';
import { getAllClassesAPI } from '@features/classes';
import { uploadFileAPI } from '@shared/services';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'banner' | 'popup' | 'notification';
  priority: number;
  publicId?: string;
  class?: {
    id: string;
    name: string;
    grade: number;
    section: number;
    year: number;
  } | null;
}

interface FormData {
  title: string;
  description: string;
  image: File | null;
  type: 'banner' | 'popup' | 'notification';
  priority: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
}

interface AdvertisementManagementFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    type: 'banner' | 'popup' | 'notification';
    priority: number;
    imageUrl?: string;
    publicId?: string;
    classId?: string;
  }) => Promise<void>;
  advertisement?: Advertisement | null;
}

const AdvertisementManagementForm: React.FC<AdvertisementManagementFormProps> = ({
  open,
  onClose,
  onSubmit,
  advertisement
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image: null,
    type: 'banner',
    priority: ''
  });
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(undefined);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string; grade?: number; section?: number; year?: number } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Lazy search hook for class selection
  const {
    searchQuery: classSearch,
    setSearchQuery: setClassSearch,
    items: classOptions,
    loading: classLoading,
    hasMore: hasMoreClasses,
    loadMore: loadMoreClasses,
    reset: resetClassSearch
  } = useLazySearch<{ id: string; name: string; grade?: number; section?: number; year?: number }>({
    fetchFn: async (params) => {
      const res = await getAllClassesAPI(params);
      return res.data;
    },
    enabled: open,
    loadOnMount: true,
    pageSize: 10,
    debounceDelay: 500,
    transformFn: (c: any) => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      section: c.section,
      year: c.year
    })
  });

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title || '',
        description: advertisement.description || '',
        image: null,
        type: advertisement.type || 'banner',
        priority: advertisement.priority ? String(advertisement.priority) : ''
      });
      setUploadedImageUrl(advertisement.imageUrl);
      setUploadedPublicId(undefined);
      setClassId(advertisement.class?.id || '');
      const fallbackSelected = advertisement.class
        ? {
            id: advertisement.class.id,
            name: advertisement.class.name,
            grade: advertisement.class.grade,
            section: advertisement.class.section,
            year: advertisement.class.year
          }
        : null;
      setSelectedClass(fallbackSelected);
      setClassSearch(advertisement.class?.name || '');
    } else {
      setFormData({
        title: '',
        description: '',
        image: null,
        type: 'banner',
        priority: ''
      });
      setUploadedImageUrl(undefined);
      setUploadedPublicId(undefined);
      setClassId('');
      setSelectedClass(null);
      setClassSearch('');
    }
    setFormErrors({});
  }, [advertisement, open, setClassSearch]);

  // Ensure selected class stays in sync when options are loaded or updated
  useEffect(() => {
    if (!classId) {
      setSelectedClass(null);
      return;
    }
    const matched = classOptions.find((c) => c.id === classId);
    if (matched) {
      setSelectedClass(matched);
    }
  }, [classOptions, classId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
    if (file) {
      try {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(file);
        setUploadedImageUrl(uploadRes.data.data.url);
        setUploadedPublicId(uploadRes.data.data.public_id);
      } catch (_err) {
        setFormErrors(prev => ({ ...prev, image: 'Tải ảnh thất bại, vui lòng thử lại' }));
        setUploadedImageUrl(undefined);
        setUploadedPublicId(undefined);
      } finally {
        setImageUploading(false);
      }
    } else {
      setUploadedImageUrl(undefined);
      setUploadedPublicId(undefined);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    // Validate
    const errors: FormErrors = {};
    if (!formData.title) errors.title = 'Tiêu đề là bắt buộc';
    if (!formData.description) errors.description = 'Mô tả là bắt buộc';
    
    // Validate priority: phải là số và lớn hơn 0
    if (!formData.priority || formData.priority.trim() === '') {
      errors.priority = 'Độ ưu tiên là bắt buộc';
    } else {
      const priorityNum = Number(formData.priority);
      if (isNaN(priorityNum) || priorityNum <= 0) {
        errors.priority = 'Độ ưu tiên phải là số lớn hơn 0';
      }
    }
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      let imageUrl: string | undefined = uploadedImageUrl ?? advertisement?.imageUrl;
      let publicId: string | undefined = uploadedPublicId;
      
      if (!uploadedImageUrl && formData.image) {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(formData.image);
        imageUrl = uploadRes.data.data.url;
        publicId = uploadRes.data.data.public_id;
        setImageUploading(false);
      }

      await onSubmit({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: Number(formData.priority),
        imageUrl,
        publicId,
        classId: classId || undefined
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        image: null,
        type: 'banner',
        priority: ''
      });
      setUploadedImageUrl(undefined);
      setUploadedPublicId(undefined);
      setClassId('');
      setSelectedClass(null);
      resetClassSearch();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = (): void => {
    setSelectedClass(null);
    setClassId('');
    resetClassSearch();
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={advertisement ? 'Chỉnh sửa quảng cáo' : 'Tạo quảng cáo mới'}
      subtitle={advertisement ? 'Cập nhật thông tin quảng cáo' : 'Tạo quảng cáo mới cho hệ thống'}
      icon={advertisement ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={handleClose}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              border: '2px solid #667eea',
              color: '#667eea',
              bgcolor: 'white',
              '&:hover': {
                background: '#667eea',
                color: 'white',
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.description || imageUploading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#667eea',
              color: 'white',
              '&:hover': { bgcolor: '#5a6fd8' },
              '&:disabled': {
                background: '#ccc',
              }
            }}
            startIcon={imageUploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {imageUploading ? 'Đang xử lý...' : (advertisement ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </>
      }
    >
      <Box sx={{ p: 4 }}>
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
            Thông tin quảng cáo
          </Typography>
          <Box sx={{
            p: 2,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Kiểu hiển thị"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'banner' | 'popup' | 'notification' })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                  error={!!formErrors.type}
                  helperText={formErrors.type}
                >
                  <MenuItem value="banner">Banner</MenuItem>
                  <MenuItem value="popup">Popup</MenuItem>
                  <MenuItem value="notification">Notification</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Độ ưu tiên *"
                  value={formData.priority}
                  onChange={(e) => {
                    setFormData({ ...formData, priority: e.target.value });
                    // Xóa lỗi khi user bắt đầu nhập lại
                    if (formErrors.priority) {
                      setFormErrors(prev => ({ ...prev, priority: undefined }));
                    }
                  }}
                  inputProps={{ min: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                  error={!!formErrors.priority}
                  helperText={formErrors.priority || 'Số nhỏ hơn sẽ hiển thị trước'}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  loading={classLoading}
                  options={classOptions}
                  getOptionLabel={(o) => o?.name || ''}
                  value={selectedClass}
                  onChange={(_, val) => {
                    setSelectedClass(val);
                    setClassId(val?.id || '');
                  }}
                  inputValue={classSearch}
                  onInputChange={(_, val) => setClassSearch(val)}
                  ListboxProps={{
                    onScroll: (event: React.SyntheticEvent) => {
                      const listboxNode = event.currentTarget;
                      if (
                        listboxNode.scrollTop + listboxNode.clientHeight >=
                        listboxNode.scrollHeight - 5 &&
                        hasMoreClasses &&
                        !classLoading
                      ) {
                        loadMoreClasses();
                      }
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn lớp"
                      placeholder="Tìm kiếm lớp theo tên"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {classLoading ? <CircularProgress color="inherit" size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        {(option.grade || option.section || option.year) && (
                          <Typography variant="body2" color="text.secondary">
                            {[
                              option.grade && `Khối ${option.grade}`,
                              option.section && `Lớp ${option.section}`,
                              option.year && `Năm ${option.year}`
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    classLoading ? 'Đang tải...' : 
                    classSearch ? 'Không tìm thấy lớp học' : 
                    'Nhập tên lớp để tìm kiếm'
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '2px dashed #667eea',
                    borderRadius: 0,
                    minHeight: 300,
                    minWidth: '100%',
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
                        maxWidth: '736px',
                        maxHeight: '552px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: 0
                      }}
                    />
                  ) : advertisement && advertisement.imageUrl ? (
                    <img
                      src={advertisement.imageUrl}
                      alt="current"
                      style={{
                        maxWidth: '736px',
                        maxHeight: '552px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: 0
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#667eea' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body2" color="inherit" sx={{ fontWeight: 600 }}>
                        Tải ảnh quảng cáo
                      </Typography>
                      <Typography variant="caption" color="inherit">
                        (PNG, JPG, JPEG, WEBP)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </BaseDialog>
  );
};

export default AdvertisementManagementForm;

