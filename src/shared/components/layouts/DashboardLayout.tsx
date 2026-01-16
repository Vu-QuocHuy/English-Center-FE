import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { useSidebar } from '@contexts/SidebarContext';
import { useForbidden } from '@contexts/ForbiddenContext';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { isForbidden, clearForbidden, isChecking, setChecking } = useForbidden();
  const location = useLocation();

  // Clear forbidden state and set checking when route changes
  useEffect(() => {
    // Set checking ngay lập tức để tránh render children
    setChecking(true);
    clearForbidden();
  }, [location.pathname, clearForbidden, setChecking]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Header onMenuClick={toggleSidebar} />
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: '64px' }}>
        <Sidebar open={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            minHeight: 'calc(100vh - 64px)',
            transition: 'margin 0.3s',
            bgcolor: '#f9f9f9',
          }}
        >
          {isForbidden ? (
            <Box
              sx={{
                minHeight: 'calc(100vh - 64px - 48px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#ffffff',
                textAlign: 'center',
                p: 4,
                width: '100%',
              }}
            >
              <BlockIcon
                sx={{
                  fontSize: 120,
                  color: '#d32f2f',
                  mb: 3,
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
                sx={{
                  color: '#d32f2f',
                  mb: 2,
                }}
              >
                Không có quyền truy cập
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                Bạn không có quyền truy cập vào chức năng này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
              </Typography>
            </Box>
          ) : isChecking ? (
            // Hiển thị loading khi đang check quyền để tránh flash content
            <Box
              sx={{
                minHeight: 'calc(100vh - 64px - 48px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#ffffff',
              }}
            >
              <CircularProgress size={60} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Đang kiểm tra quyền truy cập...
              </Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
