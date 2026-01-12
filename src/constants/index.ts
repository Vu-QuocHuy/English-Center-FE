// App Constants
export const APP_NAME = 'English Center Management';
export const VERSION = '1.0.0';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: '/users',
    DELETE: '/users',
  },
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses',
    UPDATE: '/courses',
    DELETE: '/courses',
  },
  CLASSES: {
    LIST: '/classes',
    CREATE: '/classes',
    UPDATE: '/classes',
    DELETE: '/classes',
  },
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
} as const;

// Role Labels
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.STAFF]: 'Nhân viên',
  [USER_ROLES.TEACHER]: 'Giáo viên',
  [USER_ROLES.STUDENT]: 'Học sinh',
  [USER_ROLES.PARENT]: 'Phụ huynh',
} as const;

// App Info
export const APP_DESCRIPTION = 'Hệ thống quản lý trung tâm tiếng Anh';

// User Role Type
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    COURSES: '/admin/courses',
    CLASSES: '/admin/classes',
    REPORTS: '/admin/reports',
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    CLASSES: '/teacher/classes',
    STUDENTS: '/teacher/students',
    ASSIGNMENTS: '/teacher/assignments',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    ASSIGNMENTS: '/student/assignments',
    GRADES: '/student/grades',
  },
  PARENT: {
    DASHBOARD: '/parent/dashboard',
    CHILDREN: '/parent/children',
    PROGRESS: '/parent/progress',
    PAYMENTS: '/parent/payments',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// Advertisement
export const ADVERTISEMENT = {
  BANNER_DURATION: 5000, // 5 seconds
  MAX_BANNERS: 5,
  POSITION: {
    TOP: 'top',
    BOTTOM: 'bottom',
    SIDEBAR: 'sidebar',
  },
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PHONE_PATTERN: /^[0-9]{10,11}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
