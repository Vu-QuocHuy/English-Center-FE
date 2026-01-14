interface Student {
  id: string;
  userId?: {
    name?: string;
  };
  name?: string;
}

interface Parent {
  id: string;
  children?: Student[];
  userId?: {
    name?: string;
  };
}

// Helper function to safely render text content
export const renderText = (text: any): string => {
  if (text === null || text === undefined) return '-';
  if (typeof text === 'object') return '-';
  return String(text);
};

// Helper function to format gender display
export const getGenderLabel = (gender: 'male' | 'female' | string): string => {
  return gender === 'male' ? 'Nam' : 'Nữ';
};

// Helper function to format teacher info permission
export const getTeacherInfoLabel = (canSeeTeacherInfo: boolean): string => {
  return canSeeTeacherInfo ? 'Có thể xem' : 'Không thể xem';
};

// Helper function to get teacher info color
export const getTeacherInfoColor = (canSeeTeacherInfo: boolean): 'success' | 'error' => {
  return canSeeTeacherInfo ? 'success' : 'error';
};

// Helper function to get student names
export const getStudentNames = (studentIds: Student[]): string => {
  if (!studentIds || studentIds.length === 0) return 'Chưa có con';

  return studentIds.map(student =>
    student.userId?.name || student.name || 'Không xác định'
  ).join(', ');
};

// Helper function to format child count
export const formatChildCount = (children: Student[]): string => {
  if (!children || children.length === 0) return '0 con';
  return `${children.length} con`;
};

// Helper function to format date display
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return dateString;
  }
};

// Helper function to check if parent has children
export const hasChildren = (parent: Parent): boolean => {
  return !!(parent && parent.children && parent.children.length > 0);
};

// Helper function to get parent status
export const getParentStatus = (parent: Parent): string => {
  if (!parent) return 'Không xác định';

  if (hasChildren(parent)) {
    return 'Có con';
  }
  return 'Chưa có con';
};

// Helper function to get parent status color
export const getParentStatusColor = (parent: Parent): 'success' | 'warning' | 'default' => {
  if (!parent) return 'default';

  if (hasChildren(parent)) {
    return 'success';
  }
  return 'warning';
};
