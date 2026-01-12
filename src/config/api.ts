export interface ApiEndpoints {
  AUTH: {
    USER_LOGIN: string;
    ADMIN_LOGIN: string;
    REFRESH_TOKEN: string;
    REGISTER: string;
    CHANGE_PASSWORD: string;
    FORGOT_PASSWORD: string;
    VERIFY_CODE: string;
    RESET_PASSWORD: string;
    SEND_REQUEST_PASSWORD: string;
  };
  ADMIN: {
    CREATE: string;
    LOGIN: string;
  };
  USERS: {
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    UPLOAD_AVATAR: string;
    ASSIGN_ROLE: string;
  };
  TEACHERS: {
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    GET_SCHEDULE: (id: string) => string;
    GET_MY_CLASSES: string;
  };
  STUDENTS: {
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    SCHEDULE: (id: string) => string;
    ATTENDANCE: (id: string) => string;
    MONTHLY_CHANGES: string;
    STATISTICS: string;
  };
  CLASSES: {
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    ASSIGN_TEACHER: string;
    UNASSIGN_TEACHER: string;
    GET_AVAILABLE_STUDENTS: (id: string) => string;
    ADD_STUDENTS: (id: string) => string;
    REMOVE_STUDENTS: (id: string) => string;
    UPDATE_STUDENT_STATUS: (id: string) => string;
    BANNER_INFO: (id: string) => string;
    PUBLIC: string;
  };
  PARENTS: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    ADD_CHILD: string;
    REMOVE_CHILD: string;
    PAY_TUITION_FEE: string;
  };
  SESSIONS: {
    GET_TODAY: (id: string) => string;
    UPDATE_ATTENDANCE: (id: string) => string;
    GET_ALL_BY_CLASS: (id: string) => string;
    GET_BY_STUDENT: (id: string) => string;
  };
  PAYMENTS: {
    GET_ALL: string;
    GET_BY_STUDENT: (id: string) => string;
    PAY_STUDENT: (id: string) => string;
    GET_TEACHER_PAYMENTS: string;
    EXPORT_REPORT: string;
    TEACHER_EXPORT_REPORT: string;
    GET_QR_CODE: string;
  };
  SCHEDULES: {
    GET_STUDENT_SCHEDULE: string;
  };
  ANNOUNCEMENTS: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  ADVERTISEMENTS: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  FEEDBACK: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  FILES: {
    UPLOAD: string;
    DELETE: string;
  };
  ROLES: {
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  PERMISSIONS: {
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };

  DASHBOARD: {
    ADMIN: string;
    TEACHER: (id: string) => string;
    PARENT: (id: string) => string;
    STUDENT: (id: string) => string;
  };
  AUDIT?: {
    LOGS: string;
  };
  MENUS: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  TRANSACTIONS: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    REPORT: string;
  };
  TRANSACTION_CATEGORIES: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  REGISTRATIONS: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  // Posts endpoints (like FE-webcntt-main)
  POSTS: {
    GET_LATEST: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  // Events endpoints (like FE-webcntt-main)
  EVENTS: {
    GET_LATEST: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  // Articles endpoints for Layout Builder
  ARTICLES: {
    CREATE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  FOOTER_SETTINGS: {
    GET: string;
    CREATE: string;
    UPDATE: string;
  };
  CRON: {
    UPDATE_CLASS_STATUS: string;
  };
}

export interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: ApiEndpoints;
}

const getBaseUrl = () => {
  const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Nếu set USE_PROXY và đang dev, dùng proxy
  if (useProxy && import.meta.env.DEV) {
    return '/api';
  }

  // Ngược lại, dùng URL trực tiếp
  return apiUrl || '/api';
};

export const API_CONFIG: ApiConfig = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      USER_LOGIN: '/auth/user/login',
      ADMIN_LOGIN: '/auth/admin/login',
      REFRESH_TOKEN: '/auth/refresh',
      REGISTER: '/auth/register',
      CHANGE_PASSWORD: '/auth/change-password',
      FORGOT_PASSWORD: '/auth/forgot-password',
      VERIFY_CODE: '/auth/verify-code',
      RESET_PASSWORD: '/auth/reset-password',
      SEND_REQUEST_PASSWORD: '/auth/send-request-password',
    },
    // Admin endpoints
    ADMIN: {
      CREATE: '/admin',
      LOGIN: '/auth/admin/login',
    },
    // User endpoints (Staff management)
    USERS: {
      GET_ALL: '/user',
      GET_BY_ID: (id: string) => `/user/${id}`,
      CREATE: '/user',
      UPDATE: (id: string) => `/user/${id}`,
      DELETE: (id: string) => `/user/${id}`,
      UPLOAD_AVATAR: '/user/avatar',
      ASSIGN_ROLE: '/user/role',
    },
    // Teacher endpoints
    TEACHERS: {
      GET_ALL: '/teachers',
      GET_BY_ID: (id: string) => `/teachers/${id}`,
      CREATE: '/teachers',
      UPDATE: (id: string) => `/teachers/${id}`,
      DELETE: (id: string) => `/teachers/${id}`,
      GET_SCHEDULE: (id: string) => `/teachers/schedule/${id}`,
      GET_MY_CLASSES: '/teachers/me/classes',
    },
    // Student endpoints
    STUDENTS: {
      GET_ALL: '/students',
      GET_BY_ID: (id: string) => `/students/${id}`,
      CREATE: '/students',
      UPDATE: (id: string) => `/students/${id}`,
      DELETE: (id: string) => `/students/${id}`,
      SCHEDULE: (id: string) => `/students/schedule/${id}`,
      ATTENDANCE: (id: string) => `/students/${id}/attendance`,
      MONTHLY_CHANGES: '/students/monthly-changes',
      STATISTICS: '/students/statistics',
    },
    // Class endpoints
    CLASSES: {
      GET_ALL: '/classes',
      GET_BY_ID: (id: string) => `/classes/${id}`,
      CREATE: '/classes',
      UPDATE: (id: string) => `/classes/${id}`,
      DELETE: (id: string) => `/classes/${id}`,
      ASSIGN_TEACHER: '/classes/assign-teacher',
      UNASSIGN_TEACHER: '/classes/unassign-teacher',
      GET_AVAILABLE_STUDENTS: (id: string) => `/classes/available-students/${id}`,
      ADD_STUDENTS: (id: string) => `/classes/add-students/${id}`,
      REMOVE_STUDENTS: (id: string) => `/classes/remove-students/${id}`,
      UPDATE_STUDENT_STATUS: (id: string) => `/classes/student-status/${id}`,
      BANNER_INFO: (id: string) => `/classes/${id}/banner-info`,
      PUBLIC: '/classes/public',
    },
    PARENTS: {
      CREATE: '/parents',
      GET_ALL: '/parents',
      GET_BY_ID: (id: string) => `/parents/${id}`,
      UPDATE: (id: string) => `/parents/${id}`,
      DELETE: (id: string) => `/parents/${id}`,
      ADD_CHILD: '/parents/add-child',
      REMOVE_CHILD: '/parents/remove-child',
      PAY_TUITION_FEE: '/parents/pay-tuition-fee',
    },
    // Sessions (Attendance)
    SESSIONS: {
      GET_TODAY: (id: string) => `/sessions/today/${id}`,
      UPDATE_ATTENDANCE: (id: string) => `/sessions/${id}`,
      GET_ALL_BY_CLASS: (id: string) => `/sessions/all/${id}`,
      GET_BY_STUDENT: (id: string) => `/sessions/student/${id}`,
    },
    PAYMENTS: {
      GET_ALL: '/payments/all',
      GET_BY_STUDENT: (id: string) => `/payments/students/${id}`,
      PAY_STUDENT: (id: string) => `/payments/pay-student/${id}`,
      GET_TEACHER_PAYMENTS: '/teacher-payments/all',
      EXPORT_REPORT: '/payments/report',
      TEACHER_EXPORT_REPORT: '/teacher-payments/report',
      GET_QR_CODE: '/payments/qrcode',
    },
    SCHEDULES: {
      GET_STUDENT_SCHEDULE: '/schedules/student/me',
    },
    ANNOUNCEMENTS: {
      CREATE: '/announcements',
      GET_ALL: '/announcements',
      GET_BY_ID: (id: string) => `/announcements/${id}`,
      UPDATE: (id: string) => `/announcements/${id}`,
      DELETE: (id: string) => `/announcements/${id}`,
    },
    ADVERTISEMENTS: {
      CREATE: '/advertisements',
      GET_ALL: '/advertisements',
      GET_BY_ID: (id: string) => `/advertisements/${id}`,
      UPDATE: (id: string) => `/advertisements/${id}`,
      DELETE: (id: string) => `/advertisements/${id}`,
    },
    FEEDBACK: {
      CREATE: '/feedback',
      GET_ALL: '/feedback',
      GET_BY_ID: (id: string) => `/feedback/${id}`,
      UPDATE: (id: string) => `/feedback/${id}`,
      DELETE: (id: string) => `/feedback/${id}`,
    },
    FILES: {
      UPLOAD: '/files',
      DELETE: '/files',
    },
    ROLES: {
      GET_ALL: '/roles',
      GET_BY_ID: (id: string) => `/roles/${id}`,
      CREATE: '/roles',
      UPDATE: (id: string) => `/roles/${id}`,
      DELETE: (id: string) => `/roles/${id}`,
    },
    PERMISSIONS: {
      GET_ALL: '/permissions',
      GET_BY_ID: (id: string) => `/permissions/${id}`,
      CREATE: '/permissions',
      UPDATE: (id: string) => `/permissions/${id}`,
      DELETE: (id: string) => `/permissions/${id}`,
    },
    // Homepage Content Management

    DASHBOARD: {
      ADMIN: '/dashboard/admin',
      TEACHER: (id: string) => `/dashboard/teacher/${id}`,
      PARENT: (id: string) => `/dashboard/parent/${id}`,
      STUDENT: (id: string) => `/dashboard/student/${id}`,
    },
    AUDIT: {
      LOGS: '/audit-log',
    },
    // Menu endpoints
    MENUS: {
      CREATE: '/menus',
      GET_ALL: '/menus',
      GET_BY_ID: (id: string) => `/menus/${id}`,
      UPDATE: (id: string) => `/menus/${id}`,
      DELETE: (id: string) => `/menus/${id}`,
    },
    // Transaction endpoints
    TRANSACTIONS: {
      CREATE: '/transactions',
      GET_ALL: '/transactions',
      GET_BY_ID: (id: string) => `/transactions/${id}`,
      UPDATE: (id: string) => `/transactions/${id}`,
      DELETE: (id: string) => `/transactions/${id}`,
      REPORT: '/transactions/report',
    },
    // Transaction Categories endpoints
    TRANSACTION_CATEGORIES: {
      CREATE: '/transactions-category',
      GET_ALL: '/transactions-category',
      GET_BY_ID: (id: string) => `/transactions-category/${id}`,
      UPDATE: (id: string) => `/transactions-category/${id}`,
      DELETE: (id: string) => `/transactions-category/${id}`,
    },
    // Registrations endpoints
    REGISTRATIONS: {
      CREATE: '/registrations',
      GET_ALL: '/registrations',
      GET_BY_ID: (id: string) => `/registrations/${id}`,
      UPDATE: (id: string) => `/registrations/${id}`,
      DELETE: (id: string) => `/registrations/${id}`,
    },
    // Posts endpoints (like FE-webcntt-main)
    POSTS: {
      GET_LATEST: '/posts/latest',
      GET_ALL: '/posts',
      GET_BY_ID: (id: string) => `/posts/${id}`,
      CREATE: '/posts',
      UPDATE: (id: string) => `/posts/${id}`,
      DELETE: (id: string) => `/posts/${id}`,
    },
    // Events endpoints (like FE-webcntt-main)
    EVENTS: {
      GET_LATEST: '/events?page=0',
      GET_ALL: '/events',
      GET_BY_ID: (id: string) => `/events/${id}`,
      CREATE: '/events',
      UPDATE: (id: string) => `/events/${id}`,
      DELETE: (id: string) => `/events/${id}`,
    },
    // Articles endpoints for Layout Builder
    ARTICLES: {
      CREATE: '/articles',
      GET_ALL: '/articles',
      GET_BY_ID: (id: string) => `/articles/${id}`,
      UPDATE: (id: string) => `/articles/${id}`,
      DELETE: (id: string) => `/articles/${id}`,
    },
    // Footer Settings endpoints
    FOOTER_SETTINGS: {
      GET: '/footer-settings',
      CREATE: '/footer-settings',
      UPDATE: '/footer-settings',
    },
    // Cron endpoints
    CRON: {
      UPDATE_CLASS_STATUS: '/cron/update-class-status',
    },
  },
};
