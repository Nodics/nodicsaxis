import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { WorkspaceContainer } from '../../app/shell/ShellPrimitives';
import {
  selectModuleConnection,
  type AxisAuthenticatedBootstrap,
} from '../../bootstrap/publicBootstrap';
import type { AxisRuntimeConfig } from '../../runtime/runtimeConfig';
import { importCoreData } from './api/coreDataClient';

interface CoreDataRoutePageProps {
  readonly accessToken: string;
  readonly bootstrap: AxisAuthenticatedBootstrap;
  readonly runtime: AxisRuntimeConfig;
}

export function CoreDataRoutePage(props: CoreDataRoutePageProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const connection = selectModuleConnection(props.bootstrap, 'system');
  const configuration = useMemo(
    () => ({
      accessToken: props.accessToken,
      enterpriseCode: props.runtime.enterpriseCode,
      modules: Object.keys(props.bootstrap.moduleConnections),
      timeoutMs: props.runtime.requestTimeoutMs,
    }),
    [
      props.accessToken,
      props.bootstrap.moduleConnections,
      props.runtime.enterpriseCode,
      props.runtime.requestTimeoutMs,
    ],
  );
  const coreImport = useMutation({
    mutationFn: () => {
      if (!connection) throw new Error('System import service is unavailable');
      return importCoreData(connection, configuration);
    },
    onSuccess: () => setConfirmationOpen(false),
  });

  return (
    <WorkspaceContainer>
      <Stack component="section" spacing={3} aria-labelledby="core-data-title">
        <Stack spacing={0.75}>
          <Typography component="h1" id="core-data-title" variant="h2">
            Core data
          </Typography>
          <Typography color="text.secondary">
            Install or update the baseline records contributed by active Nodics modules.
          </Typography>
        </Stack>

        <Alert severity="warning">
          Core import can create or update governed baseline records. Run it after
          installing modules or deploying changed core-data contributions—not on every
          server start.
        </Alert>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography component="h2" variant="h5">
                Environment core data
              </Typography>
              <Typography color="text.secondary">
                The backend discovers, validates, orders, and imports data through the
                existing nImport lifecycle. Axis does not read files or write the
                database directly.
              </Typography>
              <Button
                disabled={!connection || coreImport.isPending}
                onClick={() => {
                  coreImport.reset();
                  setConfirmationOpen(true);
                }}
                sx={{ alignSelf: 'flex-start' }}
                variant="contained"
              >
                {coreImport.isPending
                  ? 'Importing core data…'
                  : 'Import or update core data'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {!connection ? (
          <Alert severity="error">System import service is unavailable.</Alert>
        ) : null}
        {coreImport.isError ? (
          <Alert severity="error">{coreImport.error.message}</Alert>
        ) : null}
        {coreImport.data ? (
          <Alert severity="success">
            {coreImport.data.message} Sign out and sign in again so a new employee token
            and permission-filtered navigation can be issued.
          </Alert>
        ) : null}
      </Stack>

      <Dialog
        aria-labelledby="core-data-confirmation-title"
        onClose={() => {
          if (!coreImport.isPending) setConfirmationOpen(false);
        }}
        open={confirmationOpen}
      >
        <DialogTitle id="core-data-confirmation-title">
          Import or update core data?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Nodics will run the governed core import for the active environment and
            enterprise context. Existing authorization, validation, duplicate
            protection, and import diagnostics remain enforced by the backend.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={coreImport.isPending}
            onClick={() => setConfirmationOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={coreImport.isPending}
            onClick={() => coreImport.mutate()}
            variant="contained"
          >
            Confirm import
          </Button>
        </DialogActions>
      </Dialog>
    </WorkspaceContainer>
  );
}
