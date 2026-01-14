// Components
export { default as TeacherForm } from './components/TeacherForm';
export { default as TeacherTable } from './components/TeacherTable';
export { default as TeacherFilters } from './components/TeacherFilters';
export { default as TeacherViewDialog } from './components/TeacherViewDialog';
export { default as TeacherSalaryTable } from './components/TeacherSalaryTable';

// Teacher-specific modals
export { default as ClassDetailModal } from './components/ClassDetailModal';
export { default as AttendanceModal } from './components/AttendanceModal';
export { default as AttendanceHistoryModal } from './components/AttendanceHistoryModal';

// Services
export * from './services/teachers.api';

// Hooks
export * from './hooks/useTeacherManagement';
export * from './hooks/useTeacherForm';

// Utils
export * from './utils/helpers';

// Types
export * from './types';
