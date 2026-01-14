import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tooltip,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@contexts/AuthContext';
import { useSidebar } from '@contexts/SidebarContext';
import { COLORS } from '@shared/utils';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const drawerWidth = 260;
const miniWidth = 72;

const getMenuItemsByRole = (role: string): MenuItem[] => {
  switch (role) {
    case 'admin':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/admin/dashboard' },
        { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes' },
        { text: 'Quản lý nội dung', icon: <ArticleIcon />, path: '/admin/content' },
        { text: 'Đăng ký tư vấn', icon: <ListAltIcon />, path: '/admin/registrations' },
        { text: 'Quản lý vai trò', icon: <SecurityIcon />, path: '/admin/roles-management' },
        { text: 'Quản lý tài chính', icon: <PaymentIcon />, path: '/admin/financial' },
        { text: 'Thống kê học sinh', icon: <SchoolIcon />, path: '/admin/student-statistics' },
        { text: 'Audit Logs', icon: <ListAltIcon />, path: '/admin/audit-log' },
      ];
    case 'staff':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/admin/dashboard' },
        { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes' },
        { text: 'Quản lý nội dung', icon: <ArticleIcon />, path: '/admin/content' },
        { text: 'Đăng ký tư vấn', icon: <ListAltIcon />, path: '/admin/registrations' },
        { text: 'Quản lý tài chính', icon: <PaymentIcon />, path: '/admin/financial' },
        { text: 'Thống kê học sinh', icon: <SchoolIcon />, path: '/admin/student-statistics' },
      ];
    case 'teacher':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/teacher/dashboard' },
        { text: 'Lịch dạy', icon: <ClassIcon />, path: '/teacher/schedule' },
        { text: 'Quản lý lớp dạy', icon: <SchoolIcon />, path: '/teacher/classes' },
        { text: 'Lương', icon: <PaymentIcon />, path: '/teacher/salary' },
      ];
    case 'student':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/student/dashboard' },
        { text: 'Lịch học', icon: <ClassIcon />, path: '/student/schedule' },
        { text: 'Thông tin học tập', icon: <SchoolIcon />, path: '/student/classes' },
      ];
    case 'parent':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/parent/dashboard' },
        { text: 'Thông tin con', icon: <PeopleIcon />, path: '/parent/children' },
        { text: 'Thanh toán', icon: <PaymentIcon />, path: '/parent/payments' },
      ];
    default:
      return [
        { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
        { text: 'Khám phá', icon: <ExploreIcon />, path: '/explore' },
        { text: 'Kênh đăng ký', icon: <SubscriptionsIcon />, path: '/subscriptions' },
        { text: 'Thư viện', icon: <VideoLibraryIcon />, path: '/library' },
        { text: 'Lịch sử', icon: <HistoryIcon />, path: '/history' },
      ];
  }
};

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openSidebar } = useSidebar();
  const role = user?.role || 'student';
  const menuItems = getMenuItemsByRole(role);

  const [usersOpen, setUsersOpen] = useState<boolean>(
    location.pathname.startsWith('/admin/users') || location.pathname === '/admin/users/staff'
  );
  const [financialOpen, setFinancialOpen] = useState<boolean>(location.pathname.startsWith('/admin/financial'));
  const [contentOpen, setContentOpen] = useState<boolean>(
    location.pathname.startsWith('/admin/advertisements') ||
      location.pathname.startsWith('/admin/menu-management') ||
      location.pathname.startsWith('/admin/testimonials') ||
      location.pathname.startsWith('/admin/articles')
  );

  React.useEffect(() => {
    if (!open) {
      setUsersOpen(false);
      setFinancialOpen(false);
      setContentOpen(false);
    }
  }, [open]);

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : miniWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniWidth,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          bgcolor: '#fff',
          borderRight: '1px solid #eee',
        },
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          {menuItems.map((item) => {
            const isUsers = item.path === '/admin/users';
            const isFinancial = item.path === '/admin/financial';
            const isContent = item.path === '/admin/content';

            if (!isUsers && !isFinancial && !isContent) {
              return (
                <Tooltip key={item.text} title={!open ? item.text : ''} placement="right" arrow>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        my: 0.5,
                        transition: 'background 0.2s',
                        '&.Mui-selected': {
                          bgcolor: '#f5f5f5',
                          color: COLORS.primary.main,
                          '&:hover': { bgcolor: '#eeeeee' },
                        },
                        '&:hover': { bgcolor: '#f9f9f9' },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: location.pathname === item.path ? COLORS.primary.main : 'inherit',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              );
            }

            if (isUsers) {
              return (
                <Box key={item.text}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      selected={location.pathname.startsWith('/admin/users')}
                      onClick={() => {
                        if (!open) openSidebar();
                        setUsersOpen((v) => !v);
                      }}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        my: 0.5,
                        transition: 'background 0.2s',
                        '&.Mui-selected': {
                          bgcolor: '#f5f5f5',
                          color: COLORS.primary.main,
                          '&:hover': { bgcolor: '#eeeeee' },
                        },
                        '&:hover': { bgcolor: '#f9f9f9' },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: location.pathname.startsWith('/admin/users') ? COLORS.primary.main : 'inherit',
                        }}
                      >
                        <PeopleIcon />
                      </ListItemIcon>
                      {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, mr: 2 }} />}
                      {open && (usersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                    </ListItemButton>
                  </ListItem>

                  {usersOpen && (
                    <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                      <ListItemButton
                        selected={location.pathname === '/admin/users/students'}
                        onClick={() => {
                          if (!open) openSidebar();
                          navigate('/admin/users/students');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25,
                        }}
                      >
                        {open && <ListItemText primary="Học viên" />}
                      </ListItemButton>

                      <ListItemButton
                        selected={location.pathname === '/admin/users/teachers'}
                        onClick={() => {
                          if (!open) openSidebar();
                          navigate('/admin/users/teachers');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25,
                        }}
                      >
                        {open && <ListItemText primary="Giáo viên" />}
                      </ListItemButton>

                      <ListItemButton
                        selected={location.pathname === '/admin/users/parents'}
                        onClick={() => {
                          if (!open) openSidebar();
                          navigate('/admin/users/parents');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25,
                        }}
                      >
                        {open && <ListItemText primary="Phụ huynh" />}
                      </ListItemButton>

                      <ListItemButton
                        selected={location.pathname === '/admin/users/staff'}
                        onClick={() => {
                          if (!open) openSidebar();
                          navigate('/admin/users/staff');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25,
                        }}
                      >
                        {open && <ListItemText primary="Nhân viên" />}
                      </ListItemButton>
                    </List>
                  )}
                </Box>
              );
            }

            if (isFinancial) {
              return (
                <Box key={item.text}>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      selected={location.pathname.startsWith('/admin/financial')}
                      onClick={() => {
                        if (!open) openSidebar();
                        setFinancialOpen((v) => !v);
                      }}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        my: 0.5,
                        transition: 'background 0.2s',
                        '&.Mui-selected': {
                          bgcolor: '#f5f5f5',
                          color: COLORS.primary.main,
                          '&:hover': { bgcolor: '#eeeeee' },
                        },
                        '&:hover': { bgcolor: '#f9f9f9' },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: location.pathname.startsWith('/admin/financial') ? COLORS.primary.main : 'inherit',
                        }}
                      >
                        <PaymentIcon />
                      </ListItemIcon>
                      {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, mr: 2 }} />}
                      {open && (financialOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                    </ListItemButton>
                  </ListItem>

                  {financialOpen && (
                    <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                      <ListItemButton
                        selected={location.pathname === '/admin/financial/teachers'}
                        onClick={() => {
                          if (!open) openSidebar();
                          navigate('/admin/financial/teachers');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25,
                        }}
                      >
                        {open && <ListItemText primary="Thanh toán giáo viên" />}
                      </ListItemButton>

                      <ListItemButton
                        selected={location.pathname === '/admin/financial/students'}
                        onClick={() => {
                          if (!open) openSidebar();
                          navigate('/admin/financial/students');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25,
                        }}
                      >
                        {open && <ListItemText primary="Thanh toán học sinh" />}
                      </ListItemButton>

                      <ListItemButton
                        selected={location.pathname === '/admin/financial/transactions'}
                        onClick={() => {
                          if (!open) openSidebar();
                          navigate('/admin/financial/transactions');
                        }}
                        sx={{
                          minHeight: 40,
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                          borderRadius: 2,
                          ml: open ? 2 : 0,
                          my: 0.25,
                        }}
                      >
                        {open && <ListItemText primary="Thu chi khác" />}
                      </ListItemButton>
                    </List>
                  )}
                </Box>
              );
            }

            // Content management expandable
            return (
              <Box key={item.text}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    selected={
                      location.pathname.startsWith('/admin/advertisements') ||
                      location.pathname.startsWith('/admin/menu-management') ||
                      location.pathname.startsWith('/admin/testimonials') ||
                      location.pathname.startsWith('/admin/articles') ||
                      location.pathname.startsWith('/admin/footer-settings')
                    }
                    onClick={() => {
                      if (!open) openSidebar();
                      setContentOpen((v) => !v);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      my: 0.5,
                      transition: 'background 0.2s',
                      '&.Mui-selected': {
                        bgcolor: '#f5f5f5',
                        color: COLORS.primary.main,
                        '&:hover': { bgcolor: '#eeeeee' },
                      },
                      '&:hover': { bgcolor: '#f9f9f9' },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color:
                          location.pathname.startsWith('/admin/advertisements') ||
                          location.pathname.startsWith('/admin/menu-management') ||
                          location.pathname.startsWith('/admin/testimonials') ||
                          location.pathname.startsWith('/admin/articles') ||
                          location.pathname.startsWith('/admin/footer-settings')
                            ? COLORS.primary.main
                            : 'inherit',
                      }}
                    >
                      <ArticleIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, mr: 2 }} />}
                    {open && (contentOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                  </ListItemButton>
                </ListItem>

                {contentOpen && (
                  <List component="div" disablePadding sx={{ pl: open ? 4 : 0 }}>
                    <ListItemButton
                      selected={location.pathname === '/admin/advertisements'}
                      onClick={() => {
                        if (!open) openSidebar();
                        navigate('/admin/advertisements');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25,
                      }}
                    >
                      {open && <ListItemText primary="Quản lý quảng cáo" />}
                    </ListItemButton>

                    <ListItemButton
                      selected={location.pathname === '/admin/menu-management'}
                      onClick={() => {
                        if (!open) openSidebar();
                        navigate('/admin/menu-management');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25,
                      }}
                    >
                      {open && <ListItemText primary="Quản lý Menu" />}
                    </ListItemButton>

                    <ListItemButton
                      selected={location.pathname === '/admin/testimonials'}
                      onClick={() => {
                        if (!open) openSidebar();
                        navigate('/admin/testimonials');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25,
                      }}
                    >
                      {open && <ListItemText primary="Đánh giá học viên" />}
                    </ListItemButton>

                    <ListItemButton
                      selected={location.pathname === '/admin/articles'}
                      onClick={() => {
                        if (!open) openSidebar();
                        navigate('/admin/articles');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25,
                      }}
                    >
                      {open && <ListItemText primary="Quản lý bài viết" />}
                    </ListItemButton>

                    <ListItemButton
                      selected={location.pathname === '/admin/footer-settings'}
                      onClick={() => {
                        if (!open) openSidebar();
                        navigate('/admin/footer-settings');
                      }}
                      sx={{
                        minHeight: 40,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        borderRadius: 2,
                        ml: open ? 2 : 0,
                        my: 0.25,
                      }}
                    >
                      {open && <ListItemText primary="Cài đặt Footer" />}
                    </ListItemButton>
                  </List>
                )}
              </Box>
            );
          })}
        </List>
      </Box>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
