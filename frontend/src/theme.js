import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B4D24',
      light: '#2E7D32',
      dark: '#113518',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5D4037',
      light: '#795548',
      dark: '#3E2723',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: 'rgba(15, 23, 42, 0.08)',
    success: { main: '#2E7D32', light: '#4CAF50', dark: '#1B5E20' },
    warning: { main: '#F57C00', light: '#FFA726', dark: '#E65100' },
    error: { main: '#D32F2F', light: '#EF5350', dark: '#C62828' },
    info: { main: '#0284C7', light: '#38BDF8', dark: '#0369A1' },
    dimensao: {
      economica: '#0284C7',
      ambiental: '#1B4D24',
      social: '#F57C00',
      gestao: '#7E22CE',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.025em', color: '#0F172A' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' },
    h6: { fontWeight: 600, letterSpacing: '-0.015em', color: '#0F172A' },
    subtitle1: { fontWeight: 600, letterSpacing: '-0.01em', color: '#1E293B' },
    subtitle2: { fontWeight: 600, letterSpacing: '-0.005em' },
    body1: { lineHeight: 1.6, color: '#334155' },
    body2: { lineHeight: 1.5, color: '#475569' },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
          borderRadius: 10,
          backgroundImage: 'none',
          transition: 'box-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1), border-color 180ms ease',
          '&:hover': {
            boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          transition: 'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
          '&:focus-visible': {
            outline: '2px solid #1B4D24',
            outlineOffset: '2px',
          },
        },
        containedPrimary: {
          backgroundColor: '#1B4D24',
          color: '#FFFFFF',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '&:hover': {
            backgroundColor: '#143B1B',
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderColor: 'rgba(15, 23, 42, 0.18)',
          '&:hover': {
            borderColor: '#1B4D24',
            backgroundColor: 'rgba(27, 77, 36, 0.04)',
          },
        },
        sizeLarge: {
          padding: '10px 22px',
          fontSize: '0.95rem',
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8FAFC',
          '& .MuiTableCell-head': {
            color: '#475569',
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          padding: '13px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#122A16',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            '& fieldset': {
              borderColor: 'rgba(15, 23, 42, 0.16)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(15, 23, 42, 0.32)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1B4D24',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          padding: '0 0 20px 0',
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          fontSize: '2rem',
          color: '#CBD5E1',
          '&.Mui-active': {
            color: '#1B4D24',
          },
          '&.Mui-completed': {
            color: '#2E7D32',
          },
        },
      },
    },
  },
});

export default theme;
