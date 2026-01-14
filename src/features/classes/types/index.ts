// Class types
export interface ClassData {
  name: string;
  grade?: number;
  section?: number;
  year?: number;
  description?: string;
  feePerLesson?: number;
  status?: 'active' | 'inactive' | 'completed' | 'cancelled' | 'closed' | 'upcoming';
  max_student?: number;
  room?: string;
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
