import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  SubdirectoryArrowRight as SubMenuIcon,
} from '@mui/icons-material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import {
  createMenuAPI,
  getAllMenusAPI,
  updateMenuAPI,
  deleteMenuAPI,
} from '@features/menus';
import type { MenuData } from '@features/menus';
import { MenuItem } from '@shared/types';
import { NotificationSnackbar, ConfirmDialog, BaseDialog } from '@shared/components';
import { commonStyles } from '@shared/utils';

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    parentId?: string;
    order?: string;
    isActive?: boolean;
  }>({
    title: '',
    slug: '',
    parentId: undefined,
    order: '',
    isActive: true,
  });
  const [orderError, setOrderError] = useState<string>('');
  const [selectedParentMenu, setSelectedParentMenu] = useState<MenuItem | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Generate slug from title
  const generateSlug = (title: string) => {
    const charMap: { [key: string]: string } = {
      á: 'a', à: 'a', ả: 'a', ã: 'a', ạ: 'a',
      ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
      â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
      đ: 'd',
      é: 'e', è: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
      ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
      í: 'i', ì: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
      ó: 'o', ò: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
      ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
      ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
      ú: 'u', ù: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
      ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
      ý: 'y', ỳ: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
    };

    return title
      .toLowerCase()
      .replace(/[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/g, (char) => charMap[char] || char)
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getAllMenusAPI();
      if (response.data?.data) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tải danh sách menu',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate order
  const validateOrder = (): boolean => {
    if (!formData.order || formData.order.trim() === '') {
      setOrderError('Thứ tự hiển thị là bắt buộc');
      return false;
    }
    const orderNum = Number(formData.order);
    if (isNaN(orderNum) || orderNum <= 0) {
      setOrderError('Thứ tự hiển thị phải là số lớn hơn 0');
      return false;
    }
    setOrderError('');
    return true;
  };

  // Create menu item
  const handleCreate = async () => {
    if (!validateOrder()) {
      return;
    }

    try {
      const payload = {
        ...formData,
        order: Number(formData.order),
      };
      await createMenuAPI(payload);
      setNotification({
        open: true,
        message: 'Tạo menu thành công',
        severity: 'success',
      });
      handleCloseDialog();
      fetchMenuItems();
    } catch (error) {
      console.error('Error creating menu item:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi tạo menu',
        severity: 'error',
      });
    }
  };

  // Update menu item
  const handleUpdate = async () => {
    if (!currentItem) return;

    if (!validateOrder()) {
      return;
    }

    try {
      const payload = {
        ...formData,
        order: Number(formData.order),
      };
      await updateMenuAPI(currentItem.id, payload);
      setNotification({
        open: true,
        message: 'Cập nhật menu thành công',
        severity: 'success',
      });
      handleCloseDialog();
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi cập nhật menu',
        severity: 'error',
      });
    }
  };

  // Delete menu item
  const handleDelete = (id: string) => {
    setMenuToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!menuToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteMenuAPI(menuToDelete);
      setNotification({
        open: true,
        message: 'Xóa menu thành công',
        severity: 'success',
      });
      fetchMenuItems();
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi xóa menu',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMenuToDelete(null);
  };

  // Open dialog for create/edit
  const handleOpenDialog = (item?: MenuItem, parentMenu?: MenuItem) => {
    if (item) {
      // Chỉnh sửa menu hiện tại
      setCurrentItem(item);
      setSelectedParentMenu(null);
      setFormData({
        title: item.title,
        slug: item.slug || '',
        parentId: undefined, // Menu chính không có parentId
        order: item.order ? String(item.order) : '',
        isActive: item.isActive,
      });
      setOrderError('');
    } else {
      // Tạo menu mới
      setCurrentItem(null);
      setSelectedParentMenu(parentMenu || null);
      setFormData({
        title: '',
        slug: '',
        parentId: parentMenu?.id || undefined, // Set parentId nếu có parentMenu
        order: '',
        isActive: true,
      });
      setOrderError('');
    }
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => {
      setCurrentItem(null);
      setSelectedParentMenu(null);
      setFormData({
        title: '',
        slug: '',
        parentId: undefined,
        order: '',
        isActive: true,
      });
      setOrderError('');
    }, 100);
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handle form input changes
  const handleInputChange = (field: keyof MenuData, value: any) => {
    // Xử lý order đặc biệt - giữ string
    if (field === 'order') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
      // Xóa lỗi khi user bắt đầu nhập lại
      if (orderError) {
        setOrderError('');
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when title changes
    if (field === 'title') {
      const generatedSlug = generateSlug(value);

      // Nếu đang tạo submenu, thêm slug của menu cha vào đầu
      const finalSlug = selectedParentMenu && selectedParentMenu.slug
        ? `${selectedParentMenu.slug}/${generatedSlug}`
        : generatedSlug;

      setFormData(prev => ({
        ...prev,
        title: value,
        slug: finalSlug,
      }));
    }
  };

  // Render menu items recursively
  const renderMenuItems = (items: MenuItem[], level: number = 0) => {
    return items.map((item) => (
      <Accordion key={item.id} sx={{ ml: level * 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {level > 0 && <SubMenuIcon color="action" />}
              <Typography variant="subtitle1">{item.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(undefined, item);
                }}
                title="Tạo submenu"
              >
                <AddIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDialog(item);
                }}
                title="Sửa menu"
              >
                <EditIcon />
              </IconButton>

              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                title="Xóa menu"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ pl: 2 }}>
            {item.childrenMenu && item.childrenMenu.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Submenu:
                </Typography>
                {renderMenuItems(item.childrenMenu, level + 1)}
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={commonStyles.pageHeader}>
                <Typography sx={commonStyles.pageTitle}>Quản lý Menu</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={commonStyles.primaryButton}
                >
                  Thêm Menu
                </Button>
              </Box>

              <Paper sx={{ p: 3, mb: 3 }}>
                {menuItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Chưa có menu nào. Hãy tạo menu đầu tiên!
                    </Typography>
                  </Box>
                ) : (
                  renderMenuItems(menuItems)
                )}
              </Paper>

              {/* Create/Edit Dialog */}
              <BaseDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                title={
                  currentItem
                    ? 'Sửa Menu'
                    : selectedParentMenu
                      ? `Thêm Submenu cho "${selectedParentMenu.title}"`
                      : 'Thêm Menu Mới'
                }
                subtitle={
                  currentItem
                    ? 'Cập nhật thông tin menu'
                    : selectedParentMenu
                      ? `Tạo submenu cho "${selectedParentMenu.title}"`
                      : 'Tạo menu chính mới'
                }
                icon={currentItem ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
                maxWidth="sm"
                fullWidth
                contentPadding={0}
                hideDefaultAction={true}
                actions={
                  <>
                    <Button
                      onClick={handleCloseDialog}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          bgcolor: '#667eea',
                          color: 'white'
                        }
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={currentItem ? handleUpdate : handleCreate}
                      variant="contained"
                      disabled={!formData.title}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        bgcolor: '#667eea',
                        '&:hover': {
                          bgcolor: '#5a6fd8'
                        }
                      }}
                    >
                      {currentItem ? 'Cập nhật' : 'Tạo'}
                    </Button>
                  </>
                }
              >
                <Box sx={{ p: 4 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tiêu đề"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        helperText={
                          selectedParentMenu
                            ? `Slug sẽ có dạng: ${selectedParentMenu.slug}/tên-submenu`
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Thứ tự hiển thị"
                        type="number"
                        value={formData.order}
                        onChange={(e) => handleInputChange('order', e.target.value)}
                        error={!!orderError}
                        helperText={orderError || 'Số nhỏ hơn sẽ hiển thị trước'}
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          />
                        }
                        label="Trạng thái hoạt động"
                      />
                    </Grid>
                    {selectedParentMenu && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Menu cha"
                          value={selectedParentMenu.title}
                          InputProps={{
                            readOnly: true,
                          }}
                          helperText="Menu cha (chỉ đọc)"
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedParentMenu
                          ? `Tạo submenu cho "${selectedParentMenu.title}". URL sẽ được tự động tạo từ tiêu đề.`
                          : ''}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </BaseDialog>

              <NotificationSnackbar
                open={notification.open}
                onClose={handleNotificationClose}
                message={notification.message}
                severity={notification.severity}
              />

              {/* Delete Confirmation Dialog */}
              <ConfirmDialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận xóa menu"
                message="Bạn có chắc chắn muốn xóa menu này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                confirmColor="error"
                loading={deleteLoading}
              />
            </>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MenuManagement;