import { useState, useCallback } from 'react';
import { createParentAPI, updateParentAPI, addChildAPI, removeChildAPI } from '@features/parents';
import { validateParent } from '@features/parents/validations';
import { Parent, ParentFormData, ParentValidationErrors } from '@shared/types';

interface UseParentFormReturn {
  form: ParentFormData;
  formErrors: ParentValidationErrors;
  formLoading: boolean;
  formError: string;
  tabValue: number;
  setTabValue: (value: number) => void;
  studentSearchQuery: string;
  setStudentSearchQuery: (query: string) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  searchingStudents: boolean;
  setSearchingStudents: (searching: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: (parent?: Parent | null) => void;
  resetForm: () => void;
  handleSubmit: (selectedParent?: Parent | null, onSuccess?: () => void) => Promise<{ success: boolean; message?: string }>;
  handleAddChild: (studentId: string, parentId: string) => Promise<{ success: boolean; message: string }>;
  handleRemoveChild: (studentId: string, parentId: string) => Promise<{ success: boolean; message: string }>;
}

export const useParentForm = (): UseParentFormReturn => {
  const [form, setForm] = useState<ParentFormData>({
    name: '',
    email: '',
    password: '',
    dayOfBirth: '',
    phone: '',
    address: '',
    gender: 'male',
    canSeeTeacherInfo: true,
  });
  const [formErrors, setFormErrors] = useState<ParentValidationErrors>({});
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingStudents, setSearchingStudents] = useState<boolean>(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const setFormData = useCallback((parent: Parent | null = null): void => {
    if (parent) {
      setForm({
        name: (parent as any).userId?.name || (parent as any).name || '',
        email: (parent as any).userId?.email || (parent as any).email || '',
        dayOfBirth: (parent as any).userId?.dayOfBirth || (parent as any).dayOfBirth || '',
        phone: (parent as any).userId?.phone || (parent as any).phone || '',
        address: (parent as any).userId?.address || (parent as any).address || '',
        gender: (parent as any).userId?.gender || (parent as any).gender || 'male',
        canSeeTeacherInfo:
          (parent as any).canSeeTeacherInfo !== undefined ? (parent as any).canSeeTeacherInfo : true,
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        dayOfBirth: '',
        phone: '',
        address: '',
        gender: 'male',
        canSeeTeacherInfo: true,
      });
    }
  }, []);

  const resetForm = useCallback((): void => {
    setForm({
      name: '',
      email: '',
      password: '',
      dayOfBirth: '',
      phone: '',
      address: '',
      gender: 'male',
      canSeeTeacherInfo: true,
    });
    setFormErrors({});
    setFormError('');
    setTabValue(0);
    setStudentSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleSubmit = async (selectedParent?: Parent | null, onSuccess?: () => void): Promise<{ success: boolean; message?: string }> => {
    const isNewParent = !selectedParent;
    const errors = validateParent(form, isNewParent);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return { success: false };
    }

    setFormErrors({});
    setFormLoading(true);
    setFormError('');

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
      if (selectedParent) {
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
      } else {
        // Create new parent
        body = {
          email: form.email,
          name: form.name,
          dayOfBirth: toAPIDateFormat(form.dayOfBirth),
          phone: form.phone,
          address: form.address,
          gender: form.gender,
          canSeeTeacherInfo: form.canSeeTeacherInfo,
        };
      }

      if (selectedParent) {
        await updateParentAPI(selectedParent.id, body);
      } else {
        await createParentAPI(body);
      }

      resetForm();
      if (onSuccess) {
        onSuccess();
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu phụ huynh';
      setFormError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddChild = async (studentId: string, parentId: string): Promise<{ success: boolean; message: string }> => {
    try {
      await addChildAPI(studentId, parentId);
      return { success: true, message: 'Thêm con thành công!' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi thêm con'
      };
    }
  };

  const handleRemoveChild = async (studentId: string, parentId: string): Promise<{ success: boolean; message: string }> => {
    try {
      await removeChildAPI(studentId, parentId);
      return { success: true, message: 'Xóa con thành công!' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa con'
      };
    }
  };

  return {
    form,
    formErrors,
    formLoading,
    formError,
    tabValue,
    setTabValue,
    studentSearchQuery,
    setStudentSearchQuery,
    searchResults,
    setSearchResults,
    searchingStudents,
    setSearchingStudents,
    handleChange,
    setFormData,
    resetForm,
    handleSubmit,
    handleAddChild,
    handleRemoveChild,
  };
};
