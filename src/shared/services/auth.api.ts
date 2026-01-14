import axiosInstance from '@shared/utils/axios.customize';
import { API_CONFIG } from '@/config/api';

export interface LoginData { email: string; password: string; }

export const registerAPI = (data: any) => axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
export const registerAdminAPI = (data: any) => axiosInstance.post(API_CONFIG.ENDPOINTS.ADMIN.CREATE, data);

export const loginUserAPI = (data: LoginData) => {
  const formData = new URLSearchParams();
  formData.append('email', data.email);
  formData.append('password', data.password);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.USER_LOGIN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const loginAdminAPI = (data: LoginData) => {
  const formData = new URLSearchParams();
  formData.append('email', data.email);
  formData.append('password', data.password);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const changePasswordAPI = (oldPassword: string, newPassword: string, confirmPassword: string) => {
  const formData = new URLSearchParams();
  formData.append('oldPassword', oldPassword);
  formData.append('newPassword', newPassword);
  formData.append('confirmPassword', confirmPassword);
  return axiosInstance.patch(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const forgotPasswordAPI = (email: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const verifyCodeAPI = (code: string, email: string) => {
  const formData = new URLSearchParams();
  formData.append('code', code);
  formData.append('email', email);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const resetPasswordAPI = (email: string, code: string, newPassword: string, confirmPassword: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('newPassword', newPassword);
  formData.append('confirmPassword', confirmPassword);
  return axiosInstance.patch(`${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}?code=${code}`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const refreshTokenAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN);
export const sendRequestPasswordAPI = (email: string) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.SEND_REQUEST_PASSWORD, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};
