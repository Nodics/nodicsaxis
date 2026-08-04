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
import { loadNotificationOperations } from './api/notificationOperationsClient';

interface NotificationManagementRoutePageProps {
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

const guidance = (schemaName: string | undefined) => {
  if (schemaName === 'notifyDeliveryRequest' || schemaName === 'notifyDeliveryAttempt')
    return 'Investigate the safe delivery timeline, normalized provider outcome, retry state, owner reference, and next permitted recovery action. Message content and provider payloads are intentionally unavailable.';
  if (schemaName === 'notifyTemplate' || schemaName === 'notifyTemplateVersion')
    return 'Preview with safe sample values, obtain independent approval, then publish or roll back through backend lifecycle actions. Active versions are immutable evidence.';
  if (schemaName === 'notifyProvider' || schemaName === 'notifyProviderAccount')
    return 'Review channel coverage, readiness, environment, health, retry policy, and secret references. Axis never receives provider credentials.';
  if (schemaName === 'notifyDeliveryPolicy')
    return 'Policies layer tenant and site rules for consent, quiet hours, rate limits, retry, fallback, and provider selection. Higher-priority customer policy remains backend-owned.';
  if (schemaName === 'notifyDeliverySuppression')
    return 'Suppression is a terminal policy outcome. Review its reason and consent evidence reference; do not resend by bypassing the owning policy.';
  if (schemaName === 'notifyVerificationChallenge')
    return 'Verification evidence exposes attempts, expiry, and status only. OTP values and provider secrets are never available in Axis.';
  return 'Use the backend-authorized lifecycle actions for this workspace. Axis presents policy and evidence but does not coordinate delivery owners or providers.';
};

export function NotificationManagementRoutePage(
  props: NotificationManagementRoutePageProps,
) {
  const navigate = useNavigate();
  const workspaces = props.bootstrap.navigation
    .filter((item) => item.route.startsWith('/notifications/'))
    .sort((a, b) => a.order - b.order);
  const connection = selectModuleConnection(props.bootstrap, 'notifyApi');
  const operations = useQuery({
    enabled: Boolean(connection),
    queryKey: [
      'notification-operations',
      props.bootstrap.tenantCode,
      props.runtime.enterpriseCode,
    ],
    queryFn: () => {
      if (!connection)
        throw new Error('Notification operations endpoint is unavailable');
      return loadNotificationOperations(
        connection,
        props.accessToken,
        props.runtime.enterpriseCode,
        props.runtime.requestTimeoutMs,
      );
    },
  });
  const schemaName = props.navigation.workbenchTarget?.schemaName;
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
              <Typography variant="overline">Notifications &amp; Messaging</Typography>
              <Typography variant="h4">{props.navigation.label}</Typography>
              <Typography color="text.secondary">
                {props.navigation.help?.summary ?? guidance(schemaName)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Chip label="Backend authorized" color="success" size="small" />
              <Chip label="Safe evidence only" size="small" />
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
          <Alert severity="info">{guidance(schemaName)}</Alert>
          {operations.data ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {Object.entries(operations.data.counts).map(([status, count]) => (
                <Chip
                  key={status}
                  color={
                    status === 'FAILED' || status === 'RETRY_SCHEDULED'
                      ? 'warning'
                      : 'default'
                  }
                  label={`${status.replaceAll('_', ' ')} ${String(count)}`}
                />
              ))}
              <Chip label={`${String(operations.data.windowHours)} hour window`} />
              {operations.data.bounded ? (
                <Chip color="warning" label="Bounded snapshot" />
              ) : null}
            </Stack>
          ) : operations.error ? (
            <Alert severity="warning">
              Diagnostics are unavailable or not permitted; individual permissioned
              workspaces remain usable.
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
      ) : null}
    </Stack>
  );
}
