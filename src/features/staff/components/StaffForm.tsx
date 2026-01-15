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
import { Save as SaveIcon, Cancel as CancelIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
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
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await getAllRolesAPI();
        const rolesData = response.data?.data?.result || response.data?.data || [];
        setRoles(rolesData);
      } catch (error) {
        // Error handled silently
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
        // Store original data for comparison
        const initialData = {
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          address: staff.address,
          gender: staff.gender,
          dayOfBirth: staff.dayOfBirth ? new Date(staff.dayOfBirth).toISOString().split('T')[0] : '',
          roleId: staff.role?.id?.toString() || ''
        };
        setOriginalData(initialData);
      } else {
        resetForm();
        setOriginalData(null);
      }
    } else {
      // Reset form when dialog closes
      resetForm();
      setOriginalData(null);
    }
  }, [open, staff, setFormData, resetForm]);

  // Helper function to get only changed fields
  const getChangedFields = (newData: any, original: any | null): Partial<any> => {
    if (!original) {
      // If no original data, return all data (for create)
      return newData;
    }

    const changedFields: Partial<any> = {};

    // Check all fields
    if (newData.name !== original.name) changedFields.name = newData.name;
    if (newData.email !== original.email) changedFields.email = newData.email;
    if (newData.phone !== original.phone) changedFields.phone = newData.phone;
    if (newData.address !== original.address) changedFields.address = newData.address;
    if (newData.gender !== original.gender) changedFields.gender = newData.gender;
    if (newData.dayOfBirth !== original.dayOfBirth) changedFields.dayOfBirth = newData.dayOfBirth;
    if (newData.roleId !== original.roleId) changedFields.roleId = newData.roleId;

    return changedFields;
  };

  const handleFormSubmit = async () => {
    // Get changed fields if editing
    const changedFields = staff && staff.id 
      ? getChangedFields(form, originalData)
      : null;

    const result = await handleSubmit(changedFields, () => {
      if (onSuccess) onSuccess();
      onClose();
    });
    
    if (!result.success && result.message) {
      // Error is already set in hook
    }
  };

  const handleClose = () => {
    resetForm();
    setOriginalData(null);
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={staff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
      subtitle="Cập nhật thông tin nhân viên"
      icon={staff ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={handleClose}
            variant="outlined"
            startIcon={<CancelIcon />}
            disabled={loading}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {loading ? 'Đang lưu...' : (staff ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </>
      }
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {error && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
                {error}
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>

              {!staff && (
                <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày sinh *"
                  name="dayOfBirth"
                  type="date"
                  value={form.dayOfBirth}
                  onChange={handleChange}
                  error={!!formErrors.dayOfBirth}
                  helperText={formErrors.dayOfBirth}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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
          </Box>
        </Paper>
      </Box>
    </BaseDialog>
  );
};

export default StaffForm;
