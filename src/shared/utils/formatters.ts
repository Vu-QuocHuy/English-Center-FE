// Centralized formatting utilities for English Center Application

import { formatCurrency as baseCurrency } from './helpers';

// Enhanced formatters with consistent Vietnamese locale
export const formatters = {
  // Currency formatting
  currency: (amount: number | null | undefined): string => {
    return baseCurrency(amount);
  },

  // Date formatting with Vietnamese locale
  date: (dateString: string | Date | null | undefined): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  },

  // Time formatting (HH:mm)
  time: (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  },

  // Day of week formatting
  dayOfWeek: (dayNumber: number): string => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayNumber] || `Thứ ${dayNumber}`;
  },

  // Status formatting with consistent colors
  status: {
    getColor: (status: string): 'success' | 'warning' | 'error' | 'default' => {
      switch (status.toLowerCase()) {
        case 'active':
        case 'đang hoạt động':
        case 'paid':
        case 'đã thanh toán':
        case 'present':
        case 'có mặt':
          return 'success';
        case 'pending':
        case 'chờ thanh toán':
        case 'chờ':
        case 'late':
        case 'đi muộn':
          return 'warning';
        case 'inactive':
        case 'không hoạt động':
        case 'overdue':
        case 'quá hạn':
        case 'absent':
        case 'vắng mặt':
          return 'error';
        default:
          return 'default';
      }
    },

    getLabel: (status: string): string => {
      const statusMap: Record<string, string> = {
        'active': 'Đang hoạt động',
        'inactive': 'Không hoạt động',
        'pending': 'Chờ xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'paid': 'Đã thanh toán',
        'unpaid': 'Chưa thanh toán',
        'overdue': 'Quá hạn',
        'present': 'Có mặt',
        'absent': 'Vắng mặt',
        'late': 'Đi muộn',
        'excused': 'Có phép'
      };
      return statusMap[status.toLowerCase()] || status;
    }
  },

  // Schedule formatting
  schedule: (schedule: Array<{ dayOfWeek: number; startTime: string; endTime: string }>): string => {
    if (!schedule || schedule.length === 0) return 'Chưa có lịch học';

    return schedule.map(s =>
      `${formatters.dayOfWeek(s.dayOfWeek)} ${formatters.time(s.startTime)}-${formatters.time(s.endTime)}`
    ).join(', ');
  },

  // Progress percentage
  progress: (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  // Student count
  studentCount: (count: number): string => {
    if (count === 0) return 'Chưa có học sinh';
    if (count === 1) return '1 học sinh';
    return `${count} học sinh`;
  },

  // Class name
  className: (name: string, grade?: string, section?: string): string => {
    let result = name;
    if (grade && section) {
      result += ` (${grade}.${section})`;
    }
    return result;
  }
};

export default formatters;
