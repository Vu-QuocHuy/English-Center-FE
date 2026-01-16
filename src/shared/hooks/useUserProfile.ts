import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '@shared/services';
import { updateStudentAPI } from '@features/students';
import { updateParentAPI } from '@features/parents';
import { validateUserUpdate } from '@shared/validations/common';

export interface UserUpdateData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  dayOfBirth: string;
}

export interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  dayOfBirth?: string;
}

export interface UseUserProfileReturn {
  user: ReturnType<typeof useAuth>['user'];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  loading: boolean;
  error: string;
  success: string;
  changePasswordOpen: boolean;
  setChangePasswordOpen: (open: boolean) => void;
  formData: UserUpdateData;
  errors: UserUpdateErrors;
  handleInputChange: (field: keyof UserUpdateData, value: string) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

export interface UseUserProfileOptions {
  role?: 'admin' | 'student' | 'parent' | 'staff';
}

// Convert date to YYYY-MM-DD format for date input
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

// Get dayOfBirth from user.dayOfBirth or user.student?.dayOfBirth or user.parent?.dayOfBirth
const getDayOfBirth = (user: ReturnType<typeof useAuth>['user']): string => {
  if (!user) return '';
  return user.dayOfBirth || (user as any).student?.dayOfBirth || (user as any).parent?.dayOfBirth || '';
};

export const useUserProfile = (options?: UseUserProfileOptions): UseUserProfileReturn => {
  const { user, updateUser } = useAuth();
  const role = options?.role || (user?.role as 'admin' | 'student' | 'parent' | 'staff' | undefined);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [formData, setFormData] = useState<UserUpdateData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    dayOfBirth: user?.dayOfBirth ? formatDateForInput(user.dayOfBirth) : '',
  });

  const [errors, setErrors] = useState<UserUpdateErrors>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || '',
        dayOfBirth: getDayOfBirth(user) ? formatDateForInput(getDayOfBirth(user)) : '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const validationErrors = validateUserUpdate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      let response: any;

      // Use specific API based on role
      if (role === 'student') {
        // Get student ID from user object
        const studentId = (user as any).student?.id || user.id;
        
        // Convert date format: YYYY-MM-DD to MM/DD/YYYY for student API
        const dayOfBirth = formData.dayOfBirth
          ? (formData.dayOfBirth.includes('-')
              ? formData.dayOfBirth.split('-').reverse().join('/')
              : formData.dayOfBirth)
          : undefined;

        const updatePayload: any = {};
        if (formData.name) updatePayload.name = formData.name;
        if (formData.email) updatePayload.email = formData.email;
        if (formData.phone) updatePayload.phone = formData.phone;
        if (formData.address) updatePayload.address = formData.address;
        if (dayOfBirth) updatePayload.dayOfBirth = dayOfBirth;
        if (formData.gender) updatePayload.gender = formData.gender;

        response = await updateStudentAPI(studentId, updatePayload);
      } else if (role === 'parent') {
        // Get parent ID from user object
        const parentId = (user as any).parent?.id || user.id;
        
        // Convert date format: YYYY-MM-DD to YYYY-MM-DD (keep same format for parent API)
        const toAPIDateFormat = (dob: string): string => {
          if (!dob) return '';
          if (dob.includes('-')) {
            const [year, month, day] = dob.split('-');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          const [day, month, year] = dob.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        };

        const updatePayload: any = {};
        if (formData.name) updatePayload.name = formData.name;
        if (formData.email) updatePayload.email = formData.email;
        if (formData.phone) updatePayload.phone = formData.phone;
        if (formData.address) updatePayload.address = formData.address;
        if (formData.dayOfBirth) updatePayload.dayOfBirth = toAPIDateFormat(formData.dayOfBirth);
        if (formData.gender) updatePayload.gender = formData.gender;

        response = await updateParentAPI(parentId, updatePayload);
      } else {
        // For admin/staff, use updateUserAPI
        response = await updateUserAPI(user.id, formData);
      }

      if (response?.data || response) {
        updateUser({
          ...user,
          ...formData,
          gender: formData.gender as 'male' | 'female' | undefined,
        });

        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        setError('Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      address: user?.address || '',
      dayOfBirth: getDayOfBirth(user) ? formatDateForInput(getDayOfBirth(user)) : '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return {
    user,
    isEditing,
    setIsEditing,
    loading,
    error,
    success,
    changePasswordOpen,
    setChangePasswordOpen,
    formData,
    errors,
    handleInputChange,
    handleSave,
    handleCancel,
  };
};