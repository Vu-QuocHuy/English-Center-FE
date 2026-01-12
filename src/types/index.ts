// Common Types
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// User Types
export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  dayOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  role: 'admin' | 'staff' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  username?: string;
  // Role-specific IDs
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  // Role-specific data
  student?: Student;
  teacher?: Teacher;
  parent?: Parent;
}

// Teacher Types
export interface Teacher extends BaseEntity {
  // API response structure
  teacher_id: string; // Unique teacher identifier
  name: string;
  email: string;
  gender: 'male' | 'female';
  dayOfBirth: string;
  address: string;
  phone: string;
  avatar?: string | null;
  qualifications: string[];
  specializations: string[];
  description: string;
  introduction?: string;
  salary?: number; // Added salary field
  salaryPerLesson?: number; // Keep for backward compatibility
  workExperience?: number | string | null; // Accept number or string for form compatibility
  typical?: boolean;
  isActive: boolean;
  role: {
    id: number;
    name: string;
  };
  classes: Class[];

  // Legacy fields for backward compatibility
  userId?: User;
  specialization?: string;
  experience?: number;
  rating?: number;
}

// Student Types
export interface Student extends BaseEntity {
  name: string;
  email: string;
  gender?: 'male' | 'female';
  dayOfBirth?: string;
  address?: string;
  phone?: string;
  avatar?: string | null;
  role: {
    id: number;
    name: string;
  };
  classes?: any[];
  // Legacy fields for compatibility
  userId?: User;
  parentId?: string;
  // Some UI expects populated parent object
  parent?: {
    name: string;
    email?: string;
    phone?: string;
  };
  grade?: number;
  dateOfBirth?: string; // Alias for dayOfBirth for compatibility
  level?: string;
  schoolName?: string;
  isActive?: boolean;
}

// Staff Types (Nhân viên)
export interface Staff extends BaseEntity {
  name: string;
  email: string;
  gender: 'male' | 'female';
  dayOfBirth: string;
  address: string;
  phone: string;
  avatar?: string | null;
  publicId?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Parent Types
export interface Parent extends BaseEntity {
  // New API fields - actual API response structure
  name: string;
  email: string;
  gender: 'male' | 'female';
  dayOfBirth: string;
  address: string;
  phone: string;
  avatar?: string | null;
  role: {
    id: number;
    name: string;
  };
  students: Student[]; // Changed from children to students

  // Legacy fields for backward compatibility
  userId?: User;
  canSeeTeacherInfo?: boolean;
  children?: Student[]; // Keep for backward compatibility
  relationship?: string;
  occupation?: string;
  workplace?: string;
  isActive?: boolean;
}

// Class Types
export interface Class extends BaseEntity {
  name: string;
  year: number;
  grade: number;
  section: number; // Changed from string to number to match API
  description?: string;
  feePerLesson: number; // New field from API
  status: 'active' | 'inactive' | 'completed' | 'cancelled' | 'closed'; // Added 'closed' status
  max_student: number; // New field name from API
  room: string; // New required field from API
  schedule: {
    start_date: string;
    end_date: string;
    days_of_week: string[]; // Array of day numbers as strings
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };

