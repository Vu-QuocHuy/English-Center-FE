export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),

  // Environment
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'English Center Management',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Hệ thống quản lý trung tâm tiếng Anh',

  // Features
  features: {
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  },

  // UI Configuration
  ui: {
    defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
    defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'vi',
    itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '10'),
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedImageTypes: import.meta.env.VITE_ALLOWED_IMAGE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
  },

  // Session Configuration
  session: {
    timeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'), // 1 hour
    refreshTokenInterval: parseInt(import.meta.env.VITE_REFRESH_TOKEN_INTERVAL || '300000'), // 5 minutes
  },

  // Development Tools
  dev: {
    showDebugInfo: import.meta.env.VITE_SHOW_DEBUG_INFO === 'true',
  },
} as const;

// Validate required environment variables
export const validateConfig = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
      console.warn(`Missing required environment variable: ${varName}`);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Log config in development
  if (config.isDevelopment) {
    console.group('🔧 Environment Configuration');
    console.log('Environment:', config.environment);
    console.log('API URL:', config.apiUrl);
    console.log('App Name:', config.appName);
    console.log('Features:', config.features);
    console.groupEnd();
  }
};

// Export individual configs for convenience
export const { apiUrl, environment, isDevelopment, isProduction } = config;