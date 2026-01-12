import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@/constants';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Nếu đang loading, hiển thị loading
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Nếu không có user data, redirect
  if (!user) {
    const path = location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/teacher')) {
      return <Navigate to="/staff/login" state={{ from: location }} replace />;
    }
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Nếu có user nhưng không authenticated (token có thể hết hạn),
  // để component render và để interceptor xử lý refresh
  if (!isAuthenticated) {
    // Không redirect ngay, để component render và interceptor xử lý
    // Nếu API call bị 401, interceptor sẽ gọi refresh
    console.log('User exists but not authenticated, allowing render for interceptor to handle');
    // Không return Navigate, để component render
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard if user has wrong role
    if (user.role === 'admin' || user.role === 'staff') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'parent') {
      return <Navigate to="/parent/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
