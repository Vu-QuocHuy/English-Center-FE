// Registration types
export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  address: string;
  note: string;
  processed: boolean;
  classId: string;
}

export interface RegistrationFilters {
  name?: string;
  email?: string;
  processed?: boolean;
  class?: string;
}

export interface RegistrationParams {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: RegistrationFilters;
}
