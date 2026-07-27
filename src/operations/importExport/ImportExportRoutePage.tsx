import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { WorkspaceContainer } from '../../app/shell/ShellPrimitives';
import {
  selectModuleConnection,
  type AxisAuthenticatedBootstrap,
} from '../../bootstrap/publicBootstrap';
import type { AxisRuntimeConfig } from '../../runtime/runtimeConfig';
import {
  installDataReleases,
  loadDataReleases,
  loadImportHistory,
  preflightDataReleases,
  type DataReleaseClientConfiguration,
} from './api/dataReleaseClient';
import type {
  DataRelease,
  DataReleasePlan,
  DataReleaseType,
} from './api/dataReleaseContracts';

interface ImportExportRoutePageProps {
  readonly accessToken: string;
  readonly bootstrap: AxisAuthenticatedBootstrap;
  readonly runtime: AxisRuntimeConfig;
}

const typeCopy: Record<
  DataReleaseType,
  { readonly label: string; readonly help: string; readonly warning: string }
> = {
  init: {
    label: 'Initialization data',
    help: 'Required bootstrap identities and records needed before dependent capabilities can operate.',
    warning:
      'Initialization data is security-sensitive. Validate it before installation.',
  },
  core: {
    label: 'Core data',
    help: 'Governed baseline business and configuration records contributed by active modules.',
    warning:
      'Install after adding modules or deploying a new immutable core-data release.',
  },
  sample: {
    label: 'Sample data',
    help: 'Optional demonstration records intended for permitted non-production environments.',
    warning: 'Never use sample data as production business data.',
  },
};

function createPlan(
  type: DataReleaseType,
  releases: readonly DataRelease[],
): DataReleasePlan {
  return Object.freeze({
    dataType: type,
    modules: Object.freeze(releases.map((release) => release.moduleName)),
    expectedReleases: Object.freeze(
      Object.fromEntries(
        releases.map((release) => [release.moduleName, release.version]),
      ),
    ),
  });
}

