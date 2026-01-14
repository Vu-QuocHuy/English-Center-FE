import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Box, Typography, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@contexts/AuthContext';
import { COLORS } from '@shared/utils';
import { ConfirmDialog } from '@shared/components';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoClick = (): void => {
    navigate('/');
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleProfile = (): void => {
    switch (user?.role) {
      case 'admin':
        navigate('/admin/profile');
        break;
      case 'teacher':
        navigate('/teacher/profile');
        break;
      case 'student':
        navigate('/student/profile');
        break;
      case 'parent':
        navigate('/parent/profile');
        break;
      default:
        navigate('/profile');
    }
    handleMenuClose();
  };

  const handleLogoutClick = (): void => {
    setLogoutDialogOpen(true);
    handleMenuClose();
  };

  const handleLogoutConfirm = async (): Promise<void> => {
    await logout();
    navigate('/');
    setLogoutDialogOpen(false);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#fff',
        color: '#222',
        borderRadius: 0,
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, pl: 2, pr: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="default" edge="start" onClick={onMenuClick} sx={{ p: 1.2 }}>
            <MenuIcon fontSize="medium" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleLogoClick}>
            <SchoolIcon sx={{ fontSize: 32, color: COLORS.primary.text, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111', fontSize: '1.25rem' }}>
              Episteme
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={handleAvatarClick} sx={{ p: 0.3 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: COLORS.secondary.main,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 18,
              }}
              src={user?.avatar}
              alt={user?.name || user?.username || 'User'}
            >
              {user?.avatar ? null : (user?.name?.charAt(0) || user?.username?.charAt(0) || '?')}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: 1 }}
          >
            <Box sx={{ px: 2, py: 1, minWidth: 180 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
                {user?.name || user?.username || 'User'}
              </Typography>
            </Box>
            <MenuItem onClick={handleProfile}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Trang cá nhân
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <ConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        confirmColor="error"
      />
    </AppBar>
  );
};

export default Header;
