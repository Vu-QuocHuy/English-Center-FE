// Parent types
export interface ParentData {
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  dayOfBirth?: string;
  address?: string;
  gender?: 'male' | 'female';
  canSeeTeacherInfo?: boolean;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
