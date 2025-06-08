// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: 'rgba(76, 175, 80, 0.1)',
      dark: '#2e7d32',
    },
    warning: {
      main: '#ff9800',
      light: 'rgba(255, 152, 0, 0.1)',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: 'rgba(244, 67, 54, 0.1)',
      dark: '#d32f2f',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
      fontWeight: 700,
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
      fontSize: '1.1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 4px 6px rgba(0,0,0,0.1)',
    '0 4px 20px rgba(0,0,0,0.1)',
    '0 8px 25px rgba(0,0,0,0.12)',
    '0 12px 40px rgba(0,0,0,0.15)',
    '0 16px 50px rgba(0,0,0,0.18)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        },
        elevation1: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#42a5f5',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
  },
});

// Custom gradient utilities
theme.gradients = {
  primary: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
  secondary: 'linear-gradient(45deg, #dc004e 30%, #f48fb1 90%)',
  success: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
  warning: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
  info: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  blue: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  sunset: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
};

export default theme;
