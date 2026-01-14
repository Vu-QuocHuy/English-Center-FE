// Color palette cho English Center Application

export interface ColorPalette {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
  text?: string;
}

export interface GreyPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
  hint: string;
}

export interface BackgroundColors {
  default: string;
  paper: string;
  light: string;
  dark: string;
}

export interface ActionColors {
  active: string;
  hover: string;
  selected: string;
  disabled: string;
  disabledBackground: string;
}

export interface CommonColors {
  black: string;
  white: string;
}

export interface Colors {
  primary: ColorPalette;
  secondary: ColorPalette;
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
  grey: GreyPalette;
  text: TextColors;
  background: BackgroundColors;
  action: ActionColors;
  divider: string;
  common: CommonColors;
}

export const COLORS: Colors = {
  // Primary Colors
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
    text: '#1a1a1a'
  },

  // Secondary Colors
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#ffffff'
  },

  // Success Colors
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff'
  },

  // Warning Colors
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff'
  },

  // Error Colors
  error: {
    main: '#d32f2f',
    light: '#f44336',
    dark: '#c62828',
    contrastText: '#ffffff'
  },

  // Info Colors
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff'
  },

  // Grey Palette
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },

  // Text Colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)'
  },

  // Background Colors
  background: {
    default: '#ffffff',
    paper: '#ffffff',
    light: '#fafafa',
    dark: '#f5f5f5'
  },

  // Action Colors
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)'
  },

  // Divider
  divider: 'rgba(0, 0, 0, 0.12)',

  // Common Colors
  common: {
    black: '#000000',
    white: '#ffffff'
  }
};

// Component specific colors
export interface ComponentColors {
  header: {
    background: string;
    text: string;
    border: string;
  };
  sidebar: {
    background: string;
    text: string;
    activeBackground: string;
    activeText: string;
    hoverBackground: string;
  };
  card: {
    background: string;
    border: string;
    shadow: string;
  };
  button: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
  status: {
    active: string;
    inactive: string;
    pending: string;
    blocked: string;
    draft: string;
  };
  role: {
    admin: string;
    teacher: string;
    student: string;
    parent: string;
  };
  grade: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
  };
  chart: {
    primary: string[];
    success: string[];
    warning: string[];
    error: string[];
  };
}

export const COMPONENT_COLORS: ComponentColors = {
  // Header/Navigation
  header: {
    background: COLORS.primary.main,
    text: COLORS.common.white,
    border: COLORS.primary.dark
  },

  // Sidebar
  sidebar: {
    background: COLORS.common.white,
    text: COLORS.text.primary,
    activeBackground: COLORS.primary.light,
    activeText: COLORS.common.white,
    hoverBackground: COLORS.grey[100]
  },

  // Cards
  card: {
    background: COLORS.common.white,
    border: COLORS.grey[200],
    shadow: 'rgba(0, 0, 0, 0.1)'
  },

  // Buttons
  button: {
    primary: COLORS.primary.main,
    secondary: COLORS.secondary.main,
    success: COLORS.success.main,
    warning: COLORS.warning.main,
    error: COLORS.error.main
  },

  // Status Colors
  status: {
    active: COLORS.success.main,
    inactive: COLORS.grey[500],
    pending: COLORS.warning.main,
    blocked: COLORS.error.main,
    draft: COLORS.info.main
  },

  // Role Colors
  role: {
    admin: COLORS.error.main,
    teacher: COLORS.primary.main,
    student: COLORS.success.main,
    parent: COLORS.warning.main
  },

  // Grade Colors
  grade: {
    excellent: COLORS.success.main,  // 9-10
    good: COLORS.info.main,         // 7-8
    average: COLORS.warning.main,   // 5-6
    poor: COLORS.error.main         // 0-4
  },

  // Chart Colors
  chart: {
    primary: [
      '#1976d2', '#42a5f5', '#1565c0', '#0d47a1',
      '#2196f3', '#64b5f6', '#1976d2', '#0277bd'
    ],
    success: [
      '#2e7d32', '#4caf50', '#66bb6a', '#81c784',
      '#a5d6a7', '#c8e6c9', '#e8f5e8', '#f1f8e9'
    ],
    warning: [
      '#ed6c02', '#ff9800', '#ffb74d', '#ffcc02',
      '#ffd54f', '#ffe082', '#ffecb3', '#fff8e1'
    ],
    error: [
      '#d32f2f', '#f44336', '#ef5350', '#e57373',
      '#ef9a9a', '#ffcdd2', '#ffebee', '#fce4ec'
    ]
  }
};

// Gradient Colors
export interface Gradients {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  sunset: string;
  ocean: string;
  forest: string;
  night: string;
}

export const GRADIENTS: Gradients = {
  primary: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
  secondary: `linear-gradient(135deg, ${COLORS.secondary.main} 0%, ${COLORS.secondary.light} 100%)`,
  success: `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.light} 100%)`,
  warning: `linear-gradient(135deg, ${COLORS.warning.main} 0%, ${COLORS.warning.light} 100%)`,
  error: `linear-gradient(135deg, ${COLORS.error.main} 0%, ${COLORS.error.light} 100%)`,
  info: `linear-gradient(135deg, ${COLORS.info.main} 0%, ${COLORS.info.light} 100%)`,

  // Special gradients
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
  ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  forest: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  night: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
};

// Shadow variations
export interface Shadows {
  card: string;
  hover: string;
  active: string;
  modal: string;
  dropdown: string;
}

export const SHADOWS: Shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.1)',
  hover: '0 4px 16px rgba(0, 0, 0, 0.15)',
  active: '0 1px 4px rgba(0, 0, 0, 0.12)',
  modal: '0 8px 32px rgba(0, 0, 0, 0.24)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)'
};

// Border radius
export interface BorderRadius {
  small: string;
  medium: string;
  large: string;
  round: string;
  pill: string;
}

export const BORDER_RADIUS: BorderRadius = {
  small: '4px',
  medium: '8px',
  large: '12px',
  round: '50%',
  pill: '9999px'
};

// Z-index levels
export interface ZIndex {
  dropdown: number;
  sticky: number;
  fixed: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

export const Z_INDEX: ZIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070
};

export default COLORS;
