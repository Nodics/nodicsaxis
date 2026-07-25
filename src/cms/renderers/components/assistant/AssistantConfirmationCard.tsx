import { Alert, Button, Chip, Stack, Typography } from '@mui/material';

import type { AssistantConfirmation } from '../../../../assistant/api/assistantContracts';

interface AssistantConfirmationCardProps {
  readonly confirmation: AssistantConfirmation;
  readonly result?: Readonly<Record<string, unknown>> | undefined;
  readonly title: string;
  readonly approveLabel: string;
  readonly executeLabel: string;
  readonly expiredLabel: string;
  readonly completedLabel: string;
  readonly onApprove: () => Promise<void>;
  readonly onExecute: () => Promise<void>;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function AssistantConfirmationCard(props: AssistantConfirmationCardProps) {
  const expired = props.confirmation.state === 'EXPIRED';
  const completed =
    props.confirmation.state === 'CONSUMED' || props.result?.state === 'CONSUMED';
  const displayState =
    typeof props.result?.state === 'string'
      ? props.result.state
      : props.confirmation.state;
  const summary =
    text(props.confirmation.impact.summary) ?? props.confirmation.operationId;

  return (
    <Alert
      severity={expired ? 'warning' : completed ? 'success' : 'info'}
      variant="outlined"
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Typography component="h3" sx={{ fontWeight: 700 }}>
            {props.title}
          </Typography>
          <Chip label={displayState} size="small" />
        </Stack>
        <Typography>{summary}</Typography>
        {expired ? <Typography>{props.expiredLabel}</Typography> : null}
        {completed ? <Typography>{props.completedLabel}</Typography> : null}
        {!expired && props.confirmation.state === 'PENDING' ? (
          <Button
            sx={{ alignSelf: 'flex-start' }}
            variant="contained"
            onClick={() => void props.onApprove()}
          >
            {props.approveLabel}
          </Button>
        ) : null}
        {!expired && !completed && props.confirmation.state === 'APPROVED' ? (
          <Button
            color="warning"
            sx={{ alignSelf: 'flex-start' }}
            variant="contained"
            onClick={() => void props.onExecute()}
          >
            {props.executeLabel}
          </Button>
        ) : null}
      </Stack>
    </Alert>
  );
}
