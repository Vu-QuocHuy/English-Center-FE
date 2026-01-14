// Shared module exports
// This is the main entry point for shared code used across multiple features

export * from './components';
export * from './hooks';
export * from './services';
export * from './utils';
// Export types explicitly to avoid conflicts with utils (ValidationRule, ValidationSchema)
// Note: ValidationRule and ValidationSchema are exported from utils, not from types
export type {
  BaseEntity,
  User,
  Teacher,
  Student,
  Parent,
  Staff,
  Role,
  Permission,
  Class,
  Advertisement,
  Feedback,
  Payment,
  ApiResponse,
  ApiSuccessResponse,
  ApiError,
  FormErrors,
  FormState,
  // Component Props
  SearchInputProps,
  StatusChipProps,
  ActionButtonsProps,
  LoadingSpinnerProps,
  EmptyStateProps,
  FilterOption,
  FilterSelectProps,
  DatePickerProps,
  FileUploadProps,
  ModalProps,
  VirtualListProps,
  // Form Data Types
  ParentFormData,
  StudentFormData,
  TeacherFormData,
  ClassFormData,
  // Update Types
  ParentUpdateData,
  StudentUpdateData,
  TeacherUpdateData,
  // Validation Errors
  ParentValidationErrors,
  StudentValidationErrors,
  TeacherValidationErrors,
  ClassFormErrors,
  // Hook Types
  UseManagementReturn,
  UseFormReturn,
  // Other types
  MenuItem,
  NavigationMenuItem,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
} from './types';
