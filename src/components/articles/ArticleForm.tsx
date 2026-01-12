import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import { createArticleAPI, updateArticleAPI, ArticleData } from '../../services/articles';
import { uploadFileAPI } from '../../services/files';
import { MenuItem as MenuItemType } from '../../types';
import BaseDialog from '../common/BaseDialog';
import { Edit as EditIcon, Add as AddIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ArticleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  article?: {
    id: string;
    title: string;
    content: string;
    menuId: string;
    order?: number;
    isActive?: boolean;
    file?: string;
    publicId?: string;
  } | null;
  menuItems: MenuItemType[];
  defaultMenuId?: string;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  open,
  onClose,
  onSuccess,
  article,
  menuItems,
  defaultMenuId
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [menuId, setMenuId] = useState(defaultMenuId || '');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(undefined);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | undefined>(undefined);
  const [imageUploading, setImageUploading] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      if (article) {
        setTitle(article.title);
        setContent(article.content);
        setMenuId(article.menuId);
        setOrder(article.order || 1);
        setIsActive(article.isActive ?? true);
        setUploadedImageUrl(article.file);
        setUploadedPublicId(article.publicId);
        setThumbnailFile(null);
      } else {
        setTitle('');
        setContent('');
        setMenuId(defaultMenuId || '');
        setOrder(1);
        setIsActive(true);
        setUploadedImageUrl(undefined);
        setUploadedPublicId(undefined);
        setThumbnailFile(null);
      }
      setError(null);
    }
  }, [article, open, defaultMenuId]);

  // Update editor content when content state changes and editor is ready
  useEffect(() => {
    if (open && editorRef.current) {
      // Small delay to ensure editor is fully initialized
      const timer = setTimeout(() => {
        if (editorRef.current && content !== undefined) {
          const currentContent = editorRef.current.getContent();
          // Only update if content is different to avoid unnecessary updates
          if (currentContent !== content) {
            editorRef.current.setContent(content || '');
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [content, open, article?.id]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung');
      return;
    }
    if (!menuId) {
      setError('Vui lòng chọn menu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const articleData: ArticleData = {
        title: title.trim(),
        content: content.trim(),
        menuId,
        order,
        isActive,
        file: uploadedImageUrl,
        publicId: uploadedPublicId
      };

      if (article) {
        await updateArticleAPI(article.id, articleData);
      } else {
        await createArticleAPI(articleData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const response = await uploadFileAPI(file);
      return response.data?.data?.url || '';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    if (file) {
      try {
        setImageUploading(true);
        const uploadRes = await uploadFileAPI(file);
        setUploadedImageUrl(uploadRes.data.data.url);
        setUploadedPublicId(uploadRes.data.data.public_id);
      } catch (_err) {
        setError('Tải ảnh thumbnail thất bại, vui lòng thử lại');
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

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setUploadedImageUrl(undefined);
    setUploadedPublicId(undefined);
  };

  // Render menu options recursively
  const renderMenuOptions = (items: MenuItemType[], level: number = 0): React.ReactNode[] => {
    const options: React.ReactNode[] = [];

    items.forEach(item => {
      options.push(
        <MenuItem key={item.id} value={item.id} sx={{ pl: level * 2 }}>
          {level > 0 && '└─ '}
          {item.title}
        </MenuItem>
      );

      // Support both childrenMenu (from transformed data) and children (from API)
      const children = (item as any).childrenMenu || item.children || [];
      if (children.length > 0) {
        options.push(...renderMenuOptions(children, level + 1));
      }
    });

    return options;
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={article ? 'Chỉnh sửa Bài viết' : 'Tạo Bài viết Mới'}
      icon={article ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      error={error}
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || uploading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {loading ? <CircularProgress size={20} /> : article ? 'Cập nhật' : 'Tạo'}
          </Button>
        </>
      }
    >
        <Box sx={{ p: 4 }}>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Menu</InputLabel>
            <Select
              value={menuId}
              onChange={(e) => setMenuId(e.target.value)}
              label="Menu"
            >
              {renderMenuOptions(menuItems)}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              type="number"
              label="Thứ tự"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              margin="normal"
              sx={{ width: 120 }}
            />
            <FormControl margin="normal" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                label="Trạng thái"
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Thumbnail Image Upload */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ảnh thumbnail:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                textAlign: 'center',
                position: 'relative',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'grey.100'
                }
              }}
            >
              {imageUploading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    Đang tải ảnh...
                  </Typography>
                </Box>
              ) : thumbnailFile ? (
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: 8
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveThumbnail}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : uploadedImageUrl ? (
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <img
                    src={uploadedImageUrl}
                    alt="Current thumbnail"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: 8
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveThumbnail}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' }
                    }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="thumbnail-upload"
                    type="file"
                    onChange={handleThumbnailChange}
                  />
                  <label htmlFor="thumbnail-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        textTransform: 'none',
                        px: 3,
                        py: 1.5
                      }}
                    >
                      Tải ảnh thumbnail
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    (PNG, JPG, JPEG, WEBP - Tối đa 5MB)
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Nội dung:
            </Typography>
            <Editor
              key={article?.id || 'new-article'}
              apiKey="z7rs4ijsr5qcpob6tbzosk50cpg1otyearqb6i08r0c4s7og"
              initialValue={content || ''}
              onInit={(_evt: any, editor: any) => {
                editorRef.current = editor;
                // Set content when editor initializes
                if (content) {
                  editor.setContent(content);
                }
              }}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code | removeformat | help',
                skin: 'oxide',
                content_css: 'default',
                promotion: false,
                referrer_policy: 'no-referrer',
                images_upload_handler: async (blobInfo: any) => {
                  try {
                    const file = new File([blobInfo.blob()], blobInfo.filename(), {
                      type: blobInfo.blob().type
                    });
                    const url = await handleImageUpload(file);
                    return url;
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    throw new Error('Không thể tải ảnh lên');
                  }
                }
              }}
              value={content}
              onEditorChange={setContent}
            />
            {uploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Đang tải ảnh...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
    </BaseDialog>
  );
};

export default ArticleForm;

