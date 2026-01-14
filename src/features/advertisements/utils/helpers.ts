// Helper functions for Advertisement components

export const formatAdvertisementDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export const getTypeText = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'banner': 'Banner',
    'popup': 'Popup',
    'slider': 'Slider',
    'sidebar': 'Sidebar',
    'notification': 'Thông báo'
  };
  return typeMap[type] || type;
};

export const getTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default' => {
  const typeColors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
    'banner': 'primary',
    'popup': 'secondary',
    'slider': 'success',
    'sidebar': 'warning',
    'notification': 'error'
  };
  return typeColors[type] || 'default';
};

export const getPositionText = (position: string): string => {
  const positionMap: { [key: string]: string } = {
    'top': 'Đầu trang',
    'bottom': 'Cuối trang',
    'left': 'Bên trái',
    'right': 'Bên phải',
    'center': 'Giữa trang',
    'homepage': 'Trang chủ',
    'sidebar': 'Thanh bên'
  };
  return positionMap[position] || position;
};

export const getStatusColor = (isActive: boolean): 'success' | 'error' => {
  return isActive ? 'success' : 'error';
};

export const getStatusText = (isActive: boolean): string => {
  return isActive ? 'Đang hiển thị' : 'Đã ẩn';
};