  // Legacy fields for backward compatibility
  teacherId?: Teacher;
  students?: Student[];
  level?: string;
  maxStudents?: number;
  teacher?: Teacher;
  startDate?: string;
  endDate?: string;
}

export interface ClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ClassData {
  id: string;
  name: string;
  teacher?: {
    id: string;
    name: string;
  };
  schedule: ClassSchedule[];
  status: string;
  grade?: string;
  section?: string;
  room?: string;
  startDate?: string;
  endDate?: string;
  totalSessions?: number;
  completedSessions?: number;
  attendanceRate?: number;
}

export interface MyClassesData {
  classes: ClassData[];
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
}

export interface Schedule {
  startDate: string;
  endDate: string;
  dayOfWeeks: number[];
  timeSlots: {
    startTime: string;
    endTime: string;
  };
}

export interface ClassItem {
  id: string;
  name: string;
  room?: string;
  status: string;
  grade?: string;
  section?: string;
  schedule: Schedule;
  teacher?: {
    id: string;
    name: string;
  };
}

export interface Lesson {
  date: string;
  className: string;
  time: string;
  room?: string;
  teacher: string;
  type: string;
  classId: string;
  status: string;
  grade?: string;
  section?: string;
}

export interface StudentClass extends BaseEntity {
  classId: Class;
  discountPercent: number;
  status?: string;
}

export interface ScheduleItem {
  day: string;
  time: string;
}

// Payment Types
export interface Payment extends BaseEntity {
  studentId: Student;
  classId: Class;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  discountAmount: number;
  status: 'pending' | 'paid' | 'partial' | 'unpaid';
  dueDate: string;
  paidDate?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T[];
  totalPages: number;
  totalRecords: number;
  currentPage: number;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  status: number;
}

// Form Types
export interface FormErrors {
  [key: string]: string;
}

export interface FormState {
  [key: string]: any;
}

// Form Data Types
export interface ParentFormData {
  name: string;
  email: string;
  password?: string;
  dayOfBirth: string;
  phone: string;
  address: string;
  gender: 'male' | 'female';
  canSeeTeacherInfo: boolean;
}

export interface ParentValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  dayOfBirth?: string;
  phone?: string;
  address?: string;
  gender?: string;
  canSeeTeacherInfo?: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  password: string;
  dayOfBirth: string;
  phone: string;
  address: string;
  gender: 'male' | 'female';
}

export interface StudentValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  dayOfBirth?: string;
  phone?: string;
  address?: string;
  gender?: string;
  classEdits?: any[];
}

export interface ClassEditData {
  classId: string;
  className: string;
  discountPercent: number;
  status: string;
}

export interface ClassFormData {
  name: string;
  grade: number;
  section: number;
  year: number;
  description: string;
  feePerLesson: number;
  status: 'active' | 'inactive' | 'completed' | 'cancelled' | 'closed';
  max_student: number;
  room: string;
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

export interface ClassFormErrors {
  name?: string;
  grade?: string;
  section?: string;
  year?: string;
  description?: string;
  feePerLesson?: string;
  status?: string;
  max_student?: string;
  room?: string;
  start_date?: string;
  end_date?: string;
  days_of_week?: string;
  start_time?: string;
  end_time?: string;
}

export interface TeacherFormData {
  name: string;
  email: string;
  password: string;
  dayOfBirth: string;
  phone: string;
  address: string;
  gender: 'male' | 'female';
  description: string;
  qualifications: string[];
  specializations: string[];
  salaryPerLesson: number;
  isActive: boolean;
}

export interface TeacherValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  dayOfBirth?: string;
  phone?: string;
  address?: string;
  gender?: string;
  description?: string;
  qualifications?: string;
  specializations?: string;
  salaryPerLesson?: string;
  isActive?: string;
}

export interface ParentUpdateData {
  name: string;
  email: string;
  phone: string;
  dayOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  canSeeTeacherInfo: boolean;
}

export interface StudentUpdateData {
  name: string;
  email: string;
  phone: string;
  dayOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  parentId: string | null;
}

export interface StudentUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  dayOfBirth?: string;
  gender?: string;
  address?: string;
  parentId?: string;
}

export interface TeacherUpdateData {
  name: string;
  email: string;
  phone: string;
  dayOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  description: string;
  qualifications: string[];
  specializations: string[];
  salaryPerLesson: number;
  isActive: boolean;
}

export interface TeacherUpdateErrors {
  name?: string;
  email?: string;
  phone?: string;
  dayOfBirth?: string;
  gender?: string;
  address?: string;
  description?: string;
  qualifications?: string;
  specializations?: string;
  salaryPerLesson?: string;
  isActive?: string;
}

// Component Props Types
export interface TableProps<T> {
  data: T[];
  loading: boolean;
  page: number;
  totalPages: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onPageChange?: (event: any, page: number) => void;
}

export interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: any;
}

export interface StatusChipProps {
  label: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  sx?: any;
}

export interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: any;
}

export interface LoadingSpinnerProps {
  loading?: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'text' | 'both';
  sx?: any;
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ComponentType<any>;
  showIcon?: boolean;
  variant?: 'paper' | 'simple';
  sx?: any;
}

