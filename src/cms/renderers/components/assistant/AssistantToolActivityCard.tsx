import { Chip, Paper, Stack, Typography } from '@mui/material';

import type { AssistantToolActivity } from '../../../../assistant/api/assistantContracts';

interface AssistantToolActivityCardProps {
  readonly activity: AssistantToolActivity;
  readonly title: string;
  readonly plannedLabel: string;
  readonly runningLabel: string;
  readonly succeededLabel: string;
  readonly failedLabel: string;
}

export function AssistantToolActivityCard({
  activity,
  title,
  plannedLabel,
  runningLabel,
  succeededLabel,
  failedLabel,
}: AssistantToolActivityCardProps) {
  const labels: Record<AssistantToolActivity['state'], string> = {
    PLANNED: plannedLabel,
    RUNNING: runningLabel,
    SUCCEEDED: succeededLabel,
    FAILED: failedLabel,
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography component="h3" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip label={labels[activity.state]} size="small" />
          <Chip label={activity.ownerModule} size="small" variant="outlined" />
          <Chip label={activity.operationId} size="small" variant="outlined" />
        </Stack>
        {activity.failureCode ? (
          <Typography color="error" variant="body2">
            {activity.failureCode}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
