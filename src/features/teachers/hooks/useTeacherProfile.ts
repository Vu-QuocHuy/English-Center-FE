import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useTeacherForm } from './useTeacherForm';
import { getTeacherByIdAPI } from '@features/teachers';
import { Teacher } from '@shared/types';

export interface UseTeacherProfileReturn {
  // State
  isEditing: boolean;
  error: string;
  success: string;
  changePasswordOpen: boolean;
  form: any;
  formErrors: any;
  formLoading: boolean;
  loading: boolean;

  // Handlers
  setIsEditing: (value: boolean) => void;
  setError: (value: string) => void;
  setSuccess: (value: string) => void;
  setChangePasswordOpen: (value: boolean) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  getFormValue: (field: string) => string;
  handleInputChange: (field: string, value: string | boolean) => void;
}

export const useTeacherProfile = (): UseTeacherProfileReturn => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [originalTeacherData, setOriginalTeacherData] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef<string | null>(null); // Track which teacher ID was last fetched
  const isFetchingRef = useRef(false); // Prevent concurrent fetches

  // Use the same hook as admin teacher management
  const {
    form,
    formErrors,
    formLoading,
    setFormData,
    handleSubmit,
  } = useTeacherForm();

  // Fetch teacher data from API when component mounts or route changes to profile page
  useEffect(() => {
    const fetchTeacherData = async () => {
      // Only fetch when on teacher profile page
      if (!location.pathname.includes('/teacher/profile')) {
        hasFetchedRef.current = null; // Reset when leaving page
        return;
      }

      // Try multiple ways to get teacher ID
      const teacherId = user?.teacherId || user?.teacher?.id || user?.teacher?.teacher_id || user?.id;
      
      if (!teacherId) {
        return;
      }

      // Skip if already fetching or already fetched the same ID
      if (isFetchingRef.current || hasFetchedRef.current === teacherId) {
        return;
      }

      isFetchingRef.current = true;
      hasFetchedRef.current = teacherId;
      setLoading(true);
      setError('');
      
      try {
        const response = await getTeacherByIdAPI(teacherId);
        
        if (response && response.data && response.data.data) {
          const teacherData = response.data.data;
          console.log('✅ Teacher data received:', teacherData);
          
          // Convert dayOfBirth from various formats to YYYY-MM-DD for input field
          let dayOfBirthFormatted = '';
          if (teacherData.dayOfBirth) {
            const dayOfBirth = teacherData.dayOfBirth;
            
            // Handle ISO string format: "1984-05-07T17:00:00.000Z"
            if (dayOfBirth.includes('T')) {
              const date = new Date(dayOfBirth);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dayOfBirthFormatted = `${year}-${month}-${day}`;
              }
            }
            // Handle MM/DD/YYYY format
            else if (dayOfBirth.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
              const [month, day, year] = dayOfBirth.split('/');
              dayOfBirthFormatted = `${year}-${month}-${day}`;
            }
            // Handle YYYY-MM-DD format (already correct)
            else if (dayOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
              dayOfBirthFormatted = dayOfBirth;
            }
            // Try to parse as date string
            else {
              const date = new Date(dayOfBirth);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dayOfBirthFormatted = `${year}-${month}-${day}`;
              }
            }
          }

          const teacher: Teacher = {
            id: teacherData.id,
            userId: {
              id: teacherData.id || user.id || '',
              name: teacherData.name || user.name || '',
              email: teacherData.email || user.email || '',
              phone: teacherData.phone || user.phone || '',
              gender: (teacherData.gender as 'male' | 'female') || (user.gender as 'male' | 'female') || 'male',
              dayOfBirth: dayOfBirthFormatted,
              address: teacherData.address || user.address || '',
              role: 'teacher' as const,
              avatar: teacherData.avatar || user.avatar || undefined,
            },
            isActive: teacherData.isActive !== undefined ? teacherData.isActive : true,
            description: teacherData.description || '',
            qualifications: Array.isArray(teacherData.qualifications) 
              ? teacherData.qualifications 
              : (teacherData.qualifications ? [teacherData.qualifications] : []),
            specializations: Array.isArray(teacherData.specializations) 
              ? teacherData.specializations 
              : (teacherData.specializations ? [teacherData.specializations] : []),
            workExperience: teacherData.workExperience !== null && teacherData.workExperience !== undefined 
              ? String(teacherData.workExperience) 
              : '',
            salaryPerLesson: teacherData.salaryPerLesson || 0,
            introduction: teacherData.introduction || '',
            typical: teacherData.typical !== undefined ? teacherData.typical : false,
          } as Teacher;

          setFormData(teacher);
          setOriginalTeacherData(teacher);

          // Update user context with fresh data from API (only update if user exists)
          if (user) {
            updateUser({
              name: teacherData.name || user.name,
              email: teacherData.email || user.email,
              phone: teacherData.phone || user.phone,
              gender: teacherData.gender || user.gender,
              address: teacherData.address || user.address,
              dayOfBirth: teacherData.dayOfBirth || user.dayOfBirth,
              avatar: teacherData.avatar || user.avatar,
              teacher: {
                ...user.teacher,
                ...teacherData,
              } as any,
            });
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thông tin giáo viên');
        // Reset fetch tracking on error so it can retry
        hasFetchedRef.current = null;
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchTeacherData();
    // Only depend on pathname and teacher ID values, not the entire user object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user?.teacherId, user?.teacher?.id, user?.id]);

  const handleSave = useCallback(async () => {
    // Try multiple ways to get teacher ID
    const teacherId = user?.teacherId || user?.teacher?.id || user?.teacher?.teacher_id || user?.id;
    
    if (!teacherId) {
      setError('Không tìm thấy thông tin giáo viên');
      return;
    }

    // Convert qualifications and specializations from string to array if needed
    const formDataToSubmit = {
      ...form,
      qualifications: typeof form.qualifications === 'string' 
        ? (form.qualifications as string).split(/[,\n]/).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
        : (Array.isArray(form.qualifications) ? form.qualifications : []),
      specializations: typeof form.specializations === 'string'
        ? (form.specializations as string).split(/[,\n]/).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
        : (Array.isArray(form.specializations) ? form.specializations : []),
    };

    const result = await handleSubmit(formDataToSubmit, async () => {
      // On success callback - update local user context
      if (form.userId) {
        let dayOfBirthValue = form.userId.dayOfBirth || '';

        // Convert qualifications and specializations to array for user context
        const qualificationsArray = typeof form.qualifications === 'string'
          ? (form.qualifications as string).split(/[,\n]/).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
          : (Array.isArray(form.qualifications) ? form.qualifications : []);
        
        const specializationsArray = typeof form.specializations === 'string'
          ? (form.specializations as string).split(/[,\n]/).map((item: string) => item.trim()).filter((item: string) => item.length > 0)
          : (Array.isArray(form.specializations) ? form.specializations : []);

        updateUser({
          ...user,
          name: form.userId.name || user.name,
          email: form.userId.email || user.email,
          phone: form.userId.phone || user.phone,
          gender: form.userId.gender || user.gender,
          address: form.userId.address || user.address,
          dayOfBirth: dayOfBirthValue || user.dayOfBirth,
          teacher: {
            ...user.teacher,
            description: form.description || user.teacher?.description,
            qualifications: qualificationsArray,
            specializations: specializationsArray,
            workExperience: form.workExperience || user.teacher?.workExperience,
          } as any,
        });
      }
    }, originalTeacherData || undefined);

    if (result.success) {
      setSuccess(result.message || 'Cập nhật thông tin thành công!');
      setIsEditing(false);
      setError('');
    } else {
      setError(result.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      setSuccess('');
    }
  }, [form, user, updateUser, handleSubmit, originalTeacherData]);

  const handleCancel = useCallback(() => {
    if (originalTeacherData) {
      setFormData(originalTeacherData);
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  }, [originalTeacherData, setFormData]);

  // Helper to get form field value
  const getFormValue = useCallback((field: string): string => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return (form as any)[parent]?.[child] || '';
    }
    return (form as any)[field] || '';
  }, [form]);

  // Helper to handle input change
  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...form,
        [parent]: {
          ...(form as any)[parent],
          [child]: value,
        },
      } as any);
    } else {
      setFormData({
        ...form,
        [field]: value,
      } as any);
    }
  }, [form, setFormData]);

  return {
    isEditing,
    error,
    success,
    changePasswordOpen,
    form,
    formErrors,
    formLoading,
    loading,
    setIsEditing,
    setError,
    setSuccess,
    setChangePasswordOpen,
    handleSave,
    handleCancel,
    getFormValue,
    handleInputChange,
  };
};
