import {
  validateEmail,
  validatePhone,
  validateDayOfBirth,
  validateAddress,
  validateGender,
  validateName,
  validatePassword,
  validateDiscountCode,
  validateChangePassword,
  type ChangePasswordData,
  type ChangePasswordErrors
} from '@shared/validations/common';

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  dayOfBirth: string;
  address: string;
  gender: string;
  password?: string;
}

export interface StudentUpdateData {
  dayOfBirth: string;
  grade: string;
  parentId: string | null;
}

export interface ClassEditData {
  discountPercent: string | number;
}

export interface StudentValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  dayOfBirth?: string;
  address?: string;
  gender?: string;
  password?: string;
  classEdits?: Array<{ discountPercent?: string } | null>;
}

export interface StudentUpdateErrors {
  dayOfBirth?: string;
  grade?: string;
  parentId?: string;
}

// Validate toàn bộ form học sinh (bao gồm cả discountPercent cho từng lớp)
export function validateStudent(
  form: StudentFormData,
  isEdit: boolean = false,
  classEdits: ClassEditData[] = []
): StudentValidationErrors {
  const errors: StudentValidationErrors = {};

  if (!isEdit) {
    // Khi thêm mới, validate password
    const passwordError = validatePassword(form.password || '');
    if (passwordError) errors.password = passwordError;
  }

  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  const dobError = validateDayOfBirth(form.dayOfBirth);
  if (dobError) errors.dayOfBirth = dobError;

  const addressError = validateAddress(form.address);
  if (addressError) errors.address = addressError;

  const genderError = validateGender(form.gender);
  if (genderError) errors.gender = genderError;

  // Validate discountPercent cho từng classEdits (nếu có)
  if (Array.isArray(classEdits)) {
    errors.classEdits = classEdits.map((cls) => {
      const discountError = validateDiscountCode(cls.discountPercent);
      return discountError ? { discountPercent: discountError } : null;
    });
  }

  return errors;
}

// Validate student update
export function validateStudentUpdate(data: StudentUpdateData): StudentUpdateErrors {
  const errors: StudentUpdateErrors = {};

  if (!data.dayOfBirth) {
    errors.dayOfBirth = 'Ngày sinh không được để trống';
  } else {
    const dobError = validateDayOfBirth(data.dayOfBirth);
    if (dobError) errors.dayOfBirth = dobError;
  }

  if (!data.grade || isNaN(Number(data.grade)) || Number(data.grade) < 1 || Number(data.grade) > 12) {
    errors.grade = 'Lớp phải là số từ 1 đến 12';
  }

  // parentId có thể là null nên không cần validate

  return errors;
}

export {
  validateChangePassword,
  type ChangePasswordData,
  type ChangePasswordErrors
};

