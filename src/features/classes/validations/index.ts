import * as Yup from 'yup';

export interface ClassFormData {
  grade: number;
  section: number;
  name: string;
  feePerLesson: number;
  maxStudents: number;
  room: string;
  description?: string;
  schedule: {
    startDate: string;
    endDate: string;
    dayOfWeeks: number[];
    timeSlots: {
      startTime: string;
      endTime: string;
    };
  };
}

export interface ScheduleData {
  startDate: string;
  endDate: string;
  dayOfWeeks: number[];
  timeSlots: {
    startTime: string;
    endTime: string;
  };
  room: string;
}

export interface ExistingClass {
  id: string;
  name: string;
  schedule?: ScheduleData;
}

export interface ScheduleConflict {
  classId: string;
  className: string;
  conflictType: string;
  message: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Schema validation cho tạo lớp học mới
export const createClassValidationSchema = Yup.object().shape({
  grade: Yup.number()
    .required('Khối là bắt buộc')
    .typeError('Khối phải là số')
    .min(1, 'Khối phải lớn hơn 0')
    .max(12, 'Khối không được quá 12'),

  section: Yup.number()
    .required('Lớp là bắt buộc')
    .typeError('Lớp phải là số')
    .min(1, 'Lớp phải lớn hơn 0')
    .max(50, 'Lớp không được quá 50'),

  name: Yup.string()
    .required('Tên lớp là bắt buộc')
    .min(2, 'Tên lớp phải có ít nhất 2 ký tự')
    .max(50, 'Tên lớp không được quá 50 ký tự'),

  feePerLesson: Yup.number()
    .required('Học phí mỗi buổi là bắt buộc')
    .typeError('Học phí phải là số')
    .min(1, 'Học phí phải lớn hơn 0')
    .max(10000000, 'Học phí không được quá 10 triệu VNĐ'),

  maxStudents: Yup.number()
    .required('Số học sinh tối đa là bắt buộc')
    .typeError('Số học sinh tối đa phải là số')
    .min(1, 'Số học sinh tối đa phải lớn hơn 0')
    .max(100, 'Số học sinh tối đa không được quá 100'),

  room: Yup.string()
    .required('Phòng học là bắt buộc')
    .min(1, 'Phòng học phải có ít nhất 1 ký tự')
    .max(20, 'Phòng học không được quá 20 ký tự'),

  description: Yup.string()
    .max(500, 'Mô tả không được quá 500 ký tự'),

  schedule: Yup.object().shape({
    startDate: Yup.string()
      .required('Ngày bắt đầu là bắt buộc')
      .test('is-valid-date', 'Ngày bắt đầu không hợp lệ', function (value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }),

    endDate: Yup.string()
      .required('Ngày kết thúc là bắt buộc')
      .test('is-valid-date', 'Ngày kết thúc không hợp lệ', function (value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
      .test('is-after-start', 'Ngày kết thúc phải sau ngày bắt đầu', function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) > new Date(startDate);
      }),

    dayOfWeeks: Yup.array()
      .of(Yup.number().min(0).max(6))
      .min(1, 'Phải chọn ít nhất 1 ngày học trong tuần')
      .max(7, 'Không được chọn quá 7 ngày'),

    timeSlots: Yup.object().shape({
      startTime: Yup.string()
        .required('Giờ bắt đầu là bắt buộc')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ bắt đầu không hợp lệ'),
      endTime: Yup.string()
        .required('Giờ kết thúc là bắt buộc')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ kết thúc không hợp lệ')
        .test('is-after-start', 'Giờ kết thúc phải sau giờ bắt đầu', function (value) {
          const { startTime } = this.parent;
          if (!startTime || !value) return true;
          return value > startTime;
        }),
    }),
  }),
});

// Hàm validate lịch học trùng lặp giữa các lớp
// Hiện chưa sử dụng, giữ lại signature tối thiểu để dễ mở rộng sau này
export function validateScheduleConflicts(): ScheduleValidationResult {
  const errors: ValidationErrors = {};

  // Logic kiểm tra trùng lịch giữa lớp mới và các lớp hiện có
  // (giữ nguyên từ file classValidation.ts gốc nếu có thêm logic ở phần dưới)

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

