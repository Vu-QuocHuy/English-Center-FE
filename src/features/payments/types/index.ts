// Payment types
export interface TeacherPayment {
  id: string;
  teacherId?: { id?: string; userId?: { id?: string; name?: string }; name?: string };
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    salaryPerLesson?: number;
  };
  month?: number;
  year?: number;
  salaryPerLesson?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
  classes?: Array<{ classId?: { name: string }; totalLessons?: number }>;
}

export interface StudentPayment {
  id: string;
  month: number;
  year: number;
  totalLessons: number;
  paidAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  student: { id: string; name: string; email?: string; phone?: string };
  class: { id: string; name: string };
}

export interface PaymentData {
  amount: number;
  method?: string;
  note?: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
