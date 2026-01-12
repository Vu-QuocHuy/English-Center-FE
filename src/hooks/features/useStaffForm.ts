import { useState, useCallback } from 'react';
import { createStaffAPI, updateStaffAPI, CreateStaffData, UpdateStaffData } from '../../services/users';
import { Staff } from '../../types';

interface StaffFormData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  gender: 'male' | 'female';
  dayOfBirth: string;
  address: string;
  phone: string;
  roleId?: string;
}

interface UseStaffFormReturn {
  form: StaffFormData;
  formErrors: Record<string, string>;
  loading: boolean;
  error: string;
  setFormData: (data?: Staff) => void;
  resetForm: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (onSuccess?: () => void) => Promise<{ success: boolean; message?: string }>;
}

export const useStaffForm = (): UseStaffFormReturn => {
  const [form, setForm] = useState<StaffFormData>({
    name: '',
    email: '',
    password: '',
    gender: 'male',
    dayOfBirth: '',
    address: '',
    phone: '',
    roleId: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [formErrors]);

  const setFormData = useCallback((data?: Staff): void => {
    if (data) {
      // Format dayOfBirth from Date to MM/DD/YYYY
      const formatDate = (dateString: string | Date): string => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      setForm({
        id: data.id,
        name: data.name,
        email: data.email,
        password: '', // Don't set password when editing
        gender: data.gender,
        dayOfBirth: formatDate(data.dayOfBirth),
        address: data.address,
        phone: data.phone,
        roleId: data.role?.id?.toString() || '',
      });
    } else {
      resetForm();
    }
    setFormErrors({});
    setError('');
  }, []);

  const resetForm = useCallback((): void => {
    setForm({
      name: '',
      email: '',
      password: '',
      gender: 'male',
      dayOfBirth: '',
      address: '',
      phone: '',
      roleId: '',
    });
    setFormErrors({});
    setError('');
  }, []);

  const handleSubmit = useCallback(async (
    onSuccess?: () => void
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError('');
    setFormErrors({});

    try {
      // Basic validation
      const errors: Record<string, string> = {};
      if (!form.name.trim()) errors.name = 'Tên không được để trống';
      if (!form.email.trim()) errors.email = 'Email không được để trống';
      if (!form.id && !form.password) errors.password = 'Mật khẩu không được để trống';
      if (!form.dayOfBirth) errors.dayOfBirth = 'Ngày sinh không được để trống';
      if (!form.address.trim()) errors.address = 'Địa chỉ không được để trống';
      if (!form.phone.trim()) errors.phone = 'Số điện thoại không được để trống';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoading(false);
        return { success: false, message: 'Vui lòng điền đầy đủ thông tin' };
      }

      // Convert dayOfBirth from DD/MM/YYYY to MM/DD/YYYY for backend
      const convertToBackendFormat = (dateStr: string): string => {
        if (!dateStr) return '';
        // Parse DD/MM/YYYY format and convert to MM/DD/YYYY
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = dateStr.match(dateRegex);
        if (match) {
          const [, day, month, year] = match;
          // Convert DD/MM/YYYY to MM/DD/YYYY
          return `${month}/${day}/${year}`;
        }
        return dateStr;
      };

      if (form.id) {
        // Update existing staff - do not include password
        const staffData: UpdateStaffData = {
          name: form.name,
          email: form.email,
          gender: form.gender,
          dayOfBirth: convertToBackendFormat(form.dayOfBirth),
          address: form.address,
          phone: form.phone,
        };

        if (form.roleId) {
          staffData.roleId = form.roleId;
        }

        await updateStaffAPI(form.id, staffData);
      } else {
        // Create new staff - password is required
        const staffData: CreateStaffData = {
          name: form.name,
          email: form.email,
          password: form.password || '',
          gender: form.gender,
          dayOfBirth: convertToBackendFormat(form.dayOfBirth),
          address: form.address,
          phone: form.phone,
        };

        if (!staffData.password) {
          setFormErrors({ password: 'Mật khẩu không được để trống' });
          setLoading(false);
          return { success: false, message: 'Mật khẩu không được để trống' };
        }

        if (form.roleId) {
          staffData.roleId = form.roleId;
        }

        await createStaffAPI(staffData);
      }

      if (onSuccess) onSuccess();
      return { success: true, message: form.id ? 'Cập nhật nhân viên thành công!' : 'Tạo nhân viên thành công!' };
    } catch (error: any) {
      console.error('Error submitting staff form:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin nhân viên';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [form]);

  return {
    form,
    formErrors,
    loading,
    error,
    setFormData,
    resetForm,
    handleChange,
    handleSubmit,
  };
};
