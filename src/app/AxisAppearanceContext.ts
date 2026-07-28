import type { PaletteMode } from '@mui/material/styles';
import { createContext, use } from 'react';

export interface AxisAppearance {
  readonly mode: PaletteMode;
  readonly toggleMode: () => void;
}

export const AxisAppearanceContext = createContext<AxisAppearance | null>(null);

export function useAxisAppearance(): AxisAppearance {
  const value = use(AxisAppearanceContext);
  if (!value) {
    throw new Error('useAxisAppearance must be used inside AxisThemeProvider');
  }
  return value;
}
