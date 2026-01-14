import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '@config/api';

// Tạo custom event để thông báo logout
// const createLogoutEvent = (): void => {
//   const event = new CustomEvent('auth:logout', {
//     detail: { reason: 'token_expired' }
//   });
//   window.dispatchEvent(event);
// };

interface RefreshTokenResponse {
  statusCode: number;
  message: string;
  data?: {
    access_token: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: {
        id: number;
        name: string;
      };
      address: string;
      gender: string;
      dayOfBirth: string;
      phone: string;
    };
  };
  access_token?: string;
}

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}



const instance: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT || 60000),
    // ✅ Cần withCredentials để gửi cookie
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Biến để tránh gọi refresh token nhiều lần
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null): void => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });

    failedQueue = [];
};



// Add a request interceptor
instance.interceptors.request.use(
    (config: any) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData requests
        // Let the browser set it automatically with boundary
        if (config.data instanceof FormData) {
            if (config.headers) {
                delete config.headers['Content-Type'];
            }
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response) {
            // Xử lý lỗi từ server
            if (error.response.status === 401 && !originalRequest._retry) {
                // ✅ Chỉ log khi cần debug
                // 401 Unauthorized - attempting refresh token

                if (isRefreshing) {
                    // Nếu đang refresh, thêm request vào queue
                    return new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return instance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                // ✅ Backend sử dụng httpOnly cookies, không cần kiểm tra localStorage

                // ✅ Không cần kiểm tra refresh token trong localStorage
                // Backend sẽ xử lý cookie tự động

                try {
                    // ✅ Sử dụng instance thay vì axios để đảm bảo baseURL và withCredentials được cấu hình đúng
                    const response = await instance.get<RefreshTokenResponse>(
                        API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
                        {
                            timeout: 10000
                        }
                    );

                    const newAccessToken = response?.data?.data?.access_token || response?.data?.access_token;

                    if (newAccessToken) {
                        localStorage.setItem('access_token', newAccessToken);

                        // Update user data if provided
                        if (response?.data?.data?.user) {
                            const userData = response.data.data.user;
                            // Normalize role field
                            if (userData.role && typeof userData.role === 'object' && 'id' in userData.role) {
                                const roleId = (userData.role as any).id;
                                (userData as any).role = roleId === 1 ? 'admin' :
                                              roleId === 2 ? 'teacher' :
                                              roleId === 3 ? 'parent' :
                                              roleId === 4 ? 'student' : 'unknown';
                            }
                            localStorage.setItem('userData', JSON.stringify(userData));
                        }

                        // Dispatch event to update AuthContext
                        const authSuccessEvent = new CustomEvent('auth:refresh_success', {
                            detail: { accessToken: newAccessToken }
                        });
                        window.dispatchEvent(authSuccessEvent);

                        // Update request header
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        // Process queue
                        processQueue(null, newAccessToken);

                        // Retry original request
                        return instance(originalRequest);
                    } else {
                        throw new Error('Invalid refresh token response');
                    }
                } catch (refreshError: any) {
                    processQueue(refreshError, null);
                    // Clear credentials and redirect to login on refresh failure
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('userData');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            // Trả về error object với response data để dễ xử lý
        return Promise.reject({
          response: {
            status: error.response.status,
            data: error.response.data
          }
        });
        } else {
            // Network errors (socket hang up, timeout, etc.)
            // Network error

            // Retry logic for network errors
            if (!originalRequest._networkRetry &&
                (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.message.includes('timeout'))) {
                originalRequest._networkRetry = true;
                // ✅ Retrying network request

                // Wait a bit before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return instance(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
