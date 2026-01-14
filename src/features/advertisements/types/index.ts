// Advertisement types
export interface AdvertisementData {
  title: string;
  description: string;
  priority: number;
  imageUrl: string;
  publicId: string;
  classId: string;
  type: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
