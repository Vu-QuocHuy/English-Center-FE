export type ValidationRule = (value: any) => string | null;
export type ValidationSchema = Record<string, ValidationRule[]>;
export type ValidationErrors = Record<string, string>;
export type ValidationResult = {
  errors: ValidationErrors;
  isValid: boolean;
};

export const validationRules = {
  required: (message: string = 'Trường này là bắt buộc'): ValidationRule => (value: any): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  email: (message: string = 'Email không hợp lệ'): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  phone: (message: string = 'Số điện thoại không hợp lệ'): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return message;
    }
    return null;
  },

  minLength: (minLength: number, message?: string): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    if (value.length < minLength) {
      return message || `Tối thiểu ${minLength} ký tự`;
    }
    return null;
  },

  maxLength: (maxLength: number, message?: string): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    if (value.length > maxLength) {
      return message || `Tối đa ${maxLength} ký tự`;
    }
    return null;
  },

  min: (minValue: number, message?: string): ValidationRule => (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) < minValue) {
      return message || `Giá trị tối thiểu là ${minValue}`;
    }
    return null;
  },

  max: (maxValue: number, message?: string): ValidationRule => (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) > maxValue) {
      return message || `Giá trị tối đa là ${maxValue}`;
    }
    return null;
  },

  pattern: (regex: RegExp, message?: string): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message || 'Định dạng không hợp lệ';
    }
    return null;
  },

  date: (message: string = 'Ngày không hợp lệ'): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return message;
    }
    return null;
  },

  time: (message: string = 'Thời gian không hợp lệ'): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return message;
    }
    return null;
  },

  number: (message: string = 'Phải là số'): ValidationRule => (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  positiveNumber: (message: string = 'Phải là số dương'): ValidationRule => (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (isNaN(Number(value)) || Number(value) <= 0) {
      return message;
    }
    return null;
  },

  compare: (compareValue: any, operator: string = '===', message?: string): ValidationRule => (value: any): string | null => {
    if (!value) return null;

    let isValid = false;
    switch (operator) {
      case '===':
        isValid = value === compareValue;
        break;
      case '!==':
        isValid = value !== compareValue;
        break;
      case '>':
        isValid = Number(value) > Number(compareValue);
        break;
      case '>=':
        isValid = Number(value) >= Number(compareValue);
        break;
      case '<':
        isValid = Number(value) < Number(compareValue);
        break;
      case '<=':
        isValid = Number(value) <= Number(compareValue);
        break;
      default:
        isValid = false;
    }

    if (!isValid) {
      return message || `Giá trị phải ${operator} ${compareValue}`;
    }
    return null;
  },

  oneOf: (allowedValues: any[], message?: string): ValidationRule => (value: any): string | null => {
    if (!value) return null;
    if (!allowedValues.includes(value)) {
      return message || `Giá trị phải là một trong: ${allowedValues.join(', ')}`;
    }
    return null;
  }
};

export const createValidator = (rules: ValidationSchema) => {
  return (values: Record<string, any>): ValidationErrors => {
    const errors: ValidationErrors = {};

    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = values[field];

      for (let rule of fieldRules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    });

    return errors;
  };
};

export const validateForm = (formData: Record<string, any>, validationSchema: ValidationSchema): ValidationResult => {
  const errors: ValidationErrors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach(field => {
    const rules = validationSchema[field];
    const value = formData[field];

    for (let rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
  });

  return { errors, isValid };
};

// Common validation schemas
export const authValidationSchema: ValidationSchema = {
  username: [
    validationRules.required(),
    validationRules.minLength(3, 'Tên đăng nhập tối thiểu 3 ký tự')
  ],
  password: [
    validationRules.required(),
    validationRules.minLength(6, 'Mật khẩu tối thiểu 6 ký tự')
  ]
};

export const teacherValidationSchema: ValidationSchema = {
  name: [
    validationRules.required(),
    validationRules.minLength(2, 'Tên tối thiểu 2 ký tự')
  ],
  email: [
    validationRules.required(),
    validationRules.email()
  ],
  phone: [
    validationRules.required(),
    validationRules.phone()
  ],
  birthDate: [
    validationRules.required(),
    validationRules.date()
  ]
};

export const studentValidationSchema: ValidationSchema = {
  name: [
    validationRules.required(),
    validationRules.minLength(2, 'Tên tối thiểu 2 ký tự')
  ],
  birthDate: [
    validationRules.required(),
    validationRules.date()
  ],
  grade: [
    validationRules.required(),
    validationRules.number()
  ]
};

export const classValidationSchema: ValidationSchema = {
  name: [
    validationRules.required(),
    validationRules.minLength(2, 'Tên lớp tối thiểu 2 ký tự')
  ],
  grade: [
    validationRules.required(),
    validationRules.number()
  ],
  year: [
    validationRules.required(),
    validationRules.number(),
    validationRules.min(2020, 'Năm phải từ 2020 trở lên')
  ],
  maxStudents: [
    validationRules.required(),
    validationRules.positiveNumber(),
    validationRules.min(1, 'Số học sinh tối thiểu là 1')
  ]
};
