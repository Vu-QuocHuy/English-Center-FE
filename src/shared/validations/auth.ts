import { validationRules } from '@shared/utils';
import { validateEmail, validatePassword } from './common';

// Login validation
export interface LoginFormData {
  email: string;
  password: string;
}

export const loginValidationSchema = {
  email: [
    validationRules.required(),
    validationRules.email()
  ],
  password: [
    validationRules.required(),
    validationRules.minLength(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
    validationRules.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Mật khẩu phải bao gồm cả chữ cái và số')
  ]
};

// Relaxed validation for admin login (for development/testing)
export const adminLoginValidationSchema = {
  email: [
    validationRules.required(),
    validationRules.email()
  ],
  password: [
    validationRules.required(),
    validationRules.minLength(3, 'Mật khẩu phải có ít nhất 3 ký tự')
  ]
};

// Forgot password / OTP validation
export function validateOtpCode(otpCode: string): string {
  if (!otpCode) return 'Vui lòng nhập mã OTP';
  if (!/^[0-9]{6}$/.test(otpCode)) return 'Mã OTP phải gồm 6 chữ số';
  return '';
}

export interface ForgotPasswordData {
  email: string;
  password: string;
  confirmPassword?: string;
  otpCode?: string;
}

export interface ForgotPasswordErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  otpCode?: string;
}

export function validateForgotPassword({ email, password, confirmPassword, otpCode }: ForgotPasswordData): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (otpCode !== undefined) {
    const otpError = validateOtpCode(otpCode);
    if (otpError) errors.otpCode = otpError;
  }
  if (confirmPassword !== undefined) {
    if (!confirmPassword) errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    else if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }
  return errors;
}

