import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { WorkspaceContainer } from '../../app/shell/ShellPrimitives';
import {
  selectModuleConnection,
  type AxisAuthenticatedBootstrap,
  type AxisModuleAvailability,
} from '../../bootstrap/publicBootstrap';
import type { AxisRuntimeConfig } from '../../runtime/runtimeConfig';
import {
  loadModuleHealth,
  loadModuleHealthDetail,
  refreshModuleHealth,
} from './api/moduleHealthClient';
import { ModuleHealthTree } from './ModuleHealthTree';

interface ModuleHealthRoutePageProps {
  readonly accessToken: string;
  readonly bootstrap: AxisAuthenticatedBootstrap;
  readonly runtime: AxisRuntimeConfig;
}

function stateColor(
  state: AxisModuleAvailability | 'UP' | 'UNAVAILABLE' | 'UNKNOWN',
): 'success' | 'warning' | 'error' | 'default' {
  if (state === 'UP') return 'success';
  if (state === 'DEGRADED') return 'warning';
  if (state === 'UNAVAILABLE') return 'error';
  return 'default';
}

function displayName(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatTime(value: string | undefined): string {
  if (!value) return 'Not observed';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown'
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
}

export function ModuleHealthRoutePage(props: ModuleHealthRoutePageProps) {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>();
  const queryClient = useQueryClient();
  const connection = selectModuleConnection(props.bootstrap, 'backoffice');
  const configuration = useMemo(
    () => ({
      accessToken: props.accessToken,
      enterpriseCode: props.runtime.enterpriseCode,
      timeoutMs: props.runtime.requestTimeoutMs,
    }),
    [props.accessToken, props.runtime.enterpriseCode, props.runtime.requestTimeoutMs],
  );
  const modules = useQuery({
    enabled: Boolean(connection),
    queryKey: ['module-health', props.runtime.enterpriseCode],
    queryFn: () => {
      if (!connection) throw new Error('BackOffice is unavailable');
      return loadModuleHealth(connection, configuration);
    },
    refetchOnWindowFocus: true,
  });
  const detail = useQuery({
    enabled: Boolean(connection && selectedModule),
    queryKey: ['module-health', props.runtime.enterpriseCode, selectedModule],
    queryFn: () => {
      if (!connection || !selectedModule) {
        throw new Error('Select a module to inspect its runtime instances');
      }
      return loadModuleHealthDetail(connection, selectedModule, configuration);
    },
  });
  const refresh = useMutation({
    mutationFn: async () => {
      if (!connection || !selectedModule) throw new Error('Select a module first');
      await refreshModuleHealth(connection, selectedModule, configuration);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['module-health', props.runtime.enterpriseCode],
        }),
        queryClient.invalidateQueries({
          queryKey: ['module-health', props.runtime.enterpriseCode, selectedModule],
        }),
      ]);
    },
  });
  const filteredModules = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    if (!needle) return modules.data ?? [];
    return (modules.data ?? []).filter((module) =>
      [
        module.moduleName,
        module.displayName,
        module.canonicalIdentity,
        module.version,
        ...module.environments,
        ...module.servers,
        module.availability.state,
      ].some((value) => value?.toLocaleLowerCase().includes(needle)),
    );
  }, [modules.data, search]);
  const totals = useMemo(
    () =>
      (modules.data ?? [])
        .filter((module) => module.moduleKind !== 'group')
        .reduce(
          (result, module) => ({
            total: result.total + 1,
            healthy: result.healthy + (module.availability.state === 'UP' ? 1 : 0),
            degraded:
              result.degraded + (module.availability.state === 'DEGRADED' ? 1 : 0),
            unavailable:
              result.unavailable +
              (module.availability.state === 'UNAVAILABLE' ? 1 : 0),
            unknown: result.unknown + (module.availability.state === 'UNKNOWN' ? 1 : 0),
          }),
          { total: 0, healthy: 0, degraded: 0, unavailable: 0, unknown: 0 },
        ),
    [modules.data],
  );
  const refreshable = detail.data?.instances.some(
    (instance) => instance.clientCallable,
  );

  if (!connection) {
    return (
      <WorkspaceContainer>
        <Alert severity="error">BackOffice connection is unavailable.</Alert>
      </WorkspaceContainer>
    );
  }

  return (
    <WorkspaceContainer>
      <Stack component="section" spacing={3} aria-labelledby="module-health-title">
        <Stack spacing={0.75}>
          <Typography component="h1" id="module-health-title" variant="h2">
            Module health
          </Typography>
          <Typography color="text.secondary">
            Review registered Nodics modules and drill into their environment, server,
            node, heartbeat, and readiness observations.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {[
            ['Modules', totals.total, 'default'],
            ['Healthy', totals.healthy, 'success'],
            ['Degraded', totals.degraded, 'warning'],
            ['Unavailable', totals.unavailable, 'error'],
            ['Unknown', totals.unknown, 'default'],
          ].map(([label, value, color]) => (
            <Grid key={String(label)} size={{ xs: 6, sm: 4, lg: 2.4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {label}
                  </Typography>
                  <Typography color={`${String(color)}.main`} variant="h4">
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Alert severity="info">
          This view reports registered runtime instances. A fully expired or
          intentionally deregistered node is not presented as an active instance; Nodics
          does not infer expected cluster membership from this observed registry.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <Typography component="h2" variant="h5">
                      Registered modules
                    </Typography>
                    <Button onClick={() => void modules.refetch()} variant="outlined">
                      Refresh list
                    </Button>
                  </Stack>
                  <TextField
                    fullWidth
                    label="Search modules, servers, or states"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {modules.isPending ? (
                    <Stack sx={{ alignItems: 'center', py: 4 }}>
                      <CircularProgress aria-label="Loading module health" />
                    </Stack>
                  ) : modules.isError ? (
                    <Alert severity="error">{modules.error.message}</Alert>
                  ) : filteredModules.length === 0 ? (
                    <Alert severity="info">
                      No registered modules match this search.
                    </Alert>
                  ) : (
                    <ModuleHealthTree
                      modules={modules.data ?? []}
                      onSelect={setSelectedModule}
                      search={search}
                      selectedModule={selectedModule}
                      stateColor={stateColor}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Card variant="outlined">
              <CardContent>
                {!selectedModule ? (
                  <Stack sx={{ alignItems: 'center', py: 8 }} spacing={1}>
                    <Typography component="h2" variant="h5">
                      Select a module
                    </Typography>
                    <Typography color="text.secondary">
                      Runtime instance details will appear here.
                    </Typography>
                  </Stack>
                ) : detail.isPending ? (
                  <Stack sx={{ alignItems: 'center', py: 8 }}>
                    <CircularProgress aria-label="Loading runtime instances" />
                  </Stack>
                ) : detail.isError ? (
                  <Alert severity="error">{detail.error.message}</Alert>
                ) : detail.data ? (
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      sx={{ justifyContent: 'space-between' }}
                    >
                      <Box>
                        <Typography component="h2" variant="h5">
                          {displayName(
                            detail.data.displayName,
                            displayName(detail.data.moduleName, detail.data.moduleName),
                          )}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {detail.data.availability.activeInstances} registered runtime
                          instances
                        </Typography>
                      </Box>
                      <Button
                        disabled={refresh.isPending || refreshable !== true}
                        onClick={() => refresh.mutate()}
                        variant="contained"
                      >
                        {refresh.isPending ? 'Checking…' : 'Check now'}
                      </Button>
                    </Stack>
                    {refreshable === false ? (
                      <Alert severity="info">
                        This module has no client-callable runtime endpoint, so an
                        on-demand readiness check is not available. Its registration
                        heartbeat remains visible below.
                      </Alert>
                    ) : null}
                    {refresh.isError ? (
                      <Alert severity="error">{refresh.error.message}</Alert>
                    ) : null}
                    {detail.data.instances.length === 0 ? (
                      <Alert severity="warning">
                        No active runtime instances are registered.
                      </Alert>
                    ) : (
                      detail.data.instances.map((instance) => (
                        <Card key={instance.instanceId} variant="outlined">
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1}
                                sx={{ justifyContent: 'space-between' }}
                              >
                                <Box>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {displayName(instance.node, 'Default node')}
                                  </Typography>
                                  <Typography color="text.secondary" variant="body2">
                                    {displayName(
                                      instance.environment,
                                      'Unknown environment',
                                    )}
                                    {' · '}
                                    {displayName(instance.server, 'Unknown server')}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <Chip
                                    color={stateColor(instance.availability.state)}
                                    label={instance.availability.state}
                                    size="small"
                                  />
                                  <Chip
                                    label={instance.availability.freshness}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Stack>
                              </Stack>
                              <Divider />
                              <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography color="text.secondary" variant="caption">
                                    Last heartbeat
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatTime(instance.lastSeenAt)}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Typography color="text.secondary" variant="caption">
                                    Last readiness observation
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatTime(instance.availability.observedAt)}
                                  </Typography>
                                </Grid>
                              </Grid>
                              {instance.availability.reasonCode ? (
                                <Alert
                                  severity={
                                    instance.availability.state === 'UNAVAILABLE'
                                      ? 'error'
                                      : 'warning'
                                  }
                                >
                                  {displayName(
                                    instance.availability.reasonCode,
                                    instance.availability.reasonCode,
                                  )}
                                </Alert>
                              ) : null}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </WorkspaceContainer>
  );
}
