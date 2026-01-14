// Menu types
export interface MenuData {
  title: string;
  slug?: string;
  order?: number;
  isActive?: boolean;
  parentId?: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
