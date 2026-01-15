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
export { useLazySearch } from './common/useLazySearch';

// Payment socket hook
export { usePaymentSocket } from './usePaymentSocket';
export type { PaymentSuccessData, PaymentFailureData } from './usePaymentSocket';