import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import type {
  AxisAuthenticatedBootstrap,
  AxisNavigationItem,
} from '../../bootstrap/publicBootstrap';
import { selectModuleConnection } from '../../bootstrap/publicBootstrap';
import type { AxisRuntimeConfig } from '../../runtime/runtimeConfig';
import { WorkbenchRoutePage } from '../../workbench/WorkbenchRoutePage';
import { loadComplianceOperations } from './api/complianceOperationsClient';

interface ComplianceManagementRoutePageProps {
  readonly accessToken: string;
  readonly bootstrap: AxisAuthenticatedBootstrap;
  readonly channel: string;
  readonly cmsBaseUrl: string;
  readonly employeeId: string;
  readonly locale: string;
  readonly navigation: AxisNavigationItem;
  readonly runtime: AxisRuntimeConfig;
  readonly site: string;
}

/**
 * Consolidates backend-published compliance workspaces without moving policy,
 * permissions, lifecycle, evidence, or provider authority into Axis.
 */
export function ComplianceManagementRoutePage(
  props: ComplianceManagementRoutePageProps,
) {
  const navigate = useNavigate();
  const workspaces = props.bootstrap.navigation
    .filter(
      (item) =>
        item.parentId === 'compliance-management' &&
        item.parentModuleName === 'complianceCore',
    )
    .sort((left, right) => left.order - right.order);
  const isKycWorkspace = props.navigation.moduleName.toLowerCase().includes('kyc');
  const connection =
    selectModuleConnection(props.bootstrap, 'kycApi') ??
    selectModuleConnection(props.bootstrap, 'kycCore');
  const operations = useQuery({
    enabled: Boolean(connection),
    queryKey: [
      'compliance-operations',
      props.bootstrap.tenantCode,
      props.runtime.enterpriseCode,
    ],
    queryFn: () => {
      if (!connection) throw new Error('KYC operations endpoint is unavailable');
      return loadComplianceOperations(
        connection,
        props.accessToken,
        props.runtime.enterpriseCode,
        props.runtime.requestTimeoutMs,
      );
    },
  });
  const total = (values: Readonly<Record<string, number>> | undefined) =>
    Object.values(values ?? {}).reduce((sum, value) => sum + value, 0);

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="overline">Compliance Management</Typography>
              <Typography variant="h4">{props.navigation.label}</Typography>
              <Typography color="text.secondary">
                {props.navigation.help?.summary ??
                  'Operate permissioned compliance processes published by the backend.'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Chip label="Backend authorized" color="success" size="small" />
              <Chip label="Sensitive data masked" size="small" />
              <Chip label={props.navigation.availability} size="small" />
            </Stack>
          </Stack>
          <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
            {workspaces.map((item) => (
              <Button
                key={`${item.moduleName}:${item.id}`}
                size="small"
                variant={item.id === props.navigation.id ? 'contained' : 'outlined'}
                onClick={() => void navigate(item.route)}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
          {isKycWorkspace ? (
            <Alert severity="info">
              KYC cases follow Submit → Checks → Review → Maker/Checker → Decision →
              Eligibility. Provider payloads, document paths, credentials, and raw
              evidence are never displayed. Use the record detail panels for the
              timeline, checks, documents, decisions, provider attempts, and audit.
            </Alert>
          ) : null}
          {operations.data ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip label={`Cases ${String(total(operations.data.cases))}`} />
              <Chip label={`Open reviews ${String(total(operations.data.reviews))}`} />
              <Chip
                color={operations.data.sla.overdue > 0 ? 'warning' : 'success'}
                label={`Overdue SLA ${String(operations.data.sla.overdue)}`}
              />
              <Chip label={`Providers ${String(operations.data.providers.length)}`} />
              <Chip
                label={`Failed attempts ${String(operations.data.executionAttempts.FAILED ?? 0)}`}
              />
              {operations.data.bounded ? (
                <Chip color="warning" label="Bounded snapshot" />
              ) : null}
            </Stack>
          ) : operations.error ? (
            <Alert severity="warning">
              Operational summary is unavailable; individual permissioned workspaces
              remain usable.
            </Alert>
          ) : null}
        </Stack>
      </Paper>
      {props.navigation.workbenchTarget ? (
        <WorkbenchRoutePage
          accessToken={props.accessToken}
          bootstrap={props.bootstrap}
          channel={props.channel}
          cmsBaseUrl={props.cmsBaseUrl}
          employeeId={props.employeeId}
          locale={props.locale}
          routeNavigation={props.navigation}
          routeSchema={props.navigation.workbenchTarget}
          runtime={props.runtime}
          site={props.site}
        />
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6">Choose a permissioned workspace</Typography>
          <Typography color="text.secondary">
            Only capabilities returned by authenticated BackOffice discovery appear
            here. Missing workspaces are intentionally unavailable to this employee.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
