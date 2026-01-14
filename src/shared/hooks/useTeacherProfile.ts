import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserAPI } from '@shared/services';
import { updateTeacherAPI } from '@features/teachers';
import { validateUserUpdate } from '@shared/validations/common';
import { UserUpdateData, UserUpdateErrors } from './useUserProfile';

// Import helper functions from useUserProfile
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

const getDayOfBirth = (user: ReturnType<typeof useAuth>['user']): string => {
  if (!user) return '';
  return user.dayOfBirth || (user as any).student?.dayOfBirth || (user as any).parent?.dayOfBirth || '';
};

export interface TeacherUpdateData {
  description: string;
  qualifications: string[];
  specializations: string[];
  workExperience?: number | string;
}

export interface TeacherUpdateErrors {
  description?: string;
  qualifications?: string;
  specializations?: string;
  workExperience?: string;
}

export interface UseTeacherProfileReturn {
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
  teacherFormData: TeacherUpdateData;
  teacherErrors: TeacherUpdateErrors;
  handleInputChange: (field: keyof UserUpdateData, value: string) => void;
  handleTeacherInputChange: (field: keyof TeacherUpdateData, value: string | boolean | string[] | number | undefined | null) => void;
  handleArrayInputChange: (field: 'qualifications' | 'specializations', value: string) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

export const useTeacherProfile = (): UseTeacherProfileReturn => {
  const { user, updateUser } = useAuth();

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
    dayOfBirth: getDayOfBirth(user) ? formatDateForInput(getDayOfBirth(user)) : '',
  });

  const [teacherFormData, setTeacherFormData] = useState<TeacherUpdateData>({
    description: user?.teacher?.description || '',
    qualifications: user?.teacher?.qualifications || [],
    specializations: user?.teacher?.specializations || [],
    workExperience: user?.teacher?.workExperience || undefined,
  });

  const [errors, setErrors] = useState<UserUpdateErrors>({});
  const [teacherErrors, setTeacherErrors] = useState<TeacherUpdateErrors>({});

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

      setTeacherFormData({
        description: user.teacher?.description || '',
        qualifications: user.teacher?.qualifications || [],
        specializations: user.teacher?.specializations || [],
        workExperience: user.teacher?.workExperience || undefined,
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

  const handleTeacherInputChange = (field: keyof TeacherUpdateData, value: string | boolean | string[] | number | undefined | null) => {
    const normalizedValue = value === null ? undefined : value;
    setTeacherFormData(prev => ({
      ...prev,
      [field]: normalizedValue as any,
    }));

    if (teacherErrors[field as keyof TeacherUpdateErrors]) {
      setTeacherErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleArrayInputChange = (field: 'qualifications' | 'specializations', value: string) => {
    const items = value.split(/[,\n]/).map(item => item.trim()).filter(item => item.length > 0);
    handleTeacherInputChange(field, items);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate user data
      const userValidationErrors = validateUserUpdate(formData);
      if (Object.keys(userValidationErrors).length > 0) {
        setErrors(userValidationErrors);
        setLoading(false);
        return;
      }

      // Validate teacher data
      const teacherValidationErrors: TeacherUpdateErrors = {};
      if (!teacherFormData.description || teacherFormData.description.trim() === '') {
        teacherValidationErrors.description = 'Mô tả không được để trống';
      }
      if (Object.keys(teacherValidationErrors).length > 0) {
        setTeacherErrors(teacherValidationErrors);
        setLoading(false);
        return;
      }

      if (!user?.id) {
        setError('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }

      // Update user data
      const userResponse = await updateUserAPI(user.id, formData);

      // Update teacher data if user update is successful
      if (userResponse.data && user.teacher?.id) {
        await updateTeacherAPI(user.teacher.id, {
          description: teacherFormData.description,
          qualifications: teacherFormData.qualifications,
          specializations: teacherFormData.specializations,
          workExperience: teacherFormData.workExperience 
            ? (typeof teacherFormData.workExperience === 'number' 
                ? String(teacherFormData.workExperience) 
                : teacherFormData.workExperience)
            : undefined,
        });
      }

      // Update local user data
      updateUser({
        ...user,
        ...formData,
        gender: formData.gender as 'male' | 'female' | undefined,
        teacher: {
          ...user.teacher,
          description: teacherFormData.description,
          qualifications: teacherFormData.qualifications,
          specializations: teacherFormData.specializations,
          workExperience: teacherFormData.workExperience,
        } as any,
      });

      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
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
    setTeacherFormData({
      description: user?.teacher?.description || '',
      qualifications: user?.teacher?.qualifications || [],
      specializations: user?.teacher?.specializations || [],
      workExperience: user?.teacher?.workExperience || undefined,
    });
    setErrors({});
    setTeacherErrors({});
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
    teacherFormData,
    teacherErrors,
    handleInputChange,
    handleTeacherInputChange,
    handleArrayInputChange,
    handleSave,
    handleCancel,
  };
};