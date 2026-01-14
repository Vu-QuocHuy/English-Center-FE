// Article types
export interface ArticleData {
  title: string;
  content: string;
  menuId?: string;
  order?: number;
  isActive?: boolean;
  file?: string;
  publicId?: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  filters?: {
    menuId?: string;
  };
  [key: string]: any;
}
