export function formatDateDDMMYYYY(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function getTeacherStatusColor(isActive: boolean): 'success' | 'default' {
  return isActive ? 'success' : 'default';
}

export function getTeacherStatusLabel(isActive: boolean): string {
  return isActive ? 'Đang hoạt động' : 'Ngừng hoạt động';
}
