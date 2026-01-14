// Helper functions for Class components

export const formatClassDate = (dateString?: string): string => {
  if (!dateString) return 'Không xác định';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export const formatClassCurrency = (num?: number): string => {
  return (num ?? 0).toLocaleString('vi-VN') + ' VND';
};

export const getClassStatusText = (status?: string): string => {
  const statusMap: { [key: string]: string } = {
    'active': 'Đang hoạt động',
    'inactive': 'Không hoạt động',
    'upcoming': 'Sắp mở',
    'pending': 'Chờ khai giảng',
    'completed': 'Đã kết thúc',
    'closed': 'Đã đóng',
    'cancelled': 'Đã hủy',
  };
  return status ? (statusMap[status] || status) : 'Không xác định';
};

export const getClassStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'active': '#2e7d32',      // green
    'upcoming': '#f9a825',    // yellow
    'closed': '#c62828',      // red
    'completed': '#c62828',    // red
  };
  return statusColors[status] || 'inherit';
};

export const getDayLabel = (d: string): string => {
  const map: Record<string, string> = {
    '0': 'CN',
    '1': 'T2',
    '2': 'T3',
    '3': 'T4',
    '4': 'T5',
    '5': 'T6',
    '6': 'T7'
  };
  return map[d] || d;
};

export const getDaysOfWeekText = (days: string[]): string => {
  return days.map(day => getDayLabel(day)).join(', ');
};
