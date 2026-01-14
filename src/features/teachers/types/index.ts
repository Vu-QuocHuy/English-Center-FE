// Teacher types
export interface TeacherData {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  dayOfBirth?: string;
  address?: string;
  password?: string;
  description?: string;
  qualifications?: string[];
  specializations?: string[];
  introduction?: string;
  workExperience?: string;
  salaryPerLesson?: number;
  isActive?: boolean;
  typical?: boolean;
}

export interface TeacherScheduleClass {
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
}

export interface TeacherScheduleResponse {
  statusCode: number;
  message: string;
  data: TeacherScheduleClass[];
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
