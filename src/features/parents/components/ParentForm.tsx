import React, { useEffect, useMemo, useState } from 'react';
import { useLazySearch } from '@shared/hooks';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Grid,
  Checkbox,
  Tabs,
  Tab,
  Paper,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import type { Parent, Student } from '@shared/types';
import { useParentForm } from '@features/parents';
import { getParentByIdAPI, getParentChildrenAPI, createParentAPI, updateParentAPI } from '../services/parents.api';
import { getAllStudentsAPI } from '@features/students';
import { BaseDialog } from '@shared/components';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateGender,
  validatePassword
} from '@shared/validations/common';

interface ParentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (result: { success: boolean; message?: string }) => void;
  parent?: Parent | null;
  loading?: boolean;
  onMessage?: (message: string, type: 'success' | 'error') => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  dayOfBirth?: string;
  gender?: string;
}
const ParentForm: React.FC<ParentFormProps> = ({ open, onClose, onSubmit, parent, loading: externalLoading = false, onMessage }) => {
  const {
    form,
    handleChange,
    setFormData,
    resetForm,
    handleAddChild,
    handleRemoveChild,
  } = useParentForm();

  const [tab, setTab] = useState<number>(0);
  const [childrenList, setChildrenList] = useState<Student[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const busy = loading || externalLoading;

  // Lazy search hook for student search
  const {
    searchQuery: studentQuery,
    setSearchQuery: setStudentQuery,
    items: studentOptions,
    loading: studentSearchLoading,
    hasMore: hasMoreStudents,
    loadMore: loadMoreStudents,
    reset: resetStudentSearch
  } = useLazySearch<Student>({
    fetchFn: async (params) => {
      const res = await getAllStudentsAPI(params);
      return res.data;
    },
    enabled: open && tab === 1, // Only search when dialog is open and on children tab
    loadOnMount: true, // Load initial suggestions when opening children tab
    pageSize: 10,
    debounceDelay: 500
  });

  // Reset search when switching tabs
  useEffect(() => {
    if (tab !== 1) {
      resetStudentSearch();
    }
  }, [tab, resetStudentSearch]);

  useEffect(() => {
    if (parent && open) {
      setFormData(parent as any);
      // Không reset tab khi đã mở dialog
    } else if (!open) {
      // Chỉ reset tab, không reset form/children ở đây để tránh conflict với handleClose
      setTab(0); // Reset về tab đầu tiên khi đóng dialog
    } else if (!parent && open) {
      // Khi mở dialog thêm mới
      setTab(0); // Chỉ hiển thị tab thông tin cơ bản
    }
  }, [parent, open, setFormData]);

  // Helper: refresh children list from API
  const refreshChildrenList = React.useCallback(async () => {
    if (!parent?.id) return;
    try {
      const res = await getParentChildrenAPI(parent.id);
      const payload = (res as any)?.data?.data ?? (res as any)?.data ?? res;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any)?.students)
          ? (payload as any).students
          : [];
      setChildrenList(list);
      setRefreshKey(prev => prev + 1);
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('getParentChildrenAPI failed, fallback to getParentByIdAPI', e);
    }
    try {
      const response = await getParentByIdAPI(parent.id);
      const payload = (response as any)?.data?.data ?? (response as any)?.data ?? response;
      const list = Array.isArray((payload as any)?.students) ? (payload as any).students : [];
      setChildrenList(list);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error refreshing children list (fallback):', error);
    }
  }, [parent?.id]);

  // Refresh when entering Manage Children tab
  useEffect(() => {
    if (open && parent?.id && tab === 1) {
      refreshChildrenList();
    }
  }, [open, parent?.id, tab, refreshChildrenList]);

  // Student search is now handled by useLazySearch hook

  const toDisplayDate = useMemo(() => (val?: string) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return val;
    }
  }, []);

  // Helper function to validate date format (yyyy-mm-dd from input type="date")
  const validateDateOfBirth = (dateStr: string): string => {
    if (!dateStr) return 'Ngày sinh không được để trống';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Ngày sinh không hợp lệ';

    const today = new Date();
    if (date >= today) return 'Ngày sinh phải nhỏ hơn ngày hiện tại';

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    const nameError = validateName(form.name);
    if (nameError) newErrors.name = nameError;

    // Validate email
    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;

    // Validate password (only for new parent)
    if (!parent) {
      const passwordError = validatePassword(form.password || '');
      if (passwordError) newErrors.password = passwordError;
    }

    // Validate phone
    const phoneError = validatePhone(form.phone);
    if (phoneError) newErrors.phone = phoneError;

    // Validate address
    const addressError = validateAddress(form.address);
    if (addressError) newErrors.address = addressError;

    // Validate date of birth
    const dobError = validateDateOfBirth(form.dayOfBirth);
    if (dobError) newErrors.dayOfBirth = dobError;

    // Validate gender
    const genderError = validateGender(form.gender);
    if (genderError) newErrors.gender = genderError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const toAPIDateFormat = (dob: string): string => {
        if (!dob) return '';
        // Support both dd/mm/yyyy and yyyy-mm-dd
        if (dob.includes('-')) {
          const [year, month, day] = dob.split('-');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        const [day, month, year] = dob.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      let body: any;
      if (parent) {
        // Update existing parent
        body = {
          userData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            dayOfBirth: toAPIDateFormat(form.dayOfBirth),
            gender: form.gender,
            address: form.address,
          },
          parentData: {
            canSeeTeacherInfo: form.canSeeTeacherInfo,
          }
        };

        await updateParentAPI(parent.id, body);
      } else {
        // Create new parent
        body = {
          email: form.email,
          password: form.password,
          name: form.name,
          dayOfBirth: toAPIDateFormat(form.dayOfBirth),
          phone: form.phone,
          address: form.address,
          gender: form.gender,
          canSeeTeacherInfo: form.canSeeTeacherInfo,
        };

        await createParentAPI(body);
      }

      // Notify parent component
      if (onSubmit) {
        onSubmit({ success: true, message: parent ? 'Cập nhật phụ huynh thành công!' : 'Thêm phụ huynh thành công!' });
      }

      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu phụ huynh';

      // Notify parent component
      if (onSubmit) {
        onSubmit({ success: false, message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const addChildFromSearch = async (student: any) => {
    if (!parent?.id || !student?.id) return;
    const result = await handleAddChild(String(student.id), String(parent.id));
    if (result.success) {
      // Cập nhật danh sách con ngay lập tức
      setChildrenList(prev => {
        const exists = prev.some((s: any) => String(s.id) === String(student.id));
        return exists ? prev : [...prev, student as any];
      });

      // Hiển thị thông báo thành công
      if (onMessage) {
        onMessage(result.message, 'success');
      }

      // Refresh lại danh sách con từ API để đảm bảo đồng bộ
      await refreshChildrenList();
    } else {
      // Hiển thị thông báo lỗi
      if (onMessage) {
        onMessage(result.message, 'error');
      }
    }
  };

  const removeChild = async (studentId: string) => {
    if (!parent?.id) return;

    const result = await handleRemoveChild(String(studentId), String(parent.id));

    if (result.success) {
      // Cập nhật danh sách con ngay lập tức
      const updatedList = childrenList.filter((s: any) => String(s.id) !== String(studentId));
      setChildrenList(updatedList);

      // Hiển thị thông báo thành công
      if (onMessage) {
        onMessage(result.message, 'success');
      }

      // Refresh lại danh sách con từ API để đảm bảo đồng bộ
      await refreshChildrenList();
    } else {
      // Hiển thị thông báo lỗi
      if (onMessage) {
        onMessage(result.message, 'error');
      }
    }
  };

  const handleClose = () => {
    resetForm();
    setChildrenList([]);
    resetStudentSearch();
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      title={parent ? 'Chỉnh sửa thông tin phụ huynh' : 'Thêm phụ huynh mới'}
      subtitle={parent ? 'Cập nhật thông tin phụ huynh và quản lý con cái' : 'Nhập thông tin cơ bản của phụ huynh mới'}
      icon={parent ? <EditIcon sx={{ fontSize: 28, color: 'white' }} /> : <AddIcon sx={{ fontSize: 28, color: 'white' }} />}
      maxWidth="md"
      contentPadding={0}
      hideDefaultAction={true}
      actions={
        <>
          <Button
            onClick={handleClose}
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
            disabled={busy}
          >
            Hủy
          </Button>
          <Button
            onClick={parent && tab === 1 ? handleClose : submit}
            variant="contained"
            startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={busy}
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
            {parent && tab === 1 ? 'Đóng' : (busy ? 'Đang lưu...' : (parent ? 'Cập nhật' : 'Thêm mới'))}
          </Button>
        </>
      }
    >
        {parent && (
          <Box sx={{ px: 4, pt: 2 }}>
            <Tabs value={tab} onChange={(_e, v) => {
              setTab(v);
            }} sx={{ mb: 2 }}>
              <Tab label="Thông tin cơ bản" />
              <Tab label="Quản lý con cái" />
            </Tabs>
          </Box>
        )}

        {/* Tab thông tin cơ bản - hiển thị cho cả thêm mới và chỉnh sửa */}
        {tab === 0 && (
          <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                Thông tin cơ bản
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />
            </Grid>
            <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />
            </Grid>

            {!parent && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={form.password || ''}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password || 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số'}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      name="dayOfBirth"
                      type="date"
                      value={toDisplayDate(form.dayOfBirth)}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dayOfBirth}
                      helperText={errors.dayOfBirth}
                      required
                    />
            </Grid>
            <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      required
                    />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.gender} required>
                      <InputLabel>Giới tính</InputLabel>
                      <Select name="gender" label="Giới tính" value={form.gender} onChange={(e: any) => handleChange(e as any)}>
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      required
                    />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox checked={!!form.canSeeTeacherInfo} onChange={(e) => handleChange({ target: { name: 'canSeeTeacherInfo', value: e.target.checked, type: 'checkbox', checked: e.target.checked } } as any)} />
                      <Typography>Quyền xem thông tin giáo viên</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
            </Paper>
          </Box>
        )}

        {/* Tab quản lý con cái - chỉ hiển thị khi chỉnh sửa */}
        {tab === 1 && parent && (
          <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #e0e6ed' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: '#667eea', borderRadius: 2 }} />
                Quản lý con cái
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

                {/* Danh sách con hiện tại */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Danh sách con hiện tại ({childrenList.length} con)
                  </Typography>
                  {(() => { return null; })()}
                  {childrenList.length > 0 ? (
                    <Box key={refreshKey} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {childrenList.map((child: any) => (
                        <Box
                          key={child.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #e0e6ed',
                            bgcolor: '#f8f9fa',
                            '&:hover': {
                              bgcolor: '#f1f3f4'
                            }
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {child.name}
                          </Typography>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => removeChild(String(child.id))}
                            sx={{
                              borderRadius: 2,
                              px: 2,
                              py: 0.5,
                              borderColor: '#dc3545',
                              color: '#dc3545',
                              '&:hover': {
                                bgcolor: '#dc3545',
                                color: 'white'
                              }
                            }}
                          >
                            Xóa
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: '1px dashed #e0e6ed',
                        bgcolor: '#f8f9fa',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Chưa có con nào được thêm
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Thêm con mới */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Thêm con mới
                  </Typography>

                  {/* Autocomplete với lazy loading */}
                  <Autocomplete
                    loading={studentSearchLoading}
                    options={studentOptions}
                    getOptionLabel={(option) => option?.name || ''}
                    inputValue={studentQuery}
                    onInputChange={(_, val) => setStudentQuery(val)}
                    ListboxProps={{
                      onScroll: (event: React.SyntheticEvent) => {
                        const listboxNode = event.currentTarget;
                        if (
                          listboxNode.scrollTop + listboxNode.clientHeight >=
                          listboxNode.scrollHeight - 5 &&
                          hasMoreStudents &&
                          !studentSearchLoading
                        ) {
                          loadMoreStudents();
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Tìm kiếm học sinh để thêm"
                        sx={{
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#667eea'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#667eea'
                            }
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {studentSearchLoading ? <CircularProgress color="inherit" size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const isAlreadyAdded = childrenList.some((child: any) => child.id === option.id);
                      return (
                        <Box component="li" {...props} key={option.id}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              {option.name}
                            </Typography>
                            {option.email && (
                              <Typography variant="caption" color="text.secondary">
                                {option.email}
                              </Typography>
                            )}
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={isAlreadyAdded}
                            onClick={(e) => {
                              e.stopPropagation();
                              addChildFromSearch(option);
                              setStudentQuery(''); // Clear search after adding
                            }}
                            sx={{
                              ml: 2,
                              borderRadius: 2,
                              px: 2,
                              py: 0.5,
                              bgcolor: isAlreadyAdded ? '#6c757d' : '#007bff',
                              color: 'white',
                              '&:hover': {
                                bgcolor: isAlreadyAdded ? '#6c757d' : '#0056b3'
                              }
                            }}
                          >
                            {isAlreadyAdded ? 'Đã thêm' : 'Thêm'}
                          </Button>
                        </Box>
                      );
                    }}
                    noOptionsText={
                      studentSearchLoading ? 'Đang tải...' : 
                      studentQuery ? 'Không tìm thấy học sinh' : 
                      'Nhập tên học sinh để tìm kiếm'
                    }
                    onChange={(_, value) => {
                      // Clear selection after choosing (we handle adding in renderOption)
                      if (value) {
                        addChildFromSearch(value);
                        setStudentQuery('');
                      }
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
    </BaseDialog>
  );
};

export default ParentForm;
