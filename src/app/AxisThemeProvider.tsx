import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import { type PropsWithChildren, useMemo, useState } from 'react';

import { AxisAppearanceContext } from './AxisAppearanceContext';
import { createAxisTheme, type AxisDensity } from './axisTheme';

export function AxisThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<PaletteMode>('light');
  const [density, setDensity] = useState<AxisDensity>('comfortable');
  const theme = useMemo(() => createAxisTheme(mode, density), [density, mode]);
  const appearance = useMemo(
    () => ({
      mode,
      density,
      toggleMode: () => {
        setMode((current) => (current === 'light' ? 'dark' : 'light'));
      },
      toggleDensity: () => {
        setDensity((current) =>
          current === 'comfortable' ? 'compact' : 'comfortable',
        );
      },
    }),
    [density, mode],
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
