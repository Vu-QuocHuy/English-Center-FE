// Student types
export interface StudentData {
  name: string;
  email?: string;
  password?: string;
  gender?: 'male' | 'female';
  dayOfBirth?: string;
  address?: string;
  phone?: string;
  parentId?: string;
}

export interface StudentScheduleClass {
  discountPercent: number;
  class: {
    id: string;
    name: string;
    grade: number;
    section: number;
    schedule: {
      start_date: string;
      end_date: string;
      days_of_week: string[];
      time_slots: {
        start_time: string;
        end_time: string;
      };
    };
  };
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
