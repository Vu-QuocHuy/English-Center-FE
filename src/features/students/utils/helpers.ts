interface ClassId {
  name?: string;
  grade?: string | number;
  section?: string | number;
}

interface StudentClass {
  classId?: ClassId;
  class?: {
    id: string;
    name: string;
    grade: number;
    section: number;
  };
  status?: string;
  discountPercent?: number;
}

// Helper function to safely render text content
export const renderText = (text: any): string => {
  if (text === null || text === undefined) return '-';
  if (typeof text === 'object') return '-';
  return String(text);
};

// Helper function to format parent display
export const renderParent = (studentId: string, parentDetails: Record<string, string>): string => {
  if (!studentId) return '-';
  // Lấy thông tin phụ huynh từ map đã được tạo
  const parentName = parentDetails[studentId];
  if (parentName) {
    return parentName;
  }
  return 'Không có phụ huynh';
};

// Helper function to format class display
export const renderClasses = (classes: StudentClass[]): string => {
  if (!classes || classes.length === 0) return 'Chưa đăng ký lớp';

  return classes.map(cls => {
    // Lấy tên lớp từ class object (API response mới)
    const className = cls.class?.name || cls.classId?.name || `Lớp ${cls.class?.grade || cls.classId?.grade || ''}.${cls.class?.section || cls.classId?.section || ''}`;
    const status = cls.status === 'active' ? 'Đang học' : 'Đã nghỉ';
    const discount = cls.discountPercent ? ` (Giảm ${cls.discountPercent}%)` : '';
    return `${className}${discount} - ${status}`;
  }).join('\n');
};

// Helper function to format gender display
export const formatGender = (gender: 'male' | 'female' | string): string => {
  return gender === 'male' ? 'Nam' : 'Nữ';
};

// Helper function to get class status color
export const getClassStatusColor = (status: string): 'success' | 'warning' => {
  return status === 'active' ? 'success' : 'warning';
};

// Helper function to get class status label
export const getClassStatusLabel = (status: string): string => {
  return status === 'active' ? 'Đang học' : 'Đã nghỉ';
};

// Helper to derive student-class status (for parent views)
export const getStudentStatus = (classStatus: string | undefined, isActive: boolean) => {
  if (classStatus === 'upcoming') {
    return {
      label: 'Sắp tới',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      icon: 'time-outline' as const,
    };
  }
  if (!isActive) {
    return {
      label: 'Đã nghỉ',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      icon: 'close-circle' as const,
    };
  }
  if (classStatus === 'closed' || classStatus === 'completed') {
    return {
      label: 'Hoàn thành',
      color: '#10B981',
      bgColor: '#ECFDF5',
      icon: 'checkmark-done-circle' as const,
    };
  }
  // Default: classStatus === 'active' && isActive
  return {
    label: 'Đang học',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    icon: 'school' as const,
  };
};
