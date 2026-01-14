import { useState } from 'react';
import { createStudentAPI, updateStudentAPI } from '@features/students';
import { validateStudent } from '@features/students/validations';
import { Student, StudentFormData, StudentValidationErrors, ClassEditData } from '@shared/types';

interface UseStudentFormReturn {
  form: StudentFormData;
  classEdits: ClassEditData[];
  formErrors: StudentValidationErrors;
  formLoading: boolean;
  formError: string;
  formSubmitted: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClassEditChange: (idx: number, field: string, value: any) => void;
  setFormData: (student?: Student | null) => void;
  resetForm: () => void;
  handleSubmit: (selectedStudent?: Student | null, onSuccess?: () => void) => Promise<{ success: boolean; message?: string }>;
}

export const useStudentForm = (): UseStudentFormReturn => {
  const [form, setForm] = useState<StudentFormData>({
    name: '',
    email: '',
    password: '',
    dayOfBirth: '',
    phone: '',
    address: '',
    gender: 'female',
  });
  const [classEdits, setClassEdits] = useState<ClassEditData[]>([]);
  const [formErrors, setFormErrors] = useState<StudentValidationErrors>({});
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassEditChange = (idx: number, field: string, value: any): void => {
    setClassEdits(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const setFormData = (student: Student | null = null): void => {
    if (student) {
      setForm({
        name: student.userId?.name || '',
        email: student.userId?.email || '',
        password: '',
        dayOfBirth: student.userId?.dayOfBirth || '',
        phone: student.userId?.phone || '',
        address: student.userId?.address || '',
        gender: student.userId?.gender || 'female',
      });
      setClassEdits(
        (student.classes || []).map((cls, index) => ({
          classId: typeof cls.classId === 'string' ? cls.classId : cls.classId?.id || `class-${index}`,
          className: typeof cls.classId === 'object' ? cls.classId?.name || `Lớp ${cls.classId?.grade || ''}.${cls.classId?.section || ''}` : `Lớp ${index + 1}`,
          discountPercent: cls.discountPercent || 0,
          status: 'active',
        }))
      );
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        dayOfBirth: '',
        phone: '',
        address: '',
        gender: 'female',
      });
      setClassEdits([]);
    }
  };

  const resetForm = (): void => {
    setForm({
      name: '',
      email: '',
      password: '',
      dayOfBirth: '',
      phone: '',
      address: '',
      gender: 'female',
    });
    setClassEdits([]);
    setFormErrors({});
    setFormError('');
    setFormSubmitted(false);
  };

  const handleSubmit = async (selectedStudent?: Student | null, onSuccess?: () => void): Promise<{ success: boolean; message?: string }> => {
    const errors = validateStudent(form, !!selectedStudent, classEdits);

    // Kiểm tra lỗi tổng thể và lỗi discountPercent từng lớp
    const hasFieldError = Object.keys(errors).some(key => key !== 'classEdits' && errors[key as keyof StudentValidationErrors]);
    const hasClassEditError = Array.isArray(errors.classEdits) && errors.classEdits.some(e => e && e.discountPercent);

    if (hasFieldError || hasClassEditError) {
      setFormErrors(errors);
      return { success: false };
    }

    setFormErrors({});
    setFormLoading(true);
    setFormError('');

    try {
      let body: any;
      if (selectedStudent) {
        // Update: phải đúng format BE yêu cầu
        body = {
          userData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            dayOfBirth: form.dayOfBirth,
            gender: form.gender,
            address: form.address,
          },
          studentData: classEdits.map(edit => ({
            classId: edit.classId,
            status: edit.status,
            discountPercent: edit.discountPercent || 0
          }))
        };
      } else {
        // Create: đúng format API specification
        body = {
          email: form.email,
          password: form.password,
          name: form.name,
          dayOfBirth: form.dayOfBirth,
          phone: form.phone,
          address: form.address,
          gender: form.gender
        };
      }

      if (selectedStudent) {
        // Update existing student
        await updateStudentAPI(selectedStudent.id, body);
      } else {
        // Create new student
        await createStudentAPI(body);
      }

      resetForm();
      if (onSuccess) {
        onSuccess();
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu học sinh';
      setFormError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setFormLoading(false);
    }
  };

  return {
    form,
    classEdits,
    formErrors,
    formLoading,
    formError,
    formSubmitted,
    handleChange,
    handleClassEditChange,
    setFormData,
    resetForm,
    handleSubmit,
  };
};
