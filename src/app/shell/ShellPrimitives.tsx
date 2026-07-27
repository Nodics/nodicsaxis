import { Alert, Box, Snackbar } from '@mui/material';
import type { PropsWithChildren } from 'react';

import { axisTokens } from '../axisTheme';

interface WorkspaceContainerProps {
  readonly horizontalPadding?: number | string;
  readonly verticalPadding?: number | string;
}

export function WorkspaceContainer({
  children,
  horizontalPadding,
  verticalPadding,
}: PropsWithChildren<WorkspaceContainerProps>) {
  return (
    <Box
      sx={{
        mx: 'auto',
        maxWidth: axisTokens.spacing.contentMaxWidth,
        px:
          horizontalPadding ??
          ({
            xs: `${String(axisTokens.spacing.pageGutter.mobile)}px`,
            sm: `${String(axisTokens.spacing.pageGutter.tablet)}px`,
            lg: `${String(axisTokens.spacing.pageGutter.desktop)}px`,
          } as const),
        py:
          verticalPadding ??
          ({
            xs: `${String(axisTokens.spacing.pageGutter.tablet)}px`,
            lg: `${String(axisTokens.spacing.pageGutter.desktop)}px`,
          } as const),
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
}

interface NotificationRegionProps {
  readonly message: string | null;
  readonly severity?: 'success' | 'info' | 'warning' | 'error';
  readonly onClose: () => void;
}

export function NotificationRegion({
  message,
  onClose,
  severity = 'info',
}: NotificationRegionProps) {
  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      autoHideDuration={6000}
      open={Boolean(message)}
      onClose={onClose}
    >
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
