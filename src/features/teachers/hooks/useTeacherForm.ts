import { useState, useCallback } from 'react';
import { createTeacherAPI, updateTeacherAPI } from '@features/teachers';
import { Teacher, UseFormReturn, FormErrors } from '@shared/types';
import { validateTeacher, validateName, validateEmail, validatePhone, validateAddress, validateGender } from '@features/teachers/validations';

export const useTeacherForm = (): UseFormReturn<Teacher> => {
  const [form, setForm] = useState<any>({
    id: '',
    userId: {
      id: '',
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      role: 'teacher',
    },
    isActive: true,
    description: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;

    setForm((prev: any) => ({
      ...prev,
      ...(name.includes('.')
        ? {
            userId: {
              ...prev.userId,
              [name.split('.')[1]]: type === 'checkbox' ? checked : value,
            },
          }
        : {
            [name]: type === 'checkbox' ? checked : value,
          }
      ),
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [formErrors]);

  const setFormData = useCallback((data?: Teacher): void => {
    if (data) {
      setForm(data);
    } else {
      setForm({
        id: '',
        userId: {
          id: '',
          name: '',
          email: '',
          phone: '',
          gender: 'male',
          role: 'teacher',
        },
        isActive: true,
        description: '',
      });
    }
    setFormErrors({});
    setFormError('');
  }, []);

  const resetForm = useCallback((): void => {
    setForm({
      id: '',
      userId: {
        id: '',
        name: '',
        email: '',
        phone: '',
        gender: 'male',
        role: 'teacher',
      },
      isActive: true,
      description: '',
    });
    setFormErrors({});
    setFormError('');
  }, []);

  const handleSubmit = useCallback(async (
    data?: Teacher,
    onSuccess?: () => void,
    originalData?: Teacher
  ): Promise<{ success: boolean; message?: string }> => {
    const teacherData = data || form;

    // Validate form - different validation for create vs update
    if (teacherData.id) {
      // For update - only validate fields that are being changed
      const updateData = getChangedFields(teacherData, originalData);
      console.log('🔄 Changed fields for validation:', updateData);

      // Only validate fields that are actually being updated
      const validationErrors: any = {};

      if (updateData.name !== undefined) {
        const nameError = validateName(updateData.name);
        if (nameError) validationErrors.name = nameError;
      }

      if (updateData.email !== undefined) {
        const emailError = validateEmail(updateData.email);
        if (emailError) validationErrors.email = emailError;
      }

      if (updateData.phone !== undefined) {
        const phoneError = validatePhone(updateData.phone);
        if (phoneError) validationErrors.phone = phoneError;
      }

      if (updateData.address !== undefined) {
        const addressError = validateAddress(updateData.address);
        if (addressError) validationErrors.address = addressError;
      }

      if (updateData.gender !== undefined) {
        const genderError = validateGender(updateData.gender);
        if (genderError) validationErrors.gender = genderError;
      }

      if (updateData.salaryPerLesson !== undefined) {
        if (isNaN(Number(updateData.salaryPerLesson)) || Number(updateData.salaryPerLesson) < 0) {
          validationErrors.salaryPerLesson = 'Lương phải là số lớn hơn hoặc bằng 0';
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        console.log('❌ Validation errors:', validationErrors);
        setFormErrors(validationErrors);
        return { success: false, message: 'Vui lòng kiểm tra lại thông tin' };
      }
    } else {
      // For create - validate all required fields
      // Handle both flat structure (from TeacherForm) and nested structure (from hook)
      console.log('📝 TeacherData received for create:', teacherData);
      
      const teacherFormData = {
        name: teacherData.name || teacherData.userId?.name || '',
        email: teacherData.email || teacherData.userId?.email || '',
        phone: teacherData.phone || teacherData.userId?.phone || '',
        dayOfBirth: teacherData.dayOfBirth || teacherData.userId?.dayOfBirth || '',
        address: teacherData.address || teacherData.userId?.address || '',
        gender: teacherData.gender || teacherData.userId?.gender || '',
        description: teacherData.description || '',
        password: teacherData.password || undefined,
        salaryPerLesson: teacherData.salaryPerLesson !== undefined && teacherData.salaryPerLesson !== null 
          ? teacherData.salaryPerLesson 
          : undefined,
        qualifications: Array.isArray(teacherData.qualifications) 
          ? teacherData.qualifications 
          : (teacherData.qualifications ? [teacherData.qualifications] : []),
        specializations: Array.isArray(teacherData.specializations) 
          ? teacherData.specializations 
          : (teacherData.specializations ? [teacherData.specializations] : []),
        introduction: teacherData.introduction || '',
        workExperience: teacherData.workExperience || '',
        isActive: teacherData.isActive !== undefined ? teacherData.isActive : true,
      };
      
      console.log('📝 TeacherFormData prepared for validation:', teacherFormData);
      
      const errors = validateTeacher(teacherFormData as any);
      if (Object.keys(errors).length > 0) {
        console.log('❌ Validation errors for create:', errors);
        setFormErrors(errors as any);
        return { success: false, message: 'Vui lòng kiểm tra lại thông tin' };
      }
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (teacherData.id) {
        // Update existing teacher - only send changed fields
        const updateData = getChangedFields(teacherData, originalData);
        console.log('🔄 Sending only changed fields:', updateData);
        await updateTeacherAPI(teacherData.id, updateData);
      } else {
        // Create new teacher
        // Handle both flat structure (from TeacherForm) and nested structure (from hook)
        const dayOfBirthValue = teacherData.dayOfBirth || teacherData.userId?.dayOfBirth || '';
        
        // Convert YYYY-MM-DD to MM/DD/YYYY format for backend
        let formattedDayOfBirth = dayOfBirthValue;
        if (dayOfBirthValue && dayOfBirthValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dayOfBirthValue.split('-');
          formattedDayOfBirth = `${month}/${day}/${year}`;
        }
        
        const createData = {
          name: teacherData.name || teacherData.userId?.name || '',
          email: teacherData.email || teacherData.userId?.email || '',
          phone: teacherData.phone || teacherData.userId?.phone || '',
          dayOfBirth: formattedDayOfBirth,
          address: teacherData.address || teacherData.userId?.address || '',
          gender: teacherData.gender || teacherData.userId?.gender || '',
          password: teacherData.password || '',
          description: teacherData.description || '',
          qualifications: Array.isArray(teacherData.qualifications) 
            ? teacherData.qualifications 
            : (teacherData.qualifications ? [teacherData.qualifications] : []),
          specializations: Array.isArray(teacherData.specializations) 
            ? teacherData.specializations 
            : (teacherData.specializations ? [teacherData.specializations] : []),
          introduction: teacherData.introduction || '',
          workExperience: teacherData.workExperience || '',
          salaryPerLesson: teacherData.salaryPerLesson !== undefined && teacherData.salaryPerLesson !== null 
            ? Number(teacherData.salaryPerLesson) 
            : 0,
          isActive: teacherData.isActive !== undefined ? teacherData.isActive : true
        };
        
        console.log('📤 CreateData to send to API:', createData);
        await createTeacherAPI(createData as any);
      }

      onSuccess?.();
      return { success: true, message: 'Lưu giáo viên thành công!' };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi lưu giáo viên';
      setFormError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFormLoading(false);
    }
  }, [form]);

  // Helper function to get only changed fields
  const getChangedFields = (newData: any, originalData?: any): any => {
    if (!originalData) {
      return newData; // If no original data, send all data (for create)
    }

    const changedFields: any = {};

    // Check userId fields
    if (newData.userId && originalData.userId) {
      const userIdFields = ['name', 'email', 'phone', 'gender', 'dayOfBirth', 'address'];
      userIdFields.forEach(field => {
        if (newData.userId[field] !== originalData.userId[field]) {
          changedFields[field] = newData.userId[field];
        }
      });
    }

    // Check direct fields
    const directFields = ['description', 'qualifications', 'specializations', 'salaryPerLesson', 'typical', 'isActive'];
    directFields.forEach(field => {
      if (newData[field] !== originalData[field]) {
        changedFields[field] = newData[field];
      }
    });

    return changedFields;
  };

  return {
    form,
    formErrors,
    formLoading,
    formError,
    loading: formLoading,
    error: formError,
    handleChange,
    setFormData,
    resetForm,
    handleSubmit,
  };
};