// New Common Components Types
export interface FilterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: FilterOption[];
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  disabled?: boolean;
  sx?: any;
  'data-testid'?: string;
}

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  sx?: any;
  'data-testid'?: string;
}

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  sx?: any;
  'data-testid'?: string;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
  sx?: any;
  'data-testid'?: string;
}

// Performance Optimization Types
export interface VirtualListProps<T> {
  data: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  sx?: any;
  'data-testid'?: string;
}

export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalled: boolean;
  isUpdated: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export interface UseServiceWorkerReturn extends ServiceWorkerState {
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  update: () => Promise<void>;
  skipWaiting: () => Promise<void>;
}

// Form Component Types
export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  sx?: any;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

// Hook Types
export interface UseManagementReturn<T> {
  data: T[];
  teachers?: T[];
  loading: boolean;
  loadingTable: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isActiveFilter?: string;
  setIsActiveFilter?: (filter: string) => void;
  fetchData: (pageNum?: number) => Promise<void>;
  fetchTeachers?: (pageNum?: number) => Promise<void>;
  deleteItem: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteTeacher?: (id: string) => Promise<{ success: boolean; message: string }>;
  handlePageChange: (event: any, value: number) => void;
}

export interface UseFormReturn<T> {
  form: T;
  formErrors: FormErrors;
  formLoading: boolean;
  formError: string;
  loading?: boolean;
  error?: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: (data?: T) => void;
  resetForm: () => void;
  handleSubmit: (data?: T, onSuccess?: () => void) => Promise<{ success: boolean; message?: string }>;
}

// API Service Types
export interface ApiServiceConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface ApiRequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Event Types
export interface TableEvent {
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  onPageChange?: (page: number) => void;
}

export interface FormEvent {
  onSubmit?: (data: any) => Promise<{ success: boolean; message?: string }>;
  onCancel?: () => void;
  onReset?: () => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Theme Types
export interface CustomTheme {
  palette: {
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
    };
    background: {
      default: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: number;
  };
  spacing: (factor: number) => number;
  breakpoints: {
    up: (key: string) => string;
    down: (key: string) => string;
  };
}

export interface Advertisement {
  id?: string;
  title: string;
  content?: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  priority?: number;
  createdAt: string;
  linkUrl?: string;
  displayType?: 'popup' | 'banner';
  type?: string;
  position?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

// Home Page Content Management Types
export interface HomeContent {
  id: string;
  section: string; // 'hero', 'about', 'services', 'contact', etc.
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeContentFormData {
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
}

export interface HomeContentFormErrors {
  section?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  order?: string;
  isActive?: string;
}

export interface HomeSection {
  hero: HomeContent[];
  about: HomeContent[];
  services: HomeContent[];
  features: HomeContent[];
  testimonials: HomeContent[];
  contact: HomeContent[];
  footer: HomeContent[];
}

// Menu Item Types for Navigation
export interface MenuItem {
  id: string;
  label?: string;
  sectionId?: string;
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Extended fields used by navigation/pages (ensure presence where code expects)
  title: string;
  slug?: string;
  children?: MenuItem[];
  childrenMenu?: MenuItem[]; // Alias for children, used in transformed data
}

// Navigation types used by header/hooks
export type NavigationMenuItem = MenuItem;

// Feedback types used by home/testimonials and services
export interface Feedback extends BaseEntity {
  name: string;
  description: string;
  imageUrl?: string;
  publicId?: string;
  socialUrl?: string;
  isActive?: boolean;
}

export interface CreateFeedbackRequest {
  name: string;
  description: string;
  imageUrl?: string;
  publicId?: string;
  socialUrl?: string;
}

export interface UpdateFeedbackRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  publicId?: string;
  socialUrl?: string;
}

// Roles & Permissions used by RoleManagement and services
export interface Permission {
  id: number;
  name?: string;
  module: string;
  description: string;
  method: string;
  path: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  isStaff: boolean;
  isSystem: boolean;
}

export interface CreateRoleRequest {
  name: string;
  isStaff: boolean;
  isActive: boolean;
  isSystem: boolean;
  description?: string;
  permissions?: number[];
}

export interface UpdateRoleRequest {
  name?: string;
  isActive?: boolean;
  isStaff?: boolean;
  isSystem?: boolean;
  description?: string;
  permissions?: number[];
}
