import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { COLORS } from '@shared/utils';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '@shared/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useMenuItems } from '@features/menus';
import { NavigationMenuItem } from '@shared/types';
import { ConfirmDialog } from '@shared/components';

const scrollToSection = (id: string): void => {
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({
      top: el.offsetTop - 72, // Offset for header height
      behavior: 'smooth',
    });
  }
};

const HomeHeader: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { menuItems } = useMenuItems();

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero-section');
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const closeTimeoutRef = React.useRef<{ [key: string]: NodeJS.Timeout }>({});
  const menuRefs = React.useRef<{ [key: string]: HTMLElement | null }>({});
  const justOpenedRef = React.useRef<boolean>(false);


  // Global mouse move listener to close dropdown when not hovering menu or dropdown
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Skip if just opened (prevent immediate close)
      if (justOpenedRef.current) {
        return;
      }

      // Debounce - chỉ check sau 200ms để giảm lag
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Check if any dropdown is open
        const hasOpenDropdown = Object.values(dropdownAnchor).some(anchor => anchor !== null);

        if (!hasOpenDropdown) return;

        const target = e.target as HTMLElement;

        // Check if mouse is on a menu button or menu item container
        const isOnMenuButton = target.closest('button') !== null &&
                               Object.values(menuRefs.current).some(ref => ref && ref.contains(target));

        // Check if mouse is on any Box container that wraps menu items
        const isOnMenuContainer = Object.values(menuRefs.current).some(ref => ref && ref.contains(target));

        // Check if mouse is on dropdown menu (MUI Portal)
        const isOnDropdown = target.closest('[role="menu"]') !== null;

        // If not on button, container, and not on dropdown -> close all
        if (!isOnMenuButton && !isOnMenuContainer && !isOnDropdown) {
          setDropdownAnchor({});
        }
      }, 200);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [dropdownAnchor]);

  // Get active menu items (filtered and sorted)
  // ✅ Lọc bỏ menu item "Trang chủ" vì trang chủ được điều hướng qua logo
  const activeMenuItems = menuItems
    .filter(item => item.isActive)
    .filter(item => {
      // Loại bỏ item có slug là '/' hoặc '/home' hoặc title là 'Trang chủ'
      const slug = item.slug?.toLowerCase().trim();
      const title = item.title?.toLowerCase().trim();
      return slug !== '/' &&
             slug !== '/home' &&
             title !== 'trang chủ' &&
             title !== 'home';
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Không dùng menu tĩnh mặc định; chỉ hiển thị khi có menu từ API
  const displayMenuItems = activeMenuItems;

  // Get section IDs for scroll detection
  const sectionIds = displayMenuItems
    .map(item => ({ label: item.title, id: item.slug || item.title }));

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollY = window.scrollY;
      const currentSection = sectionIds.reduce((acc, section) => {
        const el = document.getElementById(section.id);
        if (el && scrollY >= el.offsetTop - 80) {
          return section.id;
        }
        return acc;
      }, 'hero-section');

      setActiveSection(currentSection);
      setScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = (): void => {
    setMobileMenuAnchor(null);
  };

  const handleMobileMenuItemClick = (menuItem: NavigationMenuItem): void => {
    handleMenuClick(menuItem);
    handleMobileMenuClose();
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleDashboard = (): void => {
    const role = user?.role;
    if (role) {
      navigate(`/${role}/dashboard`);
    }
    handleMenuClose();
  };

  const handleProfile = (): void => {
    // Navigate to profile based on user role
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
        navigate('/profile'); // Fallback to general profile
    }
    handleMenuClose();
  };

  const handleLogoutClick = (): void => {
    setLogoutDialogOpen(true);
    handleMenuClose();
  };

  const handleLogoutConfirm = async (): Promise<void> => {
    await logout();
    navigate('/'); // Stay on home page after logout
    setLogoutDialogOpen(false);
  };

  const handleDropdownClose = (menuId: string): void => {
    setDropdownAnchor(prev => ({ ...prev, [menuId]: null }));
  };

  const handleMenuClick = (menuItem: NavigationMenuItem): void => {
    // If has children, don't do anything - just show dropdown
    if (menuItem.childrenMenu && menuItem.childrenMenu.length > 0) {
      return;
    }

    // Only navigate/scroll if no children
    if (menuItem.slug) {
      // Navigate to slug if available
      // Ensure slug starts with '/' for absolute path
      const absoluteSlug = menuItem.slug.startsWith('/') ? menuItem.slug : `/${menuItem.slug}`;
      navigate(absoluteSlug);
    } else {
      // Fallback to scroll to section
      scrollToSection(menuItem.title);
    }
  };

  const handleSubmenuClick = (submenu: NavigationMenuItem): void => {
    if (submenu.slug) {
      // Ensure slug starts with '/' for absolute path
      const absoluteSlug = submenu.slug.startsWith('/') ? submenu.slug : `/${submenu.slug}`;
      navigate(absoluteSlug);
    }
  };

  const renderAuthControls = (): React.ReactNode => {
    if (user) {
      return (
        <>
          <IconButton onClick={handleAvatarClick} sx={{ p: 0.3 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: COLORS.secondary.main,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 18
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
            <MenuItem onClick={handleDashboard}>
              <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>
            <MenuItem onClick={handleProfile}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Trang cá nhân
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </>
      );
    }
    return (
      <Button
        variant="contained"
        onClick={() => navigate('/login')}
        startIcon={<PersonIcon />}
        sx={{
          ...commonStyles.primaryButton,
          px: 2.5,
          py: 1,
          borderRadius: 2,
        }}
      >
        Đăng nhập
      </Button>
    );
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: '#fff',
        color: COLORS.text.primary,
        borderBottom: 'none',
        boxShadow: scrolled ? 1 : 'none',
        transition: 'box-shadow 0.3s',
        borderRadius: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{
        minHeight: 72,
        maxHeight: 72,
        px: { xs: 2, md: 4 },
        display: 'flex',
        justifyContent: 'space-between',
        overflow: 'visible'
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <SchoolIcon sx={{ fontSize: 32, color: COLORS.primary.text, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Episteme
          </Typography>
        </Box>

        {isMobile ? (
          // Mobile Menu
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              sx={{ mt: 1 }}
            >
              {displayMenuItems.map((menuItem) => (
                <Box key={menuItem.id}>
                  <MenuItem
                    onClick={() => handleMobileMenuItemClick(menuItem)}
                    sx={{ fontWeight: 600 }} // ✅ Chữ đậm cho menu mobile
                  >
                    {menuItem.title}
                  </MenuItem>
                  {menuItem.childrenMenu && menuItem.childrenMenu.length > 0 && (
                    <Box sx={{ pl: 2 }}>
                      {menuItem.childrenMenu
                        .filter(child => child.isActive)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((submenu) => (
                          <MenuItem
                            key={submenu.id}
                            onClick={() => {
                              handleSubmenuClick(submenu);
                              handleMobileMenuClose();
                            }}
                            sx={{ pl: 3, fontSize: '0.9rem', fontWeight: 500 }} // ✅ Submenu mobile hơi nhạt hơn
                          >
                            {submenu.title}
                          </MenuItem>
                        ))}
                    </Box>
                  )}
                </Box>
              ))}
              {user ? (
                <>
                  <MenuItem onClick={() => { handleDashboard(); handleMobileMenuClose(); }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleProfile(); handleMobileMenuClose(); }}>
                    Trang cá nhân
                  </MenuItem>
                  <MenuItem onClick={() => { handleLogoutClick(); handleMobileMenuClose(); }}>
                    Đăng xuất
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={() => { navigate('/login'); handleMobileMenuClose(); }}>
                  Đăng nhập
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          // Desktop Menu
          <>
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                zIndex: 1,
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              {displayMenuItems.map((menuItem) => (
                <Box
                  key={menuItem.id}
                  ref={(el) => { menuRefs.current[menuItem.id] = el as HTMLElement | null; }}
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    // Clear all close timeouts
                    Object.keys(closeTimeoutRef.current).forEach(key => {
                      clearTimeout(closeTimeoutRef.current[key]);
                    });
                    closeTimeoutRef.current = {};

                    // Check if this menu has children
                    if (menuItem.childrenMenu && menuItem.childrenMenu.length > 0) {
                      const buttonElement = e.currentTarget.querySelector('button');
                      if (buttonElement) {
                        // Close other dropdowns smoothly
                        setDropdownAnchor(() => {
                          const newState: any = {};
                          // Only keep current menu open
                          newState[menuItem.id] = buttonElement;
                          return newState;
                        });

                        // Set flag to prevent immediate close
                        justOpenedRef.current = true;
                        setTimeout(() => {
                          justOpenedRef.current = false;
                        }, 300);
                      }
                    } else {
                      // No children, close all dropdowns
                      setDropdownAnchor({});
                    }
                  }}
                  onMouseLeave={() => {
                    // Don't close immediately, wait a bit
                    // This prevents flickering when moving mouse between button and dropdown
                  }}
                >
                  <Button
                    onClick={() => handleMenuClick(menuItem)}
                    endIcon={menuItem.childrenMenu && menuItem.childrenMenu.length > 0 ? <ArrowDownIcon /> : null}
                    sx={{
                      mx: 1.5,
                      px: 2,
                      py: 1,
                      color: activeSection === (menuItem.slug || menuItem.title) ? COLORS.primary.main : '#111',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: 1,
                      bgcolor: dropdownAnchor[menuItem.id] ? '#f5f5f5' : 'transparent',
                      outline: 'none',
                      boxShadow: 'none',
                      border: '1px solid transparent',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                      minHeight: 40,
                      whiteSpace: (() => {
                        // Đếm số từ trong title
                        const wordCount = menuItem.title?.split(/\s+/).filter(word => word.length > 0).length || 0;
                        // Chỉ xuống dòng khi có nhiều hơn 3 từ
                        return wordCount <= 3 ? 'nowrap' : 'normal';
                      })(),
                      lineHeight: 1.2,
                      textAlign: 'center',
                      '&:focus, &:active': {
                        outline: 'none',
                        boxShadow: 'none',
                      },
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        border: '1px solid transparent',
                      },
                    }}
                  >
                    {menuItem.title}
                  </Button>

                  {/* Dropdown Menu */}
                  {menuItem.childrenMenu && menuItem.childrenMenu.length > 0 && (
                    <Menu
                      anchorEl={dropdownAnchor[menuItem.id]}
                      open={Boolean(dropdownAnchor[menuItem.id])}
                      onClose={() => handleDropdownClose(menuItem.id)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                      disableAutoFocusItem
                      disableAutoFocus
                      disableScrollLock
                      disablePortal={false}
                      sx={{
                        mt: 0.5,
                        pointerEvents: 'none',
                        '& .MuiPaper-root': {
                          pointerEvents: 'auto',
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(0,0,0,0.08)',
                          minWidth: 200,
                          marginTop: '4px',
                        },
                        '& .MuiList-root': {
                          py: 1,
                        }
                      }}
                      MenuListProps={{
                        autoFocusItem: false,
                        onMouseLeave: () => {
                          // Close dropdown when mouse leaves the menu
                          closeTimeoutRef.current[menuItem.id] = setTimeout(() => {
                            handleDropdownClose(menuItem.id);
                          }, 150);
                        },
                        onMouseEnter: () => {
                          // Cancel close timeout when mouse re-enters
                          if (closeTimeoutRef.current[menuItem.id]) {
                            clearTimeout(closeTimeoutRef.current[menuItem.id]);
                          }
                        }
                      }}
                      TransitionProps={{
                        timeout: 200,
                      }}
                      slotProps={{
                        paper: {
                          style: {
                            transform: 'none',
                            position: 'absolute',
                          }
                        }
                      }}
                    >
                      {menuItem.childrenMenu
                        .filter(child => child.isActive)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((submenu) => (
                          <MenuItem
                            key={submenu.id}
                            onClick={() => handleSubmenuClick(submenu)}
                            sx={{
                              minWidth: 200,
                              px: 2.5,
                              py: 1.2,
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                              }
                            }}
                          >
                            {submenu.title}
                          </MenuItem>
                        ))}
                    </Menu>
                  )}
                </Box>
              ))}
            </Box>

            {renderAuthControls()}
          </>
        )}
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

export default HomeHeader;
