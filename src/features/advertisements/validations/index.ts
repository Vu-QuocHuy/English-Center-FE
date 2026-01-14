export interface AdvertisementFormData {
  title: string;
  shortDescription: string;
  content: string;
  priority: string | number;
  imageName?: string;
  image?: string;
}

export interface AdvertisementValidationErrors {
  title?: string;
  shortDescription?: string;
  content?: string;
  priority?: string;
  image?: string;
}

// Validate title
export function validateTitle(title: string): string {
  if (!title || title.trim() === '') return 'Tiêu đề không được để trống';
  return '';
}

// Validate short description
export function validateShortDescription(desc: string): string {
  if (!desc || desc.trim() === '') return 'Mô tả ngắn không được để trống';
  return '';
}

// Validate content
export function validateContent(content: string): string {
  if (!content || content.trim() === '') return 'Nội dung quảng cáo không được để trống';
  return '';
}

// Validate priority (>0)
export function validatePriority(priority: string | number): string {
  if (priority === undefined || priority === null || priority === '') return 'Độ ưu tiên không được để trống';
  if (isNaN(Number(priority)) || Number(priority) <= 0) return 'Độ ưu tiên phải lớn hơn 0';
  return '';
}

// Validate image type (PNG, JPG, JPEG, WEBP)
export function validateImageType(fileName: string): string {
  if (!fileName) return 'Ảnh không được để trống';
  const allowed = ['png', 'jpg', 'jpeg', 'webp'];
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !allowed.includes(ext)) return 'Ảnh phải là PNG, JPG, JPEG hoặc WEBP';
  return '';
}

// Validate toàn bộ form quảng cáo
export function validateAdvertisement(form: AdvertisementFormData): AdvertisementValidationErrors {
  const errors: AdvertisementValidationErrors = {};
  const titleError = validateTitle(form.title);
  if (titleError) errors.title = titleError;
  const shortDescError = validateShortDescription(form.shortDescription);
  if (shortDescError) errors.shortDescription = shortDescError;
  const contentError = validateContent(form.content);
  if (contentError) errors.content = contentError;
  const priorityError = validatePriority(form.priority);
  if (priorityError) errors.priority = priorityError;
  const imageTypeError = validateImageType(form.imageName || form.image || '');
  if (imageTypeError) errors.image = imageTypeError;
  return errors;
}

