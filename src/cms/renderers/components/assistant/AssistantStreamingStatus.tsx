import { LinearProgress, Stack, Typography } from '@mui/material';

interface AssistantStreamingStatusProps {
  readonly label: string;
}

export function AssistantStreamingStatus({ label }: AssistantStreamingStatusProps) {
  return (
    <Stack
      aria-live="polite"
      role="status"
      spacing={1}
      sx={{ maxWidth: 360, width: '100%' }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <LinearProgress aria-label={label} />
    </Stack>
  );
}
