import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import type { Staff, Role } from '@shared/types';
import { BaseDialog } from '@shared/components';
import { useStaffForm } from '@features/staff';
import { getAllRolesAPI } from '@features/roles';

interface StaffFormProps {
  open: boolean;
  onClose: () => void;
  staff?: Staff | null;
  onSuccess?: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({
  open,
  onClose,
  staff,
  onSuccess
}) => {
  const {
    form,
    formErrors,
    loading,
    error,
    setFormData,
    resetForm,
    handleChange,
    handleSubmit
  } = useStaffForm();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await getAllRolesAPI();
        const rolesData = response.data?.data?.result || response.data?.data || [];
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (open) {
      if (staff && staff.id) {
        setFormData(staff);
      } else {
        resetForm();
      }
    } else {
      // Reset form when dialog closes
      resetForm();
    }
  }, [open, staff, setFormData, resetForm]);

  const handleFormSubmit = async () => {
    const result = await handleSubmit(() => {
      if (onSuccess) onSuccess();
      onClose();
    });
    
    if (!result.success && result.message) {
      // Error is already set in hook
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={staff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
      maxWidth="md"
      fullWidth
    >
      <Paper sx={{ p: 3 }}>
        {error && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
            {error}
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Họ và tên *"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email *"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={!!staff} // Disable email when editing
            />
          </Grid>

          {!staff && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mật khẩu *"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Giới tính *</InputLabel>
              <Select
                name="gender"
                value={form.gender}
                onChange={(e) => handleChange({ target: { name: 'gender', value: e.target.value } } as any)}
                label="Giới tính *"
              >
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ngày sinh *"
              name="dayOfBirth"
              type="text"
              value={form.dayOfBirth}
              onChange={handleChange}
              placeholder="DD/MM/YYYY"
              error={!!formErrors.dayOfBirth}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Số điện thoại *"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                name="roleId"
                value={form.roleId}
                onChange={(e) => handleChange({ target: { name: 'roleId', value: e.target.value } } as any)}
                label="Vai trò"
                disabled={loadingRoles}
              >
                <MenuItem value="">Chưa gán vai trò</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ *"
              name="address"
              value={form.address}
              onChange={handleChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            startIcon={<CancelIcon />}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Box>
      </Paper>
    </BaseDialog>
  );
};

export default StaffForm;
