// Feedback/Testimonials types
export interface CreateFeedbackRequest {
  name: string;
  description: string;
  imageUrl?: string;
  publicId?: string;
  socialUrl?: string;
}

export interface UpdateFeedbackRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  publicId?: string;
  socialUrl?: string;
}

export interface ApiParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}
