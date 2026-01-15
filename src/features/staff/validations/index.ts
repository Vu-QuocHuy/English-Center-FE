import {
  validateEmail,
  validatePhone,
  validateAddress,
  validateGender,
  validateName,
  validatePassword
} from '@shared/validations/common';

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  dayOfBirth: string;
  address: string;
  gender: string;
  password?: string;
  roleId?: string;
}

export interface StaffValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  dayOfBirth?: string;
  address?: string;
  gender?: string;
  password?: string;
  roleId?: string;
}

// Validate dayOfBirth (YYYY-MM-DD format from input type="date")
function validateDateOfBirth(dateStr: string): string {
  if (!dateStr) return 'Ngày sinh không được để trống';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Ngày sinh không hợp lệ';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date >= today) return 'Ngày sinh phải nhỏ hơn ngày hiện tại';

  return '';
}

// Validate toàn bộ form nhân viên
export function validateStaff(
  form: StaffFormData,
  isEdit: boolean = false
): StaffValidationErrors {
  const errors: StaffValidationErrors = {};

  // Validate name
  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  // Validate email
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  // Validate phone
  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  // Validate dayOfBirth (YYYY-MM-DD format)
  const dobError = validateDateOfBirth(form.dayOfBirth);
  if (dobError) errors.dayOfBirth = dobError;

  // Validate address
  const addressError = validateAddress(form.address);
  if (addressError) errors.address = addressError;

  // Validate gender
  const genderError = validateGender(form.gender);
  if (genderError) errors.gender = genderError;

  // Validate password (only for new staff)
  if (!isEdit) {
    const passwordError = validatePassword(form.password || '');
    if (passwordError) errors.password = passwordError;
  }

  return errors;
}
