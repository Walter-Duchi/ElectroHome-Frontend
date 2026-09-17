import { createTheme, type Theme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

const corporateColorsLight = {
  mode: 'light' as const,
  primary: { main: '#0056b3', light: '#4d84d6', dark: '#003b82', contrastText: '#ffffff' },
  secondary: { main: '#28a745', light: '#5fd85f', dark: '#007a2e', contrastText: '#ffffff' },
  error: { main: '#dc3545', light: '#e57373', dark: '#c62828' },
  warning: { main: '#ffc107', light: '#ffd54f', dark: '#ff8f00' },
  info: { main: '#17a2b8', light: '#4fc3f7', dark: '#0288d1' },
  success: { main: '#28a745', light: '#81c784', dark: '#388e3c' },
  background: { default: '#f8f9fa', paper: '#ffffff' },
  text: { primary: '#212529', secondary: '#6c757d', disabled: '#adb5bd' },
  grey: {
    50: '#f8f9fa', 100: '#e9ecef', 200: '#dee2e6', 300: '#ced4da', 400: '#adb5bd',
    500: '#6c757d', 600: '#495057', 700: '#343a40', 800: '#212529', 900: '#121416',
  },
  divider: '#e9ecef',
  action: {
    active: '#495057', hover: 'rgba(0, 86, 179, 0.04)',
    selected: 'rgba(0, 86, 179, 0.08)', disabled: '#adb5bd',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
};

const corporateColorsDark = {
  mode: 'dark' as const,
  primary: { main: '#4d84d6', light: '#7ab2ff', dark: '#0056b3', contrastText: '#ffffff' },
  secondary: { main: '#5fd85f', light: '#8eff8e', dark: '#28a745', contrastText: '#ffffff' },
  error: { main: '#ff6b6b', light: '#ff9e9e', dark: '#dc3545' },
  warning: { main: '#ffd54f', light: '#ffe082', dark: '#ffc107' },
  info: { main: '#4fc3f7', light: '#8bf6ff', dark: '#17a2b8' },
  success: { main: '#81c784', light: '#a5d6a7', dark: '#28a745' },
  background: { default: '#121416', paper: '#1e2125' },
  text: { primary: '#e9ecef', secondary: '#adb5bd', disabled: '#6c757d' },
  grey: {
    50: '#121416', 100: '#1e2125', 200: '#2a2e33', 300: '#3a3f45', 400: '#495057',
    500: '#6c757d', 600: '#adb5bd', 700: '#ced4da', 800: '#e9ecef', 900: '#ffffff',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: '#e9ecef', hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
};

const corporateTypography = {
  fontFamily: [
    'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
    '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"',
  ].join(','),
  htmlFontSize: 16,
  fontSize: 14,
  fontWeightLight: 300, fontWeightRegular: 400, fontWeightMedium: 500, fontWeightBold: 600,
  h1: { fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01562em' },
  h2: { fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.00833em' },
  h3: { fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)', fontWeight: 600, lineHeight: 1.4 },
  h4: { fontSize: 'clamp(1.15rem, 3vw, 1.5rem)', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: 'clamp(1.05rem, 2.4vw, 1.25rem)', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: 'clamp(0.95rem, 2vw, 1rem)', fontWeight: 600, lineHeight: 1.4 },
  subtitle1: { fontSize: 'clamp(0.9rem, 1.9vw, 1rem)', fontWeight: 500, lineHeight: 1.75 },
  subtitle2: { fontSize: 'clamp(0.8rem, 1.7vw, 0.875rem)', fontWeight: 500, lineHeight: 1.57 },
  body1: { fontSize: 'clamp(0.875rem, 1.8vw, 1rem)', lineHeight: 1.6 },
  body2: { fontSize: 'clamp(0.75rem, 1.6vw, 0.875rem)', lineHeight: 1.6 },
  button: { fontSize: 'clamp(0.75rem, 1.6vw, 0.875rem)', fontWeight: 600, textTransform: 'none', letterSpacing: '0.02857em' },
  caption: { fontSize: 'clamp(0.65rem, 1.4vw, 0.75rem)', lineHeight: 1.66 },
  overline: { fontSize: '0.75rem', fontWeight: 600, lineHeight: 2.66, letterSpacing: '0.08333em', textTransform: 'uppercase' },
};

const getComponents = (palette: typeof corporateColorsLight | typeof corporateColorsDark) => ({
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale',
        boxSizing: 'border-box', WebkitTextSizeAdjust: '100%', msTextSizeAdjust: '100%',
        scrollBehavior: 'smooth',
      },
      '*, *::before, *::after': { boxSizing: 'inherit', margin: 0, padding: 0 },
      body: {
        margin: 0, fontFamily: corporateTypography.fontFamily, fontSize: '14px',
        lineHeight: '1.6', overflowX: 'hidden',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        backgroundColor: palette.background.default,
        color: palette.text.primary,
      },
      '#root': { minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' },
      a: { textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
      img: { maxWidth: '100%', height: 'auto', display: 'block' },
      'input, button, textarea, select': { fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' },
      '::-webkit-scrollbar': { width: '10px', height: '10px' },
      '::-webkit-scrollbar-track': { background: palette.grey[100] },
      '::-webkit-scrollbar-thumb': {
        borderRadius: '5px',
        background: palette.grey[400],
        '&:hover': { background: palette.grey[500] },
      },
      scrollbarColor: `${palette.grey[400]} ${palette.grey[100]}`,
    },
  },
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: '16px', paddingRight: '16px',
        '@media (min-width:600px)': { paddingLeft: '24px', paddingRight: '24px' },
      },
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: '56px', paddingLeft: '12px', paddingRight: '12px',
        '@media (min-width:600px)': { minHeight: '64px', paddingLeft: '16px', paddingRight: '16px' },
      },
      gutters: {
        paddingLeft: '12px', paddingRight: '12px',
        '@media (min-width:600px)': { paddingLeft: '24px', paddingRight: '24px' },
      },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: '8px', textTransform: 'none', fontWeight: 600,
        padding: '8px 16px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '40px', fontSize: '0.8125rem',
        '@media (min-width:600px)': { padding: '8px 24px', fontSize: '0.875rem' },
        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
        '&:active': { transform: 'translateY(0)' },
      },
      sizeSmall: {
        padding: '6px 12px', minHeight: '32px', fontSize: '0.75rem',
        '@media (min-width:600px)': { padding: '6px 16px', fontSize: '0.8125rem' },
      },
      sizeLarge: {
        padding: '10px 20px', minHeight: '44px', fontSize: '0.875rem',
        '@media (min-width:600px)': { padding: '10px 32px', minHeight: '48px', fontSize: '0.9375rem' },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined' as const,
      fullWidth: true,
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' },
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid', overflow: 'hidden',
        '&:hover': { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)', transform: 'translateY(-2px)' },
      },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: { root: { backgroundImage: 'none', borderRadius: '12px' } },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: 'default' as const },
    styleOverrides: { root: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' } },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '8px', alignItems: 'center', padding: '10px 12px', fontSize: '0.8125rem',
        '@media (min-width:600px)': { padding: '12px 16px', fontSize: '0.875rem' },
      },
      icon: { alignItems: 'center' },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px', margin: '12px', overflow: 'hidden',
        width: 'calc(100% - 24px)', maxHeight: 'calc(100vh - 24px)',
        '@media (min-width:600px)': { margin: '16px', width: 'auto' },
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '8px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid', marginTop: '8px',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: '6px', fontWeight: 500, height: 'auto', minHeight: '28px', fontSize: '0.75rem' },
    },
  },
  MuiTable: { styleOverrides: { root: { minWidth: '600px' } } },
  MuiTableContainer: {
    styleOverrides: {
      root: {
        overflowX: 'auto' as const,
        WebkitOverflowScrolling: 'touch' as const,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '8px 10px', fontSize: '0.8125rem', whiteSpace: 'nowrap',
        '@media (min-width:600px)': { padding: '16px', fontSize: '0.875rem' },
      },
      head: { fontWeight: 600 },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: '42px' },
      flexContainer: { overflowX: 'auto' as const, flexWrap: 'nowrap' as const },
      scrollButtons: { display: 'none', '@media (max-width:600px)': { display: 'inline-flex' } },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: '42px', padding: '6px 12px', fontSize: '0.75rem', minWidth: 'auto',
        textTransform: 'none',
        '@media (min-width:600px)': { padding: '12px 16px', fontSize: '0.875rem', minWidth: '90px' },
      },
    },
  },
  MuiAccordionSummary: { styleOverrides: { content: { flexWrap: 'wrap' as const, gap: '8px' } } },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.05rem', padding: '12px 16px',
        '@media (min-width:600px)': { fontSize: '1.25rem', padding: '16px 24px' },
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: { padding: '12px 16px', '@media (min-width:600px)': { padding: '20px 24px' } },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '10px 16px', flexWrap: 'wrap' as const, gap: '8px',
        '& > :not(style) ~ :not(style)': { marginLeft: 0 },
        '@media (min-width:600px)': {
          padding: '8px 24px', gap: 0,
          '& > :not(style) ~ :not(style)': { marginLeft: '8px' },
        },
      },
    },
  },
});

