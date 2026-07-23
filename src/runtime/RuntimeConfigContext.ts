import { createContext, useContext } from 'react';

import type { AxisRuntimeConfig } from './runtimeConfig';

export const RuntimeConfigContext = createContext<AxisRuntimeConfig | null>(null);

export function useRuntimeConfig(): AxisRuntimeConfig {
  const config = useContext(RuntimeConfigContext);
  if (!config) {
    throw new Error('Axis runtime configuration is not available');
  }
  return config;
}
