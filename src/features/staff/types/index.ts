// Staff types
export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
  dayOfBirth: string; // Format: MM/DD/YYYY
  address: string;
  phone: string;
  roleId?: string;
}

export interface UpdateStaffData extends Partial<CreateStaffData> {
  password?: string;
}

export interface StaffFilters {
  name?: string;
  email?: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
