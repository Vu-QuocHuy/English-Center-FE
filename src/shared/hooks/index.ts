// Shared hooks
// These are reusable hooks used across multiple features

export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { usePrevious } from './usePrevious';
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery';
export { default as useSnackbar } from './useSnackbar';
export { useForm } from './useForm';
export { useApi } from './useApi';

// Common hooks
export { useDebounce as useDebounceCommon } from './common/useDebounce';
export { useLazySearch } from './common/useLazySearch';