export function ImportExportRoutePage(props: ImportExportRoutePageProps) {
  const [tab, setTab] = useState<DataReleaseType | 'history' | 'exports'>('init');
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const queryClient = useQueryClient();
  const connection = selectModuleConnection(props.bootstrap, 'import');
  const configuration = useMemo<DataReleaseClientConfiguration>(
    () => ({
      accessToken: props.accessToken,
      enterpriseCode: props.runtime.enterpriseCode,
      timeoutMs: props.runtime.requestTimeoutMs,
    }),
    [props.accessToken, props.runtime.enterpriseCode, props.runtime.requestTimeoutMs],
  );
  const catalogue = useQuery({
    queryKey: ['data-releases', props.runtime.enterpriseCode],
    queryFn: () => {
      if (!connection) throw new Error('Import service is unavailable');
      return loadDataReleases(connection, configuration);
    },
    enabled: Boolean(connection),
  });
  const history = useQuery({
    queryKey: ['import-history', props.runtime.enterpriseCode],
    queryFn: () => {
      if (!connection) throw new Error('Import service is unavailable');
      return loadImportHistory(connection, configuration);
    },
    enabled: Boolean(connection) && tab === 'history',
  });
  const visible =
    tab === 'history' || tab === 'exports'
      ? []
      : (catalogue.data ?? []).filter((release) => release.dataType === tab);
  const chosen = visible.filter((release) => selected.has(release.moduleName));
  const operation = useMutation({
    mutationFn: async (mode: 'validate' | 'install') => {
      if (
        !connection ||
        tab === 'history' ||
        tab === 'exports' ||
        chosen.length === 0
      ) {
        throw new Error('Select at least one available data release');
      }
      const plan = createPlan(tab, chosen);
      return mode === 'validate'
        ? preflightDataReleases(connection, configuration, plan)
        : installDataReleases(connection, configuration, plan);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['data-releases', props.runtime.enterpriseCode],
      });
    },
  });

  const changeTab = (next: typeof tab) => {
    setTab(next);
    setSelected(new Set());
    operation.reset();
  };

  return (
    <WorkspaceContainer>
      <Stack component="section" spacing={2.5} aria-labelledby="imports-exports-title">
        <Stack spacing={0.5}>
          <Typography component="h1" id="imports-exports-title" variant="h2">
            Imports and exports
          </Typography>
          <Typography color="text.secondary">
            Review immutable module data releases, validate a selected plan, and run
            only the operations authorized by Nodics.
          </Typography>
        </Stack>

        <Tabs
          aria-label="Import and export areas"
          onChange={(_, value: typeof tab) => changeTab(value)}
          value={tab}
          variant="scrollable"
        >
          <Tab label="Initialization data" value="init" />
          <Tab label="Core data" value="core" />
          <Tab label="Sample data" value="sample" />
          <Tab label="History" value="history" />
          <Tab label="Exports" value="exports" />
        </Tabs>

        {tab === 'exports' ? (
          <Alert severity="info">
            Export execution is not enabled. Nodics keeps this control unavailable until
            the governed export contract and provider implementations are complete.
          </Alert>
        ) : tab === 'history' ? (
          <Stack spacing={1.25}>
            <Alert severity="info">
              This is the secured Nodics import-run projection. Axis does not retain a
              browser-side audit log.
            </Alert>
            {history.isLoading ? (
              <CircularProgress aria-label="Loading import history" />
            ) : null}
            {history.isError ? (
              <Alert severity="error">{history.error.message}</Alert>
            ) : null}
            {history.isSuccess && history.data.length === 0 ? (
              <Alert severity="info">
                No import runs are available for this tenant.
              </Alert>
            ) : null}
            {history.data?.map((run) => (
              <Card key={run.runId} variant="outlined">
                <CardContent>
                  <Stack spacing={0.5}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
                    >
                      <Typography component="h2" variant="h6">
                        {run.dataType
                          ? `${run.dataType.toUpperCase()} data`
                          : 'Data import'}
                      </Typography>
                      <Chip label={run.status} size="small" />
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      {run.modules.length > 0
                        ? run.modules.join(', ')
                        : 'No module list recorded'}
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      Run {run.runId}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <>
            <Alert severity={tab === 'sample' ? 'warning' : 'info'}>
              <strong>{typeCopy[tab].label}.</strong> {typeCopy[tab].help}{' '}
              {typeCopy[tab].warning}
            </Alert>

            {!connection ? (
              <Alert severity="error">Import service is unavailable.</Alert>
            ) : null}
            {catalogue.isLoading ? (
              <Box sx={{ display: 'grid', minHeight: 240, placeItems: 'center' }}>
                <CircularProgress aria-label="Loading data releases" />
              </Box>
            ) : null}
            {catalogue.isError ? (
              <Alert severity="error">{catalogue.error.message}</Alert>
            ) : null}
            {catalogue.isSuccess && visible.length === 0 ? (
              <Alert severity="info">
                No active module publishes this data release type.
              </Alert>
            ) : null}

            <Stack spacing={1.25}>
              {visible.map((release) => {
                const checked = selected.has(release.moduleName);
                return (
                  <Card
                    key={`${release.dataType}:${release.moduleName}`}
                    variant="outlined"
                  >
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        sx={{ alignItems: { sm: 'center' }, gap: 2 }}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={release.status === 'RUNNING'}
                          slotProps={{
                            input: { 'aria-label': `Select ${release.displayName}` },
                          }}
                          onChange={() => {
                            const next = new Set(selected);
                            if (checked) next.delete(release.moduleName);
                            else next.add(release.moduleName);
                            setSelected(next);
                            operation.reset();
                          }}
                        />
                        <Stack sx={{ flex: 1 }} spacing={0.4}>
                          <Stack
                            direction="row"
                            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
                          >
                            <Typography component="h2" variant="h6">
                              {release.displayName}
                            </Typography>
                            <Chip
                              label={release.status.replaceAll('_', ' ')}
                              size="small"
                            />
                          </Stack>
                          <Typography color="text.secondary">
                            {release.description}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Available {release.version}
                            {release.installedVersion
                              ? ` · Installed ${release.installedVersion}`
                              : ''}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>

            <Divider />
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
              <Button
                disabled={operation.isPending || chosen.length === 0}
                onClick={() => operation.mutate('validate')}
                variant="outlined"
              >
                Validate selected
              </Button>
              <Button
                disabled={operation.isPending || chosen.length === 0}
                onClick={() => operation.mutate('install')}
                variant="contained"
              >
                {operation.isPending ? 'Working…' : 'Install or update selected'}
              </Button>
            </Stack>
            {operation.isError ? (
              <Alert severity="error">{operation.error.message}</Alert>
            ) : null}
            {operation.isSuccess ? (
              <Alert severity="success">
                {operation.data.releases.length} {typeCopy[tab].label.toLowerCase()}{' '}
                release(s) completed backend validation or installation.
              </Alert>
            ) : null}
          </>
        )}
      </Stack>
    </WorkspaceContainer>
  );
}
