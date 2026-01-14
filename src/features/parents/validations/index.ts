import {
  validateEmail,
  validatePhone,
  validateDayOfBirth,
  validateAddress,
  validateGender,
  validateName,
  validatePassword
} from '@shared/validations/common';

export interface ParentFormData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  dayOfBirth: string;
  address: string;
  gender: string;
  canSeeTeacherInfo: boolean;
}

export interface ParentUpdateData {
  canSeeTeacherInfo: boolean;
}

export interface ParentValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  dayOfBirth?: string;
  address?: string;
  gender?: string;
  canSeeTeacherInfo?: string;
}

export interface ParentUpdateErrors {
  canSeeTeacherInfo?: string;
}

// Validate toàn bộ form phụ huynh
export function validateParent(form: ParentFormData, isNewParent: boolean = false): ParentValidationErrors {
  const errors: ParentValidationErrors = {};

  // Validate name
  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  // Validate email
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  // Validate password (only for new parent)
  if (isNewParent) {
    const passwordError = validatePassword(form.password || '');
    if (passwordError) errors.password = passwordError;
  }

  // Validate phone
  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  // Validate day of birth
  const dobError = validateDayOfBirth(form.dayOfBirth);
  if (dobError) errors.dayOfBirth = dobError;

  // Validate address
  const addressError = validateAddress(form.address);
  if (addressError) errors.address = addressError;

  // Validate gender
  const genderError = validateGender(form.gender);
  if (genderError) errors.gender = genderError;

  return errors;
}

// Validate parent update
export function validateParentUpdate(data: ParentUpdateData): ParentUpdateErrors {
  const errors: ParentUpdateErrors = {};

  if (typeof data.canSeeTeacherInfo !== 'boolean') {
    errors.canSeeTeacherInfo = 'Trạng thái xem thông tin giáo viên không hợp lệ';
  }

  return errors;
}

