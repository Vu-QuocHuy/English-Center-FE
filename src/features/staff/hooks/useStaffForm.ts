import { useState, useCallback } from 'react';
import { createStaffAPI, updateStaffAPI, type CreateStaffData, type UpdateStaffData } from '@features/staff';
import { Staff } from '@shared/types';
import { validateStaff, type StaffFormData as StaffValidationData, type StaffValidationErrors } from '../validations';

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
  formErrors: StaffValidationErrors;
  loading: boolean;
  error: string;
  setFormData: (data?: Staff) => void;
  resetForm: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (changedFields?: Partial<StaffFormData> | null, onSuccess?: () => void) => Promise<{ success: boolean; message?: string }>;
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

  const [formErrors, setFormErrors] = useState<StaffValidationErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name as keyof StaffValidationErrors]) {
      setFormErrors((prev) => {
        const newErrors: StaffValidationErrors = { ...prev };
        delete newErrors[name as keyof StaffValidationErrors];
        return newErrors;
      });
    }
  }, [formErrors]);

  const setFormData = useCallback((data?: Staff): void => {
    if (data) {
      // Format dayOfBirth from Date to YYYY-MM-DD (for input type="date")
      const formatDate = (dateString: string | Date): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
    changedFields?: Partial<StaffFormData> | null,
    onSuccess?: () => void
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError('');
    setFormErrors({});

    try {
      // Validate form using validation function
      const validationData: StaffValidationData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        dayOfBirth: form.dayOfBirth,
        address: form.address,
        gender: form.gender,
        password: form.password,
        roleId: form.roleId
      };

      const errors = validateStaff(validationData, !!form.id);

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoading(false);
        return { success: false, message: 'Vui lòng kiểm tra lại thông tin' };
      }

      // Convert dayOfBirth from YYYY-MM-DD (input type="date") to MM/DD/YYYY for backend
      const convertToBackendFormat = (dateStr: string): string => {
        if (!dateStr) return '';
        // Parse YYYY-MM-DD format and convert to MM/DD/YYYY
        const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = dateStr.match(dateRegex);
        if (match) {
          const [, year, month, day] = match;
          // Convert YYYY-MM-DD to MM/DD/YYYY
          return `${month}/${day}/${year}`;
        }
        return dateStr;
      };

      if (form.id) {
        // Update existing staff - only send changed fields
        const updateData: UpdateStaffData = {} as UpdateStaffData;

        if (changedFields) {
          if (changedFields.name !== undefined) updateData.name = changedFields.name;
          if (changedFields.email !== undefined) updateData.email = changedFields.email;
          if (changedFields.phone !== undefined) updateData.phone = changedFields.phone;
          if (changedFields.address !== undefined) updateData.address = changedFields.address;
          if (changedFields.gender !== undefined) updateData.gender = changedFields.gender as 'male' | 'female';
          if (changedFields.dayOfBirth !== undefined) {
            updateData.dayOfBirth = convertToBackendFormat(changedFields.dayOfBirth);
          }
          if (changedFields.roleId !== undefined) {
            updateData.roleId = changedFields.roleId;
          }
        }

        await updateStaffAPI(form.id, updateData);
      } else {
        // Create new staff - password is required (already validated above)
        const staffData: CreateStaffData = {
          name: form.name,
          email: form.email,
          password: form.password || '',
          gender: form.gender,
          dayOfBirth: convertToBackendFormat(form.dayOfBirth),
          address: form.address,
          phone: form.phone,
        };

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