const breakpoints = { values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 } };

const shadowsLight: Theme['shadows'] = [
  'none',
  '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  '0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1)',
  '0 14px 28px rgba(0,0,0,0.12), 0 10px 10px rgba(0,0,0,0.08)',
  '0 19px 38px rgba(0,0,0,0.14), 0 15px 12px rgba(0,0,0,0.06)',
  '0 24px 48px rgba(0,0,0,0.16), 0 20px 20px rgba(0,0,0,0.08)',
  ...Array(18).fill('none'),
] as Theme['shadows'];

const shadowsDark: Theme['shadows'] = [
  'none',
  '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
  '0 3px 6px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.5)',
  '0 10px 20px rgba(0,0,0,0.3), 0 6px 6px rgba(0,0,0,0.2)',
  '0 14px 28px rgba(0,0,0,0.35), 0 10px 10px rgba(0,0,0,0.25)',
  '0 19px 38px rgba(0,0,0,0.4), 0 15px 12px rgba(0,0,0,0.3)',
  '0 24px 48px rgba(0,0,0,0.45), 0 20px 20px rgba(0,0,0,0.35)',
  ...Array(18).fill('none'),
] as Theme['shadows'];

const baseShape = {
  breakpoints, shape: { borderRadius: 8 }, spacing: 8,
  transitions: {
    duration: {
      shortest: 150, shorter: 200, short: 250, standard: 300,
      complex: 375, enteringScreen: 225, leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  zIndex: {
    mobileStepper: 1000, speedDial: 1050, appBar: 1100, drawer: 1200,
    modal: 1300, snackbar: 1400, tooltip: 1500,
  },
};

export const corporateTheme: Theme = createTheme(
  {
    palette: corporateColorsLight,
    typography: corporateTypography,
    components: getComponents(corporateColorsLight),
    ...baseShape,
    shadows: shadowsLight,
  },
  esES
);

export const darkTheme: Theme = createTheme(
  {
    palette: corporateColorsDark,
    typography: corporateTypography,
    components: getComponents(corporateColorsDark),
    ...baseShape,
    shadows: shadowsDark,
  },
  esES
);

export const getTheme = (mode: 'light' | 'dark') => (mode === 'light' ? corporateTheme : darkTheme);
export type ThemeMode = 'light' | 'dark' | 'auto';

export const themeUtils = {
  getSpacing: (multiple: number) => `${multiple * 8}px`,
  getTransition: (property = 'all') => `${property} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
  getBorderRadius: (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    const sizes = { sm: '4px', md: '8px', lg: '12px', xl: '16px' };
    return sizes[size];
  },
  getBoxShadow: (level: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1, mode: 'light' | 'dark' = 'light') =>
    mode === 'light' ? shadowsLight[level] : shadowsDark[level],
};

export default corporateTheme;
