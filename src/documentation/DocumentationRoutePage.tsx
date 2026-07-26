import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { CmsRoutePage } from '../app/CmsRoutePage';
import { WorkspaceContainer } from '../app/shell/ShellPrimitives';
import type { AxisModuleConnection } from '../bootstrap/publicBootstrap';
import type { AxisRuntimeConfig } from '../runtime/runtimeConfig';
import { createDocumentationContentPackClient } from './api/documentationContentPackClient';

interface DocumentationRoutePageProps {
  readonly accessToken: string;
  readonly channel: string;
  readonly cmsBaseUrl: string;
  readonly connection: AxisModuleConnection;
  readonly locale: string;
  readonly path: string;
  readonly runtime: AxisRuntimeConfig;
  readonly site: string;
}

const queryKey = (enterpriseCode: string) =>
  ['documentation-content-pack', enterpriseCode, 'nodicsDocumentation'] as const;

export function DocumentationRoutePage(props: DocumentationRoutePageProps) {
  const queryClient = useQueryClient();
  const client = useMemo(
    () =>
      createDocumentationContentPackClient({
        connection: props.connection,
        enterpriseCode: props.runtime.enterpriseCode,
        accessToken: props.accessToken,
        timeoutMs: props.runtime.requestTimeoutMs,
      }),
    [
      props.accessToken,
      props.connection,
      props.runtime.enterpriseCode,
      props.runtime.requestTimeoutMs,
    ],
  );
  const status = useQuery({
    queryKey: queryKey(props.runtime.enterpriseCode),
    queryFn: client.getStatus,
    refetchInterval: (query) =>
      query.state.data?.state === 'IMPORTING' ? 2_000 : false,
  });
  const importContent = useMutation({
    mutationFn: client.importOrUpdate,
    onSuccess: (nextStatus) => {
      queryClient.setQueryData(queryKey(props.runtime.enterpriseCode), nextStatus);
    },
  });

  if (
    status.data?.installedVersion &&
    ['CURRENT', 'UPDATE_AVAILABLE'].includes(status.data.state)
  ) {
    const updateAvailable = status.data.state === 'UPDATE_AVAILABLE';
    return (
      <Stack spacing={2}>
        {updateAvailable ? (
          <Alert
            action={
              <Button
                disabled={importContent.isPending}
                onClick={() => importContent.mutate()}
                size="small"
                variant="outlined"
              >
                {importContent.isPending
                  ? 'Updating…'
                  : status.data.presentation.updateAction}
              </Button>
            }
            severity={importContent.isError ? 'error' : 'info'}
          >
            {importContent.error instanceof Error
              ? importContent.error.message
              : `Documentation version ${String(status.data.availableVersion)} is available.`}
          </Alert>
        ) : null}
        <CmsRoutePage
          accessToken={props.accessToken}
          channel={props.channel}
          cmsBaseUrl={props.cmsBaseUrl}
          enterpriseCode={props.runtime.enterpriseCode}
          locale={props.locale}
          path={props.path}
          site={props.site}
          timeoutMs={props.runtime.requestTimeoutMs}
        />
      </Stack>
    );
  }

  const presentation = status.data?.presentation;
  const operation = status.data?.allowedOperations[0];
  const actionLabel =
    operation === 'UPDATE' ? presentation?.updateAction : presentation?.importAction;
  const error =
    status.error instanceof Error
      ? status.error.message
      : importContent.error instanceof Error
        ? importContent.error.message
        : undefined;

  return (
    <WorkspaceContainer>
      <Box component="section" aria-label="Documentation availability">
        <Stack spacing={3} sx={{ maxWidth: 760 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip label="Wiki" size="small" variant="outlined" />
              {status.data ? (
                <Chip
                  color={
                    status.data.state === 'UPDATE_AVAILABLE' ? 'warning' : 'default'
                  }
                  label={status.data.state.replaceAll('_', ' ')}
                  size="small"
                />
              ) : null}
            </Stack>
            <Typography component="h1" variant="h2">
              {presentation?.title ?? 'Nodics documentation'}
            </Typography>
            <Typography color="text.secondary">
              {status.data?.state === 'DISABLED'
                ? presentation?.disabledMessage
                : (presentation?.unavailableMessage ??
                  'Checking documentation availability.')}
            </Typography>
          </Stack>

          {status.isPending ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <CircularProgress aria-label="Checking documentation" size={24} />
              <Typography>Checking documentation availability…</Typography>
            </Stack>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}

          {status.data?.state === 'SOURCE_UNAVAILABLE' ? (
            <Alert severity="warning">
              The configured documentation release could not be validated. Contact an
              administrator or retry after the source is available.
            </Alert>
          ) : null}

          {operation ? (
            <Box>
              <Button
                disabled={importContent.isPending}
                onClick={() => importContent.mutate()}
                size="large"
                variant="contained"
              >
                {importContent.isPending ? 'Importing documentation…' : actionLabel}
              </Button>
            </Box>
          ) : null}

          {error ? (
            <Box>
              <Button
                onClick={() => {
                  importContent.reset();
                  void status.refetch();
                }}
                variant="outlined"
              >
                {presentation?.retryAction ?? 'Retry'}
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </WorkspaceContainer>
  );
}
