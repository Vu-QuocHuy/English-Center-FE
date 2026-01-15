import {
  validateEmail,
  validatePhone,
  validateDayOfBirth,
  validateAddress,
  validateGender,
  validateName,
  validatePassword,
  validateChangePassword,
  type ChangePasswordData,
  type ChangePasswordErrors
} from '@shared/validations/common';

export interface TeacherFormData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  dayOfBirth: string;
  address: string;
  gender: string;
  description: string;
  qualifications: string[];
  specializations: string[];
  introduction: string;
  workExperience: string;
  salaryPerLesson?: string | number;
  isActive: boolean;
}

export interface TeacherUpdateData {
  description: string;
  isActive: boolean;
}

export interface TeacherValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  dayOfBirth?: string;
  address?: string;
  gender?: string;
  description?: string;
  qualifications?: string;
  specializations?: string;
  introduction?: string;
  workExperience?: string;
  salaryPerLesson?: string;
  isActive?: string;
}

export interface TeacherUpdateErrors {
  description?: string;
  isActive?: string;
}

// Validate toàn bộ form giáo viên
export function validateTeacher(form: TeacherFormData): TeacherValidationErrors {
  const errors: TeacherValidationErrors = {};

  // Validate required fields
  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  // Password is required for new teachers
  if (form.password !== undefined) {
    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;
  }

  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  // Validate dayOfBirth (YYYY-MM-DD format from date input)
  if (!form.dayOfBirth) {
    errors.dayOfBirth = 'Ngày sinh không được để trống';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.dayOfBirth)) {
      errors.dayOfBirth = 'Ngày sinh không hợp lệ';
    } else {
      const date = new Date(form.dayOfBirth);
      if (isNaN(date.getTime())) {
        errors.dayOfBirth = 'Ngày sinh không hợp lệ';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date >= today) {
          errors.dayOfBirth = 'Ngày sinh phải nhỏ hơn ngày hiện tại';
        }
      }
    }
  }

  const addressError = validateAddress(form.address);
  if (addressError) errors.address = addressError;

  const genderError = validateGender(form.gender);
  if (genderError) errors.gender = genderError;

  // Validate salaryPerLesson (required)
  if (form.salaryPerLesson === undefined || form.salaryPerLesson === null || form.salaryPerLesson === '') {
    errors.salaryPerLesson = 'Lương mỗi buổi học không được để trống';
  } else if (isNaN(Number(form.salaryPerLesson)) || Number(form.salaryPerLesson) < 0) {
    errors.salaryPerLesson = 'Lương phải là số lớn hơn hoặc bằng 0';
  }

  // Các validate khác (qualifications, specializations, description) đang được bỏ qua

  // Validate introduction (optional)
  if (form.introduction && form.introduction.trim().length > 1000) {
    errors.introduction = 'Giới thiệu không được quá 1000 ký tự';
  }

  // Validate workExperience (optional)
  if (form.workExperience && form.workExperience.trim().length > 1000) {
    errors.workExperience = 'Kinh nghiệm làm việc không được quá 1000 ký tự';
  }

  return errors;
}

// Validate teacher update
export function validateTeacherUpdate(data: TeacherUpdateData): TeacherUpdateErrors {
  const errors: TeacherUpdateErrors = {};

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Mô tả không được để trống';
  }

  if (typeof data.isActive !== 'boolean') {
    errors.isActive = 'Trạng thái hoạt động không hợp lệ';
  }

  return errors;
}

export {
  validateEmail,
  validatePhone,
  validateDayOfBirth,
  validateAddress,
  validateGender,
  validateName,
  validatePassword,
  validateChangePassword,
  type ChangePasswordData,
  type ChangePasswordErrors
};

