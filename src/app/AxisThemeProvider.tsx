import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import type { PropsWithChildren } from 'react';

const axisTheme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#2346a0',
        },
        secondary: {
          main: '#00796b',
        },
        background: {
          default: '#f4f6fa',
          paper: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#9bb4ff',
        },
        secondary: {
          main: '#74d8c8',
        },
      },
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export function AxisThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={axisTheme} defaultMode="system">
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
