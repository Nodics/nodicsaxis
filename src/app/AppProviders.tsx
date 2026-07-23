import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { BrowserRouter } from 'react-router';

import { RuntimeConfigContext } from '../runtime/RuntimeConfigContext';
import type { AxisRuntimeConfig } from '../runtime/runtimeConfig';
import { AxisThemeProvider } from './AxisThemeProvider';

interface AppProvidersProps extends PropsWithChildren {
  readonly runtimeConfig: AxisRuntimeConfig;
}

export function AppProviders({ children, runtimeConfig }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 30_000,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <RuntimeConfigContext value={runtimeConfig}>
      <QueryClientProvider client={queryClient}>
        <AxisThemeProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </AxisThemeProvider>
      </QueryClientProvider>
    </RuntimeConfigContext>
  );
}
