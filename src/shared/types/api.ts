// Type definitions for API parameters and responses
// Moved from services/api.ts

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  password: string;
}

export interface ClassData {
  name: string;
  grade?: number;
  section?: number;
  year?: number;
  description?: string;
  feePerLesson?: number;
  status?: 'active' | 'inactive';
  max_student?: number;
  room?: string;
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
}

export interface StudentData {
  name: string;
  email?: string;
  password?: string;
  gender?: 'male' | 'female';
  dayOfBirth?: string;
  address?: string;
  phone?: string;
}

export interface TeacherData {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  dayOfBirth?: string;
  address?: string;
  password?: string;
  description?: string;
  qualifications?: string[];
  specializations?: string[];
  introduction?: string;
  workExperience?: string;
  salaryPerLesson?: number;
  isActive?: boolean;
  typical?: boolean;
}

export interface TeacherScheduleClass {
  id: string;
  name: string;
  grade: number;
  section: number;
  schedule: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
}

export interface TeacherScheduleResponse {
  statusCode: number;
  message: string;
  data: TeacherScheduleClass[];
}

export interface StudentScheduleClass {
  discountPercent: number;
  class: {
    id: string;
    name: string;
    grade: number;
    section: number;
    schedule: {
      start_date: string;
      end_date: string;
      days_of_week: string[];
      time_slots: {
        start_time: string;
        end_time: string;
      };
    };
  };
}

export interface StudentScheduleResponse {
  statusCode: number;
  message: string;
  data: StudentScheduleClass[];
}

export interface ParentData {
  name: string;
  email?: string;
  password?: string;
  gender?: 'male' | 'female';
  dayOfBirth?: string;
  address?: string;
  phone?: string;
}

export interface AttendanceData {
  studentId: string | number;
  status: 'present' | 'absent' | 'late' | 'excused';
  isModified?: boolean;
  note?: string;
}

export interface PaymentData {
  amount: number;
  method?: string;
  note?: string;
}

export interface AnnouncementData {
  title: string;
  content: string;
  image?: File;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: any;
}

export interface MenuData {
  title: string;
  slug?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

export interface TransactionData {
  amount: number;
  category_id?: string;
  description: string;
}

export interface TransactionCategoryData {
  type: 'revenue' | 'expense';
  name: string;
}

export interface FileUploadResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    public_id: string;
  };
}

export interface AdvertisementData {
  title: string;
  description: string;
  priority: number;
  imageUrl: string;
  publicId: string;
  classId: string;
  type: string;
}

export interface AdvertisementResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    priority: number;
    imageUrl: string;
    publicId: string;
    classId: string;
    isActive: boolean;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AdvertisementsListResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: AdvertisementResponse['data'][];
  };
}

export interface AuditLogItem {
  id: string;
  entityName: string;
  entityId: string | null;
  path: string;
  method: string;
  description: string; // HTML content from backend
  action?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  changedFields?: string[];
  newValue?: unknown;
  oldValue?: unknown;
}

export interface AuditLogResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: AuditLogItem[];
  };
}

export interface ArticleData {
  title: string;
  content: string;
  menuId: string;
  order?: number;
  isActive?: boolean;
  file?: string;
  publicId?: string;
}

export interface ArticleResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    title: string;
    content: string;
    menuId: string;
    file?: string;
    publicId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ArticlesListResponse {
  statusCode: number;
  message: string;
  data: {
    meta: {
      limit: number;
      page: number;
      totalPages: number;
      totalItems: number;
    };
    result: ArticleResponse['data'][];
  };
}
