// Environment Variables Type Definitions
interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_PROXY: string;
  readonly VITE_API_TIMEOUT: string;

  // App Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;

  // Environment
  readonly VITE_NODE_ENV: string;

  // Features
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;

  // UI Configuration
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_ITEMS_PER_PAGE: string;

  // File Upload Configuration
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_IMAGE_TYPES: string;

  // Session Configuration
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_REFRESH_TOKEN_INTERVAL: string;

  // Development Tools
  readonly VITE_SHOW_DEBUG_INFO: string;

  // Optional Services
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_PUSHER_APP_KEY?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Helper functions for environment variables
export const getEnvVar = (key: keyof ImportMetaEnv, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

export const getBooleanEnvVar = (key: keyof ImportMetaEnv, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const getNumberEnvVar = (key: keyof ImportMetaEnv, defaultValue?: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number value for environment variable ${key}: ${value}`);
  }
  return parsed;
};

// Environment validation
export const validateEnvironment = () => {
  const requiredVars: (keyof ImportMetaEnv)[] = [
    'VITE_API_BASE_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};
