import { useCallback, useEffect, useState } from 'react';

import { loadRuntimeConfig } from '../runtime/loadRuntimeConfig';
import type { AxisRuntimeConfig } from '../runtime/runtimeConfig';
import { App } from './App';
import { AppProviders } from './AppProviders';
import { AxisThemeProvider } from './AxisThemeProvider';
import { LoadingScreen } from './LoadingScreen';
import { RecoveryScreen } from './RecoveryScreen';

type BootstrapState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly config: AxisRuntimeConfig }
  | { readonly status: 'failed'; readonly message: string };

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Axis runtime configuration failed unexpectedly';
}

export function AxisBootstrap() {
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    void loadRuntimeConfig()
      .then((config) => {
        if (active) {
          setState({ status: 'ready', config });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ status: 'failed', message: errorMessage(error) });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  if (state.status === 'loading') {
    return (
      <AxisThemeProvider>
        <LoadingScreen />
      </AxisThemeProvider>
    );
  }

  if (state.status === 'failed') {
    return (
      <AxisThemeProvider>
        <RecoveryScreen message={state.message} onRetry={retry} />
      </AxisThemeProvider>
    );
  }

  return (
    <AppProviders runtimeConfig={state.config}>
      <App />
    </AppProviders>
  );
}
