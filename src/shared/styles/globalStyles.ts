// Global styles for English Center Application
import { COLORS, SHADOWS, BORDER_RADIUS } from '../utils/colors';

// CSS-in-JS global styles that can be used with makeStyles or styled components
export interface GlobalStyles {
  // Layout styles
  pageContainer: React.CSSProperties;
  contentWrapper: React.CSSProperties;
  sectionSpacing: React.CSSProperties;

  // Card styles
  card: React.CSSProperties;
  cardHeader: React.CSSProperties;

  // Button styles
  primaryButton: React.CSSProperties;
  secondaryButton: React.CSSProperties;

  // Text styles
  pageTitle: React.CSSProperties;
  sectionTitle: React.CSSProperties;
  bodyText: React.CSSProperties;

  // Form styles
  formContainer: React.CSSProperties;
  inputField: React.CSSProperties;

  // Status styles
  statusActive: React.CSSProperties;
  statusInactive: React.CSSProperties;
  statusPending: React.CSSProperties;
  statusError: React.CSSProperties;

  // Navigation styles
  navItem: React.CSSProperties;
  navItemActive: React.CSSProperties;

  // Table styles
  tableHeader: React.CSSProperties;
  tableRow: React.CSSProperties;

  // Modal styles
  modalOverlay: React.CSSProperties;
  modalContent: React.CSSProperties;

  // Loading styles
  loadingSpinner: React.CSSProperties;
  loadingOverlay: React.CSSProperties;

  // Responsive utilities
  hideOnMobile: React.CSSProperties;
  hideOnDesktop: React.CSSProperties;
  responsiveGrid: React.CSSProperties;

  // Animation utilities
  fadeIn: React.CSSProperties;
  slideUp: React.CSSProperties;

  // Utility classes
  textCenter: React.CSSProperties;
  textLeft: React.CSSProperties;
  textRight: React.CSSProperties;
  fullWidth: React.CSSProperties;
  flexCenter: React.CSSProperties;
  flexBetween: React.CSSProperties;
  marginBottom: React.CSSProperties;
  marginTop: React.CSSProperties;
  paddingAll: React.CSSProperties;
}

export const globalStyles: GlobalStyles = {
  // Layout styles
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: COLORS.background.default,
  },

  contentWrapper: {
    padding: '24px',
    backgroundColor: COLORS.background.default,
  },

  sectionSpacing: {
    marginBottom: '32px',
  },

  // Card styles
  card: {
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.card,
    padding: '24px',
    border: `1px solid ${COLORS.grey[200]}`,
  },

  cardHeader: {
    borderBottom: `1px solid ${COLORS.grey[200]}`,
    paddingBottom: '16px',
    marginBottom: '24px',
  },

  // Button styles
  primaryButton: {
    backgroundColor: COLORS.primary.main,
    color: COLORS.primary.contrastText,
    borderRadius: BORDER_RADIUS.medium,
    padding: '12px 24px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: SHADOWS.card,
    '&:hover': {
      backgroundColor: COLORS.primary.dark,
      boxShadow: SHADOWS.hover,
    },
  } as React.CSSProperties,

  secondaryButton: {
    backgroundColor: COLORS.secondary.main,
    color: COLORS.secondary.contrastText,
    borderRadius: BORDER_RADIUS.medium,
    padding: '12px 24px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: SHADOWS.card,
    '&:hover': {
      backgroundColor: COLORS.secondary.dark,
      boxShadow: SHADOWS.hover,
    },
  } as React.CSSProperties,

  // Text styles
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: COLORS.text.primary,
    marginBottom: '16px',
  },

  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: COLORS.text.primary,
    marginBottom: '12px',
  },

  bodyText: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: COLORS.text.secondary,
  },

  // Form styles
  formContainer: {
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.large,
    padding: '32px',
    boxShadow: SHADOWS.card,
  },

  inputField: {
    marginBottom: '24px',
    '& .MuiOutlinedInput-root': {
      borderRadius: BORDER_RADIUS.medium,
    },
  } as React.CSSProperties,

  // Status styles
  statusActive: {
    color: COLORS.success.main,
    backgroundColor: `${COLORS.success.main}20`,
    padding: '4px 12px',
    borderRadius: BORDER_RADIUS.pill,
    fontSize: '0.875rem',
    fontWeight: 500,
  },

  statusInactive: {
    color: COLORS.grey[600],
    backgroundColor: `${COLORS.grey[500]}20`,
    padding: '4px 12px',
    borderRadius: BORDER_RADIUS.pill,
    fontSize: '0.875rem',
    fontWeight: 500,
  },

  statusPending: {
    color: COLORS.warning.main,
    backgroundColor: `${COLORS.warning.main}20`,
    padding: '4px 12px',
    borderRadius: BORDER_RADIUS.pill,
    fontSize: '0.875rem',
    fontWeight: 500,
  },

  statusError: {
    color: COLORS.error.main,
    backgroundColor: `${COLORS.error.main}20`,
    padding: '4px 12px',
    borderRadius: BORDER_RADIUS.pill,
    fontSize: '0.875rem',
    fontWeight: 500,
  },

  // Navigation styles
  navItem: {
    padding: '12px 16px',
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: '4px',
    color: COLORS.text.primary,
    '&:hover': {
      backgroundColor: COLORS.grey[100],
    },
  } as React.CSSProperties,

  navItemActive: {
    backgroundColor: COLORS.primary.main,
    color: COLORS.primary.contrastText,
    '&:hover': {
      backgroundColor: COLORS.primary.dark,
    },
  } as React.CSSProperties,

  // Table styles
  tableHeader: {
    backgroundColor: COLORS.grey[50],
    fontWeight: 600,
    color: COLORS.text.primary,
    borderBottom: `2px solid ${COLORS.grey[200]}`,
  },

  tableRow: {
    '&:hover': {
      backgroundColor: COLORS.grey[50],
    },
    '&:nth-of-type(even)': {
      backgroundColor: COLORS.grey[50] || '#fafafa',
    },
  } as React.CSSProperties,

  // Modal styles
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  },

  modalContent: {
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.modal,
    padding: '32px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },

  // Loading styles
  loadingSpinner: {
    color: COLORS.primary.main,
  },

  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },

  // Responsive utilities
  hideOnMobile: {
    '@media (max-width: 768px)': {
      display: 'none',
    },
  } as React.CSSProperties,

  hideOnDesktop: {
    '@media (min-width: 769px)': {
      display: 'none',
    },
  } as React.CSSProperties,

  responsiveGrid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  },

  // Animation utilities
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  } as React.CSSProperties,

  slideUp: {
    animation: 'slideUp 0.3s ease-out',
    '@keyframes slideUp': {
      from: {
        opacity: 0,
        transform: 'translateY(20px)'
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)'
      },
    },
  } as React.CSSProperties,

  // Utility classes
  textCenter: {
    textAlign: 'center',
  },

  textLeft: {
    textAlign: 'left',
  },

  textRight: {
    textAlign: 'right',
  },

  fullWidth: {
    width: '100%',
  },

  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  marginBottom: {
    marginBottom: '24px',
  },

  marginTop: {
    marginTop: '24px',
  },

  paddingAll: {
    padding: '24px',
  },
};

export default globalStyles;