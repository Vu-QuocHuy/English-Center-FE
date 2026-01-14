import { SxProps, Theme } from '@mui/material/styles';
import { COLORS } from './colors';

export interface CommonStyles {
  pageContainer: SxProps<Theme>;
  contentContainer: SxProps<Theme>;
  container: SxProps<Theme>;
  contentWrapper: SxProps<Theme>;
  pageHeader: SxProps<Theme>;
  pageTitle: SxProps<Theme>;
  tableContainer: SxProps<Theme>;
  tableRow: SxProps<Theme>;
  actionCell: SxProps<Theme>;
  formContainer: SxProps<Theme>;
  formGrid: SxProps<Theme>;
  formField: SxProps<Theme>;
  formActions: SxProps<Theme>;
  primaryButton: SxProps<Theme>;
  secondaryButton: SxProps<Theme>;
  dialogTitle: SxProps<Theme>;
  dialogContent: SxProps<Theme>;
  searchContainer: SxProps<Theme>;
  searchField: SxProps<Theme>;
  filterSelect: SxProps<Theme>;
}

export const commonStyles: CommonStyles = {
  // Layout styles
  pageContainer: {
    minHeight: '100vh',
    background: '#f7f9fb',
    paddingLeft: '3vw',
    paddingRight: '3vw',
    boxSizing: 'border-box',
  },
  contentContainer: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    p: 5,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  contentWrapper: {
    backgroundColor: 'white',
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: 3,
    marginTop: 2,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: COLORS.text.primary,
  },

  // Table styles
  tableContainer: {
    mt: 2,
    '& .MuiTableCell-head': {
      backgroundColor: '#f8f9fa',
      fontWeight: 600,
      color: COLORS.text.primary,
      whiteSpace: 'nowrap',
    },
    '& .MuiTableCell-body': {
      fontSize: '0.875rem',
    },
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  actionCell: {
    width: '120px',
    textAlign: 'center',
  },

  // Form styles
  formContainer: {
    p: 5,
  },
  formGrid: {
    mt: 2,
  },
  formField: {
    mb: 2,
  },
  formActions: {
    mt: 3,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
  },

  // Button styles
  primaryButton: {
    bgcolor: COLORS.primary.main,
    color: 'white',
    '&:hover': {
      bgcolor: COLORS.primary.dark,
    },
  },
  secondaryButton: {
    bgcolor: 'white',
    color: COLORS.text.primary,
    border: '1px solid #ddd',
    '&:hover': {
      bgcolor: '#f5f5f5',
    },
  },

  // Dialog styles
  dialogTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: COLORS.text.primary,
    pb: 2,
  },
  dialogContent: {
    minWidth: '500px',
  },

  // Search and filter styles
  searchContainer: {
    mb: 3,
    p: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  searchField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
    },
  },
  filterSelect: {
    minWidth: '200px',
  },
};
