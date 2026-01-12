import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

import { loginUserAPI as loginAPI, loginAdminAPI, refreshTokenAPI } from '../services/auth';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { accessToken: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_USER_DATA'; payload: { user: User; accessToken: string } };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials, isAdmin?: boolean) => Promise<LoginResponse | null>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  updateUser: (updatedData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        token: action.payload.accessToken,
        isAuthenticated: true,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          ...action.payload,
        } : null,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload
      };
    case 'SET_USER_DATA':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        let user: User = JSON.parse(userData);

        // Normalize role field on restore from localStorage
        if (user.role && typeof user.role === 'object' && 'id' in user.role) {
          const roleId = (user.role as any).id;
          (user as any).role = roleId === 1 ? 'admin' :
                    roleId === 2 ? 'teacher' :
                    roleId === 3 ? 'parent' :
                    roleId === 4 ? 'student' : 'unknown';
        }

        // Nếu là parent và thiếu permissions thì bổ sung mặc định
        if (user.role === 'parent' && !(user as any).permissions) {
          (user as any).permissions = [
            'view_child_info',
            'view_child_attendance',
            'view_fees',
            'make_payment',
            'view_schedule'
          ];
          localStorage.setItem('userData', JSON.stringify(user));
        }

        dispatch({
          type: 'SET_USER_DATA',
          payload: { user, accessToken: token }
        });
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('userData');
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    } else if (userData) {
      // Try refresh when we have userData but no token
      (async () => {
        try {
          let user: User = JSON.parse(userData);

          // Normalize role field
          if (user.role && typeof user.role === 'object' && 'id' in user.role) {
            const roleId = (user.role as any).id;
            (user as any).role = roleId === 1 ? 'admin' :
                      roleId === 2 ? 'teacher' :
                      roleId === 3 ? 'parent' :
                      roleId === 4 ? 'student' : 'unknown';
          }

          const response = await refreshTokenAPI();
          const newAccessToken = response?.data?.data?.access_token || response?.data?.access_token;

          if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, accessToken: newAccessToken }
            });
          } else {
            throw new Error('Invalid refresh token response');
          }
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('userData');
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      })();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    // Listen for refresh success event from axios interceptor
    const handleRefreshSuccessEvent = (event: CustomEvent) => {
      const { accessToken } = event.detail;
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: { accessToken }
      });
      dispatch({
        type: 'SET_AUTHENTICATED',
        payload: true
      });
    };

    window.addEventListener('auth:refresh_success', handleRefreshSuccessEvent as EventListener);

    return () => {
      window.removeEventListener('auth:refresh_success', handleRefreshSuccessEvent as EventListener);
    };
  }, []);

  // Sync user/token to localStorage when changed
  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem('access_token', state.token);
      localStorage.setItem('userData', JSON.stringify(state.user));
      if (state.user.role === 'parent' && state.user.parentId) {
        localStorage.setItem('parent_id', state.user.parentId);
      }
      localStorage.setItem('session_active', 'true');
    } else if (!state.user && !state.loading && localStorage.getItem('session_active')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('userData');
      localStorage.removeItem('parent_id');
      localStorage.removeItem('session_active');
    }
  }, [state.user, state.token, state.loading]);

  const login = async (credentials: LoginCredentials, isAdmin: boolean = false): Promise<LoginResponse | null> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const apiResponse = await Promise.race([
        isAdmin ? loginAdminAPI({
          email: credentials.email,
          password: credentials.password
        }) : loginAPI({
          email: credentials.email,
          password: credentials.password
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);

      let userData: User | null = null;
      let accessToken: string | null = null;

      // Parse response structure
      if (apiResponse?.data?.data) {
        userData = apiResponse.data.data.user;
        accessToken = apiResponse.data.data.access_token;
      } else if (apiResponse?.data) {
        userData = apiResponse.data.user;
        accessToken = apiResponse.data.access_token;
      }

      if (!userData || !accessToken) {
        throw new Error('Invalid response structure: missing user data or token');
      }

      // Normalize role field
      if (userData.role && typeof userData.role === 'object' && 'id' in userData.role) {
        const roleId = (userData.role as any).id;
        (userData as any).role = roleId === 1 ? 'admin' :
                          roleId === 2 ? 'teacher' :
                          roleId === 3 ? 'parent' :
                          roleId === 4 ? 'student' : 'unknown';
      }
      
      // If user logged in via staff login and is not admin, set role to 'staff'
      // This is handled in StaffLogin component, but we also check here for consistency
      if (isAdmin && userData.role !== 'admin' && userData.role !== 'teacher') {
        (userData as any).role = 'staff';
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      if (userData.role === 'parent' && userData.parentId) {
        localStorage.setItem('parent_id', userData.parentId);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userData,
          accessToken: accessToken
        }
      });

      return { user: userData, accessToken };

    } catch (error: any) {
      let errorMessage = 'Đăng nhập thất bại';

      if (error.message === 'Request timeout') {
        errorMessage = 'Kết nối API timeout. Vui lòng thử lại.';
      } else if (error.response?.data?.message) {
        // Dịch các thông báo lỗi phổ biến từ tiếng Anh sang tiếng Việt
        const backendMessage = error.response.data.message;
        const errorTranslations: Record<string, string> = {
          'Incorrect email or password': 'Email hoặc mật khẩu không đúng',
          'Invalid email or password': 'Email hoặc mật khẩu không đúng',
          'Email or password is incorrect': 'Email hoặc mật khẩu không đúng',
          'User not found': 'Tài khoản không tồn tại',
          'Account not found': 'Tài khoản không tồn tại',
          'Email not found': 'Email không tồn tại',
          'Password is incorrect': 'Mật khẩu không đúng',
          'Invalid credentials': 'Thông tin đăng nhập không hợp lệ',
          'Authentication failed': 'Xác thực thất bại',
          'Login failed': 'Đăng nhập thất bại',
          'Account is disabled': 'Tài khoản đã bị vô hiệu hóa',
          'Account is locked': 'Tài khoản đã bị khóa',
          'Too many login attempts': 'Quá nhiều lần đăng nhập thất bại',
          'Please try again later': 'Vui lòng thử lại sau',
          'Server error': 'Lỗi server',
          'Internal server error': 'Lỗi server nội bộ'
        };

        errorMessage = errorTranslations[backendMessage] || backendMessage;
      } else if (error.response?.status === 401) {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.message && error.message !== 'Request timeout') {
        errorMessage = error.message;
      }

      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });

      // Không throw error để tránh reload trang
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('parent_id');
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const response = await refreshTokenAPI();
      const newAccessToken = response?.data?.data?.access_token || response?.data?.access_token;

      if (!newAccessToken) {
        throw new Error('Invalid refresh token response');
      }

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

      localStorage.setItem('access_token', newAccessToken);

      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: { accessToken: newAccessToken }
      });

      return newAccessToken;
    } catch (error) {
      localStorage.removeItem('access_token');
      return null;
    }
  };

  const updateUser = (updatedData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: updatedData });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
