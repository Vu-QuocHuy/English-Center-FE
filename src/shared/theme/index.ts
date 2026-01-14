import { createTheme, Theme } from '@mui/material/styles';
import { COLORS, GRADIENTS, SHADOWS } from '../utils/colors';

// Create custom theme for English Center
const createCustomTheme = (mode: 'light' | 'dark' = 'light'): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: COLORS.primary.main,
        light: COLORS.primary.light,
        dark: COLORS.primary.dark,
        contrastText: COLORS.primary.contrastText,
      },
      secondary: {
        main: COLORS.secondary.main,
        light: COLORS.secondary.light,
        dark: COLORS.secondary.dark,
        contrastText: COLORS.secondary.contrastText,
      },
      success: {
        main: COLORS.success.main,
        light: COLORS.success.light,
        dark: COLORS.success.dark,
        contrastText: COLORS.success.contrastText,
      },
      warning: {
        main: COLORS.warning.main,
        light: COLORS.warning.light,
        dark: COLORS.warning.dark,
        contrastText: COLORS.warning.contrastText,
      },
      error: {
        main: COLORS.error.main,
        light: COLORS.error.light,
        dark: COLORS.error.dark,
        contrastText: COLORS.error.contrastText,
      },
      info: {
        main: COLORS.info.main,
        light: COLORS.info.light,
        dark: COLORS.info.dark,
        contrastText: COLORS.info.contrastText,
      },
      grey: COLORS.grey,
      text: COLORS.text,
      background: COLORS.background,
      action: COLORS.action,
      divider: COLORS.divider,
    },
    typography: {
      fontFamily: [
        '"Roboto"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      SHADOWS.card,
      SHADOWS.hover,
      SHADOWS.active,
      SHADOWS.modal,
      SHADOWS.dropdown,
      '0 3px 5px -1px rgba(0,0,0,0.2),0 6px 10px 0 rgba(0,0,0,0.14),0 1px 18px 0 rgba(0,0,0,0.12)',
      '0 4px 5px -2px rgba(0,0,0,0.2),0 7px 10px 1px rgba(0,0,0,0.14),0 2px 16px 1px rgba(0,0,0,0.12)',
      '0 5px 5px -3px rgba(0,0,0,0.2),0 8px 10px 1px rgba(0,0,0,0.14),0 3px 14px 2px rgba(0,0,0,0.12)',
      '0 5px 6px -3px rgba(0,0,0,0.2),0 9px 12px 1px rgba(0,0,0,0.14),0 3px 16px 2px rgba(0,0,0,0.12)',
      '0 6px 6px -3px rgba(0,0,0,0.2),0 10px 14px 1px rgba(0,0,0,0.14),0 4px 18px 3px rgba(0,0,0,0.12)',
      '0 6px 7px -4px rgba(0,0,0,0.2),0 11px 15px 1px rgba(0,0,0,0.14),0 4px 20px 3px rgba(0,0,0,0.12)',
      '0 7px 8px -4px rgba(0,0,0,0.2),0 12px 17px 2px rgba(0,0,0,0.14),0 5px 22px 4px rgba(0,0,0,0.12)',
      '0 7px 8px -4px rgba(0,0,0,0.2),0 13px 19px 2px rgba(0,0,0,0.14),0 5px 24px 4px rgba(0,0,0,0.12)',
      '0 7px 9px -4px rgba(0,0,0,0.2),0 14px 21px 2px rgba(0,0,0,0.14),0 5px 26px 4px rgba(0,0,0,0.12)',
      '0 8px 9px -5px rgba(0,0,0,0.2),0 15px 22px 2px rgba(0,0,0,0.14),0 6px 28px 5px rgba(0,0,0,0.12)',
      '0 8px 10px -5px rgba(0,0,0,0.2),0 16px 24px 2px rgba(0,0,0,0.14),0 6px 30px 5px rgba(0,0,0,0.12)',
      '0 8px 11px -5px rgba(0,0,0,0.2),0 17px 26px 2px rgba(0,0,0,0.14),0 6px 32px 5px rgba(0,0,0,0.12)',
      '0 9px 11px -5px rgba(0,0,0,0.2),0 18px 28px 2px rgba(0,0,0,0.14),0 7px 34px 6px rgba(0,0,0,0.12)',
      '0 9px 12px -6px rgba(0,0,0,0.2),0 19px 29px 2px rgba(0,0,0,0.14),0 7px 36px 6px rgba(0,0,0,0.12)',
      '0 10px 13px -6px rgba(0,0,0,0.2),0 20px 31px 3px rgba(0,0,0,0.14),0 8px 38px 7px rgba(0,0,0,0.12)',
      '0 10px 13px -6px rgba(0,0,0,0.2),0 21px 33px 3px rgba(0,0,0,0.14),0 8px 40px 7px rgba(0,0,0,0.12)',
      '0 10px 14px -6px rgba(0,0,0,0.2),0 22px 35px 3px rgba(0,0,0,0.14),0 8px 42px 7px rgba(0,0,0,0.12)',
      '0 11px 14px -7px rgba(0,0,0,0.2),0 23px 36px 3px rgba(0,0,0,0.14),0 9px 44px 8px rgba(0,0,0,0.12)',
      '0 11px 15px -7px rgba(0,0,0,0.2),0 24px 38px 3px rgba(0,0,0,0.14),0 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    components: {
      // Button customization
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: SHADOWS.hover,
            },
          },
          contained: {
            boxShadow: SHADOWS.card,
            '&:hover': {
              boxShadow: SHADOWS.hover,
            },
          },
          sizeSmall: {
            padding: '6px 12px',
            fontSize: '0.75rem',
          },
          sizeLarge: {
            padding: '12px 24px',
            fontSize: '1rem',
          },
        },
      },

      // Card customization
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: SHADOWS.card,
            border: `1px solid ${COLORS.grey[200]}`,
            '&:hover': {
              boxShadow: SHADOWS.hover,
            },
          },
        },
      },

      // Paper customization
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: SHADOWS.card,
          },
        },
      },

      // TextField customization
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },

      // Chip customization
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: COLORS.primary.main,
            color: COLORS.primary.contrastText,
          },
          colorSecondary: {
            backgroundColor: COLORS.secondary.main,
            color: COLORS.secondary.contrastText,
          },
        },
      },      // AppBar customization
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${COLORS.grey[200]}`,
          },
        },
      },

      // Drawer customization
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${COLORS.grey[200]}`,
            boxShadow: 'none',
          },
        },
      },

      // Dialog customization
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: SHADOWS.modal,
          },
        },
      },      // Menu customization
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${COLORS.grey[200]}`,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          },
        },
      },

      // MenuItem customization
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            padding: '12px 16px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateX(4px)',
            },
          },
        },
      },

      // Table customization
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: COLORS.grey[50],
            fontWeight: 600,
            borderBottom: `2px solid ${COLORS.grey[200]}`,
          },
          body: {
            borderBottom: `1px solid ${COLORS.grey[100]}`,
          },
        },
      },      // Avatar customization
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          colorDefault: {
            backgroundColor: COLORS.grey[300],
            color: COLORS.text.primary,
          },
        },
      },

      // Tabs customization
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 48,
          },
          indicator: {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48,
          },
        },
      },
    },
  });
};

// Default theme
const theme: Theme = createCustomTheme('light');

// Dark theme
export const darkTheme: Theme = createCustomTheme('dark');

// Export gradients for use in components
export { GRADIENTS };

export default theme;