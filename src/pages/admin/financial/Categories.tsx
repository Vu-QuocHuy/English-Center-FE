import React from 'react';
import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Tooltip, Grid, MenuItem } from '@mui/material';
import { BaseDialog, ConfirmDialog } from '@shared/components';
import { getAllTransactionCategoriesAPI, createTransactionCategoryAPI, getTransactionCategoryByIdAPI, updateTransactionCategoryAPI, deleteTransactionCategoryAPI } from '@shared/services';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const Categories: React.FC = () => {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [openCategoryDialog, setOpenCategoryDialog] = React.useState<boolean>(false);
  const [categoryForm, setCategoryForm] = React.useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [openEditCategoryDialog, setOpenEditCategoryDialog] = React.useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<any | null>(null);
  const [editCategoryForm, setEditCategoryForm] = React.useState<{ type: 'revenue' | 'expense'; name: string }>({ type: 'expense', name: '' });
  const [editCategoryLoading, setEditCategoryLoading] = React.useState<boolean>(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] = React.useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<any | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = React.useState<boolean>(false);
  const [categoryLoading, setCategoryLoading] = React.useState<boolean>(false);

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await getAllTransactionCategoriesAPI({ page: 1, limit: 1000 });
      let data: any[] = [];
      if ((res as any)?.data?.data && Array.isArray((res as any).data.data)) data = (res as any).data.data;
      else if ((res as any)?.data && Array.isArray((res as any).data)) data = (res as any).data;
      else if ((res as any)?.data?.data?.result && Array.isArray((res as any).data.data.result)) data = (res as any).data.data.result;
      else if ((res as any)?.data?.result && Array.isArray((res as any).data.result)) data = (res as any).data.result;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreateCategory = async () => {
    if (!categories || categories.length === 0) {
      await fetchCategories();
    }
    setOpenCategoryDialog(true);
  };
  const handleChangeCategoryField = (key: 'type' | 'name', value: string) => setCategoryForm(prev => ({ ...prev, [key]: value }));
  const handleCloseCategoryDialog = () => setOpenCategoryDialog(false);
  const handleSubmitCategory = async () => {
    if (!categoryForm.name || !categoryForm.type) return;
    setCategoryLoading(true);
    try {
      await createTransactionCategoryAPI({ type: categoryForm.type, name: categoryForm.name });
      setOpenCategoryDialog(false);
      setCategoryForm({ type: 'expense', name: '' });
      await fetchCategories();
    } finally {
      setCategoryLoading(false);
    }
  };
  const handleCloseDeleteCategoryDialog = () => { setOpenDeleteCategoryDialog(false); setCategoryToDelete(null); };
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteCategoryLoading(true);
    try {
      await deleteTransactionCategoryAPI(categoryToDelete.id);
      setOpenDeleteCategoryDialog(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const handleAskDeleteCategory = (id: number | string, name: string) => {
    setCategoryToDelete({ id, name });
    setOpenDeleteCategoryDialog(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateCategory}
        >
          Thêm danh mục
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tên danh mục</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(categories) && categories.length > 0 ? categories.map((category, idx) => (
              <TableRow key={category.id} hover>
                <TableCell><Typography variant="body2">{idx + 1}</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={500}>{category.name}</Typography></TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: category.type === 'revenue' ? '#2e7d32' : '#c62828',
                      border: `1px solid ${category.type === 'revenue' ? '#2e7d32' : '#c62828'}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {category.type === 'revenue' ? 'Thu' : 'Chi'}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" sx={{ color: 'primary.main' }} onClick={async () => {
                        setCategoryToEdit(category);
                        try {
                          const res = await getTransactionCategoryByIdAPI(String(category.id));
                          const data = (res as any)?.data?.data || (res as any)?.data || {};
                          setEditCategoryForm({ type: data.type || category.type, name: data.name || category.name });
                        } catch (_) {
                          setEditCategoryForm({ type: category.type, name: category.name });
                        }
                        setOpenEditCategoryDialog(true);
                      }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleAskDeleteCategory(category.id, category.name)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">Chưa có danh mục nào</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog tạo danh mục */}
      <BaseDialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        title="Thêm danh mục"
        subtitle="Nhập thông tin danh mục thu/chi"
        maxWidth="sm"
        fullWidth
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleCloseCategoryDialog} variant="outlined">
              Hủy
            </Button>
            <Button
              onClick={handleSubmitCategory}
              variant="contained"
              disabled={categoryLoading}
            >
              {categoryLoading ? 'Đang xử lý...' : 'Lưu'}
            </Button>
          </Box>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Loại" value={categoryForm.type} onChange={(e) => handleChangeCategoryField('type', e.target.value)} required>
              <MenuItem value="revenue">Thu</MenuItem>
              <MenuItem value="expense">Chi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Tên danh mục" fullWidth value={categoryForm.name} onChange={(e) => handleChangeCategoryField('name', e.target.value)} required />
          </Grid>
        </Grid>
      </BaseDialog>

      {/* Dialog chỉnh sửa danh mục */}
      <BaseDialog
        open={openEditCategoryDialog}
        onClose={() => setOpenEditCategoryDialog(false)}
        title="Chỉnh sửa danh mục"
        subtitle="Cập nhật thông tin danh mục"
        maxWidth="sm"
        fullWidth
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => setOpenEditCategoryDialog(false)} variant="outlined">
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!categoryToEdit) return;
                setEditCategoryLoading(true);
                try {
                  await updateTransactionCategoryAPI(String(categoryToEdit.id), { type: editCategoryForm.type, name: editCategoryForm.name });
                  setOpenEditCategoryDialog(false);
                  setCategoryToEdit(null);
                  await fetchCategories();
                } finally {
                  setEditCategoryLoading(false);
                }
              }}
              variant="contained"
              disabled={editCategoryLoading}
            >
              {editCategoryLoading ? 'Đang xử lý...' : 'Cập nhật'}
            </Button>
          </Box>
        }
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Loại" value={editCategoryForm.type} onChange={(e) => setEditCategoryForm(prev => ({ ...prev, type: e.target.value as 'revenue' | 'expense' }))} required>
              <MenuItem value="revenue">Thu</MenuItem>
              <MenuItem value="expense">Chi</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Tên danh mục" fullWidth value={editCategoryForm.name} onChange={(e) => setEditCategoryForm(prev => ({ ...prev, name: e.target.value }))} required />
          </Grid>
        </Grid>
      </BaseDialog>

      {/* Dialog xác nhận xóa danh mục */}
      <ConfirmDialog
        open={openDeleteCategoryDialog}
        onClose={handleCloseDeleteCategoryDialog}
        onConfirm={handleConfirmDeleteCategory}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete?.name || ''}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmColor="error"
        loading={deleteCategoryLoading}
      />
    </>
  );
};

export default Categories;

