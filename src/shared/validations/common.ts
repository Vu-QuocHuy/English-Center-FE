// Common validation helpers used across features
export function validateEmail(email: string): string {
  if (!email) return 'Email không được để trống';
  const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!re.test(email)) return 'Email không hợp lệ';
  return '';
}

// Validate phone (Việt Nam, 10 số, bắt đầu bằng 0)
export function validatePhone(phone: string): string {
  if (!phone) return 'Số điện thoại không được để trống';
  const re = /^0\d{9}$/;
  if (!re.test(phone)) return 'Số điện thoại không hợp lệ';
  return '';
}

// Validate dayOfBirth (dd/mm/yyyy)
export function validateDayOfBirth(dayOfBirth: string): string {
  if (!dayOfBirth) return 'Ngày sinh không được để trống';
  const re = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!re.test(dayOfBirth)) return 'Ngày sinh phải có định dạng dd/mm/yyyy';
  // Kiểm tra ngày thực tế
  const [dd, mm, yyyy] = dayOfBirth.split('/').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return 'Ngày sinh không hợp lệ';
  // Ngày sinh phải nhỏ hơn ngày hiện tại
  const today = new Date();
  if (d >= today) return 'Ngày sinh phải nhỏ hơn ngày hiện tại';
  return '';
}

// Validate address
export function validateAddress(address: string): string {
  if (!address) return 'Địa chỉ không được để trống';
  if (address.length < 3) return 'Địa chỉ quá ngắn';
  return '';
}

// Validate gender
export function validateGender(gender: string): string {
  if (!gender) return 'Vui lòng chọn giới tính';
  if (!['male', 'female'].includes(gender)) return 'Giới tính không hợp lệ';
  return '';
}

// Validate name
export function validateName(name: string): string {
  if (!name) return 'Họ và tên không được để trống';
  if (name.length < 2) return 'Họ và tên quá ngắn';
  return '';
}

// Validate password (tối thiểu 8 ký tự, gồm cả chữ và số)
export function validatePassword(password: string): string {
  if (!password) return 'Mật khẩu không được để trống';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Mật khẩu phải bao gồm cả chữ và số';
  return '';
}

// Validate discount code (giá trị từ 0 đến 100)
export function validateDiscountCode(discount: string | number): string {
  if (discount === undefined || discount === null || discount === '') return 'Mã giảm giá không được để trống';
  if (isNaN(Number(discount))) return 'Mã giảm giá phải là số';
  const value = Number(discount);
  if (value < 0 || value > 100) return 'Mã giảm giá chỉ cho phép từ 0 đến 100';
  return '';
}

// Validate đổi mật khẩu
export interface ChangePasswordData {
  current: string;
  newPassword: string;
  confirm: string;
}

export interface ChangePasswordErrors {
  current?: string;
  newPassword?: string;
  confirm?: string;
}

export function validateChangePassword({ current, newPassword, confirm }: ChangePasswordData): ChangePasswordErrors {
  const errors: ChangePasswordErrors = {};
  if (!current) errors.current = 'Vui lòng nhập mật khẩu hiện tại';
  if (!newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới';
  else if (newPassword.length < 8) errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
  else if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) errors.newPassword = 'Mật khẩu mới phải bao gồm cả chữ và số';
  if (!confirm) errors.confirm = 'Vui lòng xác nhận mật khẩu mới';
  else if (newPassword !== confirm) errors.confirm = 'Mật khẩu xác nhận không khớp';
  return errors;
}

// Validate user update
export interface UserUpdateData {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  address?: string;
  dayOfBirth?: string;
}

export interface UserUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  dayOfBirth?: string;
}

export function validateUserUpdate(data: UserUpdateData): UserUpdateErrors {
  const errors: UserUpdateErrors = {};

  if (!data.name) errors.name = 'Họ và tên không được để trống';
  else if (data.name.length < 2) errors.name = 'Họ và tên quá ngắn';

  if (!data.email) errors.email = 'Email không được để trống';
  else {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }

  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.phone = phoneError;
  }

  if (data.gender && !['male', 'female'].includes(data.gender)) {
    errors.gender = 'Giới tính không hợp lệ';
  }

  if (data.address && data.address.length < 3) {
    errors.address = 'Địa chỉ quá ngắn';
  }

  if (data.dayOfBirth) {
    // Validate dayOfBirth format (YYYY-MM-DD from date input)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.dayOfBirth)) {
      errors.dayOfBirth = 'Ngày sinh không hợp lệ';
    } else {
      const date = new Date(data.dayOfBirth);
      const today = new Date();
      if (date >= today) {
        errors.dayOfBirth = 'Ngày sinh phải nhỏ hơn ngày hiện tại';
      }
    }
  }

  return errors;
}

