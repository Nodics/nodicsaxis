import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import { type PropsWithChildren, useMemo, useState } from 'react';

import { AxisAppearanceContext } from './AxisAppearanceContext';
import { createAxisTheme } from './axisTheme';

export function AxisThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<PaletteMode>('light');
  const theme = useMemo(() => createAxisTheme(mode), [mode]);
  const appearance = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((current) => (current === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode],
  );

  return (
    <AxisAppearanceContext value={appearance}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AxisAppearanceContext>
  );
}
