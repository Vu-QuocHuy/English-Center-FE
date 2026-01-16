import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '@config/api';
import { setGlobalForbidden, setGlobalChecking } from '@contexts/ForbiddenContext';


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
        // Khi API GET thành công, clear checking state để cho phép render content
        // (backup, nếu chưa clear ở request interceptor)
        if (typeof window !== 'undefined') {
            const requestMethod = response.config?.method?.toUpperCase();
            
            if (requestMethod === 'GET') {
                setGlobalChecking(false);
            }
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response) {
            // Xử lý lỗi từ server
            if (error.response.status === 401 && !originalRequest._retry) {

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
                    // Get user role before clearing localStorage
                    let loginPath = '/login'; // Default to parent/student login
                    try {
                        const userDataStr = localStorage.getItem('userData');
                        if (userDataStr) {
                            const userData = JSON.parse(userDataStr);
                            const role = userData.role;
                            
                            // Determine login path based on role
                            // admin (role id 1) or teacher (role id 2) -> staff login
                            // parent (role id 3) or student (role id 4) -> regular login
                            if (role === 'admin' || role === 'teacher' || role === 'staff') {
                                loginPath = '/staff/login';
                            } else if (role === 'parent' || role === 'student') {
                                loginPath = '/login';
                            }
                            // If role is an object with id, check the id
                            else if (role && typeof role === 'object' && 'id' in role) {
                                const roleId = (role as any).id;
                                if (roleId === 1 || roleId === 2) {
                                    loginPath = '/staff/login';
                                } else if (roleId === 3 || roleId === 4) {
                                    loginPath = '/login';
                                }
                            }
                        }
                    } catch (e) {
                        // If parsing fails, use default login path
                        console.error('Error parsing userData:', e);
                    }
                    
                    // Clear credentials and redirect to appropriate login on refresh failure
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('userData');
                    if (typeof window !== 'undefined') {
                        window.location.href = loginPath;
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            
            if (error.response.status === 403) {
                const requestMethod = originalRequest?.method?.toUpperCase();
                const requestUrl = originalRequest?.url || '';
                
                // Helper function để xác định API có phải là secondary (không quan trọng) không
                const isSecondaryAPI = (url: string): boolean => {
                    // Loại bỏ query string để kiểm tra path
                    const pathWithoutQuery = url.split('?')[0];
                    
                    // Các API phụ (secondary) - không set forbidden state, để component tự xử lý
                    const secondaryPatterns = [
                        /\/.*\/salary/,                    // API lương
                        /\/.*\/history/,                   // API lịch sử
                        /\/.*\/export/,                    // API export
                        /\/.*\/download/,                  // API download
                        /\/.*\/detail/,                    // API chi tiết
                        /\/.*\/banners/,                   // API banners (secondary)
                        /\/.*\/popup/,                     // API popup (secondary)
                        /\/.*\/qrcode/,                    // API QR code
                        /\/.*\/report/,                    // API report
                        /\/.*\/total$/,                    // API tổng (statistics)
                        /\/[a-f0-9-]{36,}$/,              // Detail API với UUID ở cuối
                        /\/\d+$/,                          // Detail API với số ở cuối
                        /\/.*\/pay-student/,              // API thanh toán học sinh (action)
                        /\/.*\/pay-teacher/,              // API thanh toán giáo viên (action)
                    ];
                    
                    // Nếu match với pattern phụ → là secondary
                    return secondaryPatterns.some(pattern => pattern.test(pathWithoutQuery));
                };
                
                // Với GET request: nếu không phải secondary API → set forbidden state
                // Với POST/PATCH/DELETE: reject để component xử lý bằng snackbar
                if (requestMethod === 'GET' && typeof window !== 'undefined') {
                    const isSecondary = isSecondaryAPI(requestUrl);
                    
                    if (!isSecondary) {
                        // Tất cả các API GET chính (không phải secondary) đều set forbidden state
                        // Điều này đảm bảo tất cả các trang đều hiển thị forbidden khi API chính bị 403
                        setGlobalForbidden(true);
                    }
                    // Các API secondary sẽ được reject và component tự xử lý
                }
                
                // Reject để components có thể xử lý (hiển thị snackbar cho các hành động)
                return Promise.reject(error);
            }
            
            // Trả về error object với response data để dễ xử lý
        return Promise.reject({
          response: {
            status: error.response.status,
            data: error.response.data
          }
        });
        } else {
            // Retry logic for network errors
            if (!originalRequest._networkRetry &&
                (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.message.includes('timeout'))) {
                originalRequest._networkRetry = true;
                // Wait a bit before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return instance(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
